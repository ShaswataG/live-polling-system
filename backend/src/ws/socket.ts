const http = require('http');
const { Server } = require('socket.io');
const logger = require('../utils/logger');
const PollService = require('../services/poll.service');
const QuestionStats = require('../models/questionStats.model');
const Session = require('../models/session.model');
const Question = require('../models/question.model');
const Poll = require('../models/poll.model');
const AuditLog = require('../models/auditLog.model');

/**
 * In-memory runtime structures:
 * - activeAnswers[pollId][questionId] = { answers: Map(clientId -> optionId), counts: Map<optionId -> number>, timer }
 * - joinedClients[pollId] = Map(clientId -> { socketId, displayName })
 *
 * Note: for scaling across multiple Node instances, later replace this with Redis + socket.io-redis adapter
 */
const activeAnswers = new Map(); // pollId => Map(questionId => { answers: Map, counts: Map, total, timer })
const joinedClients = new Map(); // pollId => Map(clientId => { socketId, displayName })

const attachSocket = (server: any) => {
  const io = new Server(server, {
    cors: { origin: '*' },
    // you can add adapter here later (redis) for scaling
  });

  const sanitizeOptionsForStudents = (options: any[]) => {
    return (options || []).map((o: any) => ({ optionId: o.optionId, text: o.text }));
  };

  const emitToTeachers = (pollId: string, event: string, payload: any) => {
    const participants = joinedClients.get(pollId);
    if (!participants) return;
    for (const [, info] of participants.entries()) {
      if (info.role === 'teacher') {
        const s = io.sockets.sockets.get(info.socketId);
        if (s) s.emit(event, payload);
      }
    }
  };

  io.on('connection', (socket: any) => {
    logger.info(`Socket connected: ${socket.id}`);

    /**
     * join_room payload:
     * { pollId, role: 'student'|'teacher', clientId, displayName, teacherToken? }
     */
    socket.on('join_room', async (payload: any) => {
      try {
        const { pollId, role, clientId, displayName } = payload || {};
        if (!pollId || !clientId || !displayName) {
          socket.emit('error', { message: 'pollId, clientId and displayName required to join' });
          return;
        }

        // Ensure poll exists
          const poll = await PollService.getPollByPollId(pollId);
          if (!poll) {
            socket.emit('error', { message: 'Poll not found' });
            return;
          }

        // Register session in DB (upsert)
        await PollService.registerSession({ clientId, displayName, pollId, socketId: socket.id });

        socket.join(`poll:${pollId}`);

        // track joined client in memory
        if (!joinedClients.has(pollId)) joinedClients.set(pollId, new Map());
        joinedClients.get(pollId).set(clientId, { socketId: socket.id, displayName, role });    // doubt

        // Push back poll meta and current active question
        const currentQuestionId = poll.currentQuestionId ? poll.currentQuestionId.toString() : null;
        let currentQuestion = null;
        if (currentQuestionId) {
          currentQuestion = await Question.findById(currentQuestionId).lean();
          if (currentQuestion) {
            const isTeacher = role === 'teacher';
            currentQuestion = {
              ...currentQuestion,
              options: isTeacher ? currentQuestion.options : sanitizeOptionsForStudents(currentQuestion.options)
            };
          }
        }

        socket.emit('joined', { pollId, clientId, currentQuestion });

        // Broadcast updated participant list to teacher sockets only
        const students = Array.from(joinedClients.get(pollId).entries()).map((entry: any) => {
          console.log('entry', entry);
          const [cid, info] = entry;
          return { clientId: cid, displayName: info.displayName, role: info.role };
        });
        io.to(`poll:${pollId}`).emit('participants_update', { students });

      } catch (err) {
        logger.error('join_room error: ' + (err && (err as any).message));
        socket.emit('error', { message: 'Join failed' });
      }
    });

    /**
     * Teacher starts a question:
     * payload { pollId, questionId }
     *
     * Server marks question active, initializes in-memory counters, starts timer
     */
    socket.on('start_question', async (payload: any) => {
      try {
        const { pollId, questionId } = payload || {};
        if (!pollId || !questionId) {
          socket.emit('error', { message: 'pollId and questionId required' });
          return;
        }

        const question = await PollService.startQuestion({ pollId, questionId });
        // Initialize in-memory structures
        if (!activeAnswers.has(pollId)) activeAnswers.set(pollId, new Map());
        const pollAnswers = activeAnswers.get(pollId);

        // Prepare structure for this question
        const answerData: {
          answers: Map<any, any>,
          counts: Map<any, any>,
          total: number,
          timer: NodeJS.Timeout | null,
          ended: boolean
        } = {
          answers: new Map(), // clientId -> optionId
          counts: new Map(),  // optionId -> count (in-memory)
          total: 0,
          timer: null,
          ended: false
        };

        // initialize counts with options keys
        for (const opt of question.options) {
          answerData.counts.set(opt.optionId, 0);
        }

        pollAnswers.set(questionId, answerData);

        // Broadcast sanitized question to all participants (students don't see isCorrect)
        io.to(`poll:${pollId}`).emit('question_started', {
          questionId: question._id.toString(),
          text: question.text,
          options: sanitizeOptionsForStudents(question.options),
          timeLimit: question.timeLimit,
        });

        // Send admin view with isCorrect to teachers only
        emitToTeachers(pollId, 'question_started_admin', {
          questionId: question._id.toString(),
          text: question.text,
          options: question.options,
          timeLimit: question.timeLimit,
        });

        // start authoritative timer on server
        const timer = setTimeout(async () => {
          try {
            // on timer expiry, finalize question
            await finalizeQuestionDueToTimeout({ pollId, questionId, io });
          } catch (err) {
            logger.error('finalizeQuestionDueToTimeout error: ' + (err && (err as any).message));
          }
        }, (question.timeLimit || 60) * 1000);

        answerData.timer = timer;

      } catch (err) {
        logger.error('start_question error: ' + (err && (err as any).message));
        socket.emit('error', { message: 'start_question failed' });
      }
    });

    /**
     * Student submits answer:
     * payload { pollId, questionId, clientId, optionId }
     *
     * We only store in-memory counts and answers. When all current students answered, persist aggregated counts to DB.
     */
    socket.on('submit_answer', async (payload: any) => {
      try {
        const { pollId, questionId, clientId, optionId } = payload || {};
        if (!pollId || !questionId || !clientId || !optionId) {
          socket.emit('submit_ack', { success: false, message: 'Missing fields' });
          return;
        }

        // Ensure activeAnswers exist
        if (!activeAnswers.has(pollId) || !activeAnswers.get(pollId).has(questionId)) {
          socket.emit('submit_ack', { success: false, message: 'No active question or question expired' });
          return;
        }

        const qData = activeAnswers.get(pollId).get(questionId);
        if (qData.ended) {
          socket.emit('submit_ack', { success: false, message: 'Question already ended' });
          return;
        }

        // Prevent duplicate answer per client for this question
        if (qData.answers.has(clientId)) {
          socket.emit('submit_ack', { success: false, message: 'Already answered' });
          return;
        }

        // Record answer in-memory
        qData.answers.set(clientId, optionId);
        qData.total += 1;
        qData.counts.set(optionId, (qData.counts.get(optionId) || 0) + 1);

        socket.emit('submit_ack', { success: true });

        // Calculate expected respondents (active students)
        const participantsMap = joinedClients.get(pollId) || new Map();
        let expectedRespondents = 0;
        for (const [cid, info] of participantsMap.entries()) {
          if (info.role !== 'teacher') expectedRespondents += 1;
        }

        // Broadcast live_update (percentages) using in-memory counts
        const percentages: Record<string, number> = {};
        for (const [optId, cnt] of qData.counts.entries()) {
          percentages[optId] = qData.total > 0 ? Math.round((cnt / qData.total) * 100) : 0;
        }

        io.to(`poll:${pollId}`).emit('live_update', { 
          questionId, 
          counts: Object.fromEntries(qData.counts), 
          total: qData.total, 
          percentages,
          expectedRespondents
        });

        // Check if all current students have answered
        // If expected is zero (no students), we should wait until timer expiry to persist (or you might persist zero).
        if (expectedRespondents > 0 && qData.total >= expectedRespondents) {
          // All students answered—persist aggregated stats, end question, broadcast final results
          await persistFinalStatsAndEndQuestion({ pollId, questionId, io });
        }

      } catch (err) {
        logger.error('submit_answer error: ' + (err && (err as any).message));
        socket.emit('submit_ack', { success: false, message: 'submit failed' });
      }
    });

    /**
     * Teacher can manually end a question before timer expiry:
     * payload { pollId, questionId }
     */
    socket.on('end_question', async (payload: any) => {
      try {
        const { pollId, questionId } = payload || {};
        if (!pollId || !questionId) {
          socket.emit('error', { message: 'pollId and questionId required' });
          return;
        }

        await persistFinalStatsAndEndQuestion({ pollId, questionId, io });
        socket.emit('end_ack', { success: true });
      } catch (err) {
        logger.error('end_question error: ' + (err && (err as any).message));
        socket.emit('end_ack', { success: false, message: 'end_question failed' });
      }
    });

    /**
     * Kick student: payload { pollId, clientId }
     * Removes session and forces disconnect for their socket (if connected).
     */
    socket.on('kick_student', async (payload: any) => {
      try {
        const { pollId, clientId } = payload || {};
        if (!pollId || !clientId) {
          socket.emit('error', { message: 'pollId and clientId required' });
          return;
        }

        // Remove from in-memory participants and DB sessions
        const participants = joinedClients.get(pollId);
        if (participants && participants.has(clientId)) {
          const info = participants.get(clientId);
          // disconnect socket if found
          try {
            const targetSocket = io.sockets.sockets.get(info.socketId);
            if (targetSocket) {
              targetSocket.emit('kicked', { reason: 'removed_by_teacher' });
              targetSocket.disconnect(true);
            }
          } catch (e) {
            // ignore
          }
          participants.delete(clientId);
        }

        // Remove DB session
        await PollService.removeSessionByClientId(clientId);

        io.to(`poll:${pollId}`).emit('participants_update', {
          students: Array.from((joinedClients.get(pollId) || new Map()).entries()).map(
            (entry) => {
              const [cid, i] = entry as [any, any];
              return { 
                clientId: cid, 
                displayName: i.displayName, 
                role: i.role 
              };
            })
        });

        await new AuditLog({ action: 'kick_student', pollId: null, actorType: 'teacher', payload: { clientId } }).save();
      } catch (err) {
        logger.error('kick_student error: ' + (err && (err as any).message));
      }
    });

    socket.on('disconnect', async () => {
      try {
        logger.info(`Socket disconnected: ${socket.id}`);
        // find client in joinedClients and remove
        for (const [pollId, map] of joinedClients.entries()) {
          for (const [clientId, info] of map.entries()) {
            if (info.socketId === socket.id) {
              map.delete(clientId);
              // update session in DB (remove or mark lastSeen)
              await Session.findOneAndUpdate({ clientId }, { socketId: null, lastSeenAt: new Date() });
              // broadcast updated participant list
              io.to(`poll:${pollId}`).emit('participants_update', {
                students: Array.from((joinedClients.get(pollId) || new Map()).entries()).map(
                  (entry) => {
                    const [cid, i] = entry as [any, any];
                    return { 
                      clientId: cid, 
                      displayName: i.displayName, 
                      role: i.role 
                    }; 
                })
              });
              break;
            }
          }
        }
      } catch (err) {
        logger.error('disconnect handler error: ' + (err && (err as any).message));
      }
    });

    socket.on("teacher:create_question", async ({ pollId, text, options, timeLimit }: { pollId: string; text: string; options: any[]; timeLimit?: number }, cb?: (response: any) => void) => {
      try {
        const question = await PollService.createQuestion(pollId, { text, options, timeLimit });
        
        // Broadcast question_started to all participants (students get sanitized options)
        io.to(`poll:${pollId}`).emit("question_started", {
          questionId: question._id.toString(),
          text: question.text,
          options: sanitizeOptionsForStudents(question.options),
          timeLimit: question.timeLimit,
        });

        // Send admin view with isCorrect to teachers only
        emitToTeachers(pollId, 'question_started_admin', {
          questionId: question._id.toString(),
          text: question.text,
          options: question.options, // Teachers get full options with isCorrect
          timeLimit: question.timeLimit,
        });

        cb?.({ success: true, question }); // safe optional callback
      } catch (err: any) {
        cb?.({ error: err.message || "Failed to create question" });
      }
    });

    // safe helper functions used below are defined outside to keep handler code small
  });

  logger.info('Socket.IO attached');
  return io;
};

