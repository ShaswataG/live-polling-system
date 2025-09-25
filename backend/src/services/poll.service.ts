// src/services/poll.service.ts
// Business logic for polls/questions/answers/results.
// Uses Mongoose models. Designed to be DB-agnostic for easier future extension.

const mongoose = require('mongoose');
const logger = require('../utils/logger');
const Poll = require('../models/poll.model'); // adjust if your model exports differ
const Question = require('../models/question.model');
const Answer = require('../models/answer.model');
const QuestionStats = require('../models/questionStats.model');
const Session = require('../models/session.model');
const AuditLog = require('../models/auditLog.model');

const { Types } = require('mongoose');

class PollService {
  /**
   * Create a poll. For your current single-poll requirement we allow creating one poll,
   * but you can still create more for future multicongruent polls support.
   */
  static async createPoll({ pollId, title, teacherId, config = {} }: { pollId: string; title: string; teacherId?: string; config?: Record<string, any> }) {
    const poll = new Poll({
      pollId,
      title,
      teacherId: teacherId ? new mongoose.Types.ObjectId(teacherId) : undefined,
      config,
      status: 'active',
    });
    await poll.save();

    // audit
    await new AuditLog({ pollId: poll._id, actorType: 'teacher', action: 'create_poll', payload: { pollId } }).save();

    return poll;
  }

  static async getPollByPollId(pollId: string) {
    return Poll.findOne({ pollId });
  }

  static async getAllPolls() {
    return Poll.find().sort({ createdAt: -1 }).lean();
  }

  static async endPoll(pollId: string) {
    const poll = await Poll.findOne({ pollId });
    if (!poll) throw new Error('Poll not found');
    poll.status = 'closed';
    // end currently active question if any
    if (poll.currentQuestionId) {
      const q = await Question.findById(poll.currentQuestionId);
      if (q) {
        q.status = 'ended';
        q.endedAt = new Date();
        await q.save();
      }
      poll.currentQuestionId = null;
    }
    await poll.save();
    await new AuditLog({ pollId: poll._id, actorType: 'teacher', action: 'end_poll' }).save();
    return poll;
  }

  static async createQuestion(pollId: string, payload: {
    text: string;
    options: { optionId: string; text: string; isCorrect: boolean }[];
    timeLimit?: number;
  }) {
    // 1. Fetch poll
    const poll = await Poll.findOne({ pollId, status: "active" });
    if (!poll) {
      throw new Error("Poll not found or inactive");
    }

    // 2. If there is an active/unfinished question → block
    if (poll.currentQuestionId) {
      const lastQuestion = await Question.findById(poll.currentQuestionId);
      if (lastQuestion && lastQuestion.status !== "ended") {
        throw new Error("Previous question not completed yet");
      }

      // Check if all active students answered last question
      if (lastQuestion) {
        const activeStudents = await Session.countDocuments({ pollId });
        const answers = await Answer.countDocuments({ questionId: lastQuestion._id });
        if (answers < activeStudents) {
          throw new Error("Not all students have answered previous question");
        }
      }
    }

    // 3. Create new question
    const question = await Question.create({
      pollId,
      text: payload.text,
      options: payload.options,
      timeLimit: payload.timeLimit || poll.config.defaultTimeLimit,
      status: "active",
      startedAt: new Date(),
    });

    // 4. Update poll
    poll.currentQuestionId = question._id;
    await poll.save();

    return question;
  }

  static async startQuestion({ pollId, questionId }: { pollId: string; questionId: string }) {
    const poll = await Poll.findOne({ pollId });
    if (!poll) throw new Error('Poll not found');

    // Set previous active question to ended (if any)
    if (poll.currentQuestionId) {
      const prevQ = await Question.findById(poll.currentQuestionId);
      if (prevQ && prevQ.status === 'active') {
        prevQ.status = 'ended';
        prevQ.endedAt = new Date();
        await prevQ.save();
      }
    }

    const q = await Question.findById(questionId);
    if (!q) throw new Error('Question not found');

    q.status = 'active';
    q.startedAt = new Date();
    q.endedAt = null;
    await q.save();

    poll.currentQuestionId = q._id;
    await poll.save();

    await new AuditLog({ pollId: poll._id, actorType: 'teacher', action: 'start_question', payload: { questionId: q._id } }).save();

    return q;
  }

  static async endQuestion({ pollId, questionId, finalStats = null }: { pollId: string; questionId: string; finalStats?: { counts: Record<string, number>; total: number } | null }) {
    const poll = await Poll.findOne({ pollId });
    if (!poll) throw new Error('Poll not found');

    const q = await Question.findById(questionId);
    if (!q) throw new Error('Question not found');

    q.status = 'ended';
    q.endedAt = new Date();
    await q.save();

    if (poll.currentQuestionId && poll.currentQuestionId.equals(q._id)) {
      poll.currentQuestionId = null;
      await poll.save();
    }

    // Save final stats if provided (we use this mode per your requirement: write once after all students answered)
    if (finalStats) {
      const doc = {
        pollId: poll._id,
        questionId: q._id,
        counts: finalStats.counts,
        total: finalStats.total,
        lastUpdatedAt: new Date(),
      };
      await QuestionStats.findOneAndUpdate({ questionId: q._id }, doc, { upsert: true });
    }

    await new AuditLog({ pollId: poll._id, actorType: 'teacher', action: 'end_question', payload: { questionId: q._id } }).save();

    return q;
  }

  static async getResultsForQuestion(questionId: string) {
    const stats = await QuestionStats.findOne({ questionId });
    if (stats) return stats.toObject();
    // if not present, compute from answers (fallback)
    const pipeline = [
      { $match: { questionId: Types.ObjectId(questionId) } },
      { $group: { _id: '$optionId', count: { $sum: 1 } } }
    ];
    const raw = await Answer.aggregate(pipeline);
    const counts: Record<string, number> = {};
    let total = 0;
    for (const r of raw) {
      counts[r._id] = r.count;
      total += r.count;
    }
    return { counts, total };
  }

  static async getPollResults(pollId: string) {
    const poll = await Poll.findOne({ pollId });
    if (!poll) throw new Error('Poll not found');
    // get stats for all questions of this poll
    const stats = await QuestionStats.find({ pollId: poll._id }).lean();
    return stats;
  }

  static async registerSession({ clientId, displayName, pollId, socketId }: { clientId: string; displayName: string; pollId: string; socketId: string }) {
    if (!clientId) throw new Error('clientId required');
    const poll = await Poll.findOne({ pollId });
    if (!poll) throw new Error('Poll not found');

    // Upsert session
    const session = await Session.findOneAndUpdate(
      { clientId },
      { displayName, pollId: poll._id, socketId, lastSeenAt: new Date() },
      { upsert: true, new: true }
    );
    return session;
  }

  static async removeSessionByClientId(clientId: string) {
    return Session.deleteOne({ clientId });
  }

  static async listActiveStudentsForPoll(pollId: string) {
    const poll = await Poll.findOne({ pollId });
    if (!poll) throw new Error('Poll not found');

    return Session.find({ pollId: poll._id }).select('clientId displayName socketId lastSeenAt').lean();
  }
}

module.exports = PollService;