/**
 * FINALIZE helper: persist aggregated stats and end question
 * Writes to QuestionStats collection once (no per-answer DB updates)
 */
async function persistFinalStatsAndEndQuestion({ pollId, questionId, io }: { pollId: string, questionId: string, io: any }) {
  // Guard
  if (!activeAnswers.has(pollId) || !activeAnswers.get(pollId).has(questionId)) {
    logger.warn('persistFinalStatsAndEndQuestion: no in-memory data');
    // still mark question ended in DB
    await PollService.endQuestion({ pollId, questionId, finalStats: null });
    io.to(`poll:${pollId}`).emit('question_ended', { questionId, counts: {}, total: 0, percentages: {}, expectedRespondents: 0 });
    return;
  }

  const qData = activeAnswers.get(pollId).get(questionId);
  if (qData.ended) return;

  // mark ended to prevent double writes
  qData.ended = true;
  // clear timer if present
  if (qData.timer) {
    clearTimeout(qData.timer);
    qData.timer = null;
  }

  // Build final counts object
  const countsObj: Record<string, number> = {};
  for (const [k, v] of qData.counts.entries()) countsObj[k] = v;
  const finalStats = { counts: countsObj, total: qData.total };

  // Persist aggregated stats exactly once
  try {
    await PollService.endQuestion({ pollId, questionId, finalStats });
    // persist also full answers to answers collection if you want (optional):
    // we can optionally insert per-answer docs for storage/search; user requested storing distribution only
    // Broadcast final results
    // percentages
    const percentages: Record<string, number> = {};
    for (const k in countsObj) {
      const count = countsObj[k] ?? 0;
      percentages[k] = finalStats.total > 0 ? Math.round((count / finalStats.total) * 100) : 0;
    }
    
    // Calculate expected respondents
    const participantsMap = joinedClients.get(pollId) || new Map();
    let expectedRespondents = 0;
    for (const [cid, info] of participantsMap.entries()) {
      if (info.role !== 'teacher') expectedRespondents += 1;
    }
    
    io.to(`poll:${pollId}`).emit('question_ended', { 
      questionId, 
      counts: countsObj, 
      total: finalStats.total, 
      percentages,
      expectedRespondents
    });

    // Remove in-memory buffer for this question (keep if you want to allow late-joins to view)
    activeAnswers.get(pollId).delete(questionId);
  } catch (err) {
    logger.error('persistFinalStatsAndEndQuestion error: ' + (err && (err as any).message));
  }
}

/**
 * Finalize due to timeout
 */
async function finalizeQuestionDueToTimeout({ pollId, questionId, io }: { pollId: string, questionId: string, io: any }) {
  logger.info(`Question timer expired for poll=${pollId} question=${questionId}`);
  await persistFinalStatsAndEndQuestion({ pollId, questionId, io });
}

module.exports = { attachSocket, activeAnswers, joinedClients };
