// frontend/src/redux/socket/socketThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import socketService from '../../lib/socket'
import { setQuestionStarted, setQuestionStartedAdmin, setLiveUpdate, setQuestionEnded, markSubmitted, resetSubmitted } from '../questions/questionSlice'
import { setParticipants } from '../participants/participantsSlice'
import { setPollId } from '../session/sessionSlice'

export const connectSocket = createAsyncThunk(
  'socket/connect',
  async (serverUrl?: string) => {
    const socket = socketService.connect(serverUrl)
    return socket.id
  }
)

export const joinRoom = createAsyncThunk(
  'socket/joinRoom',
  async (payload: { pollId: string; role: string; clientId: string; displayName: string }, { dispatch }) => {
    socketService.joinRoom(payload)
    dispatch(setPollId(payload.pollId))
    return payload
  }
)

export const submitAnswer = createAsyncThunk(
  'socket/submitAnswer',
  async (payload: { pollId: string; questionId: string; clientId: string; optionId: string }, { dispatch }) => {
    socketService.submitAnswer(payload)
    dispatch(markSubmitted())
    return payload
  }
)

export const startQuestion = createAsyncThunk(
  'socket/startQuestion',
  async (payload: { pollId: string; questionId: string }) => {
    socketService.startQuestion(payload)
    return payload
  }
)

export const createQuestion = createAsyncThunk(
  'socket/createQuestion',
  async (payload: { pollId: string; text: string; options: any[]; timeLimit?: number }) => {
    return new Promise((resolve, reject) => {
      socketService.createQuestion(payload, (response) => {
        if (response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }
)

export const bindSocketListeners = createAsyncThunk(
  'socket/bindListeners',
  async (_, { dispatch }) => {
    // Connection events
    socketService.on('connect', () => {
      console.log('Socket connected')
    })

    // Join room response
    socketService.on('joined', (data: { pollId: string; clientId: string; currentQuestion?: any }) => {
      console.log('Joined room:', data)
      if (data.currentQuestion) {
        dispatch(setQuestionStarted({
          questionId: data.currentQuestion._id,
          text: data.currentQuestion.text,
          options: data.currentQuestion.options,
          timeLimit: data.currentQuestion.timeLimit
        }))
      }
    })

    // Question started
    socketService.on('question_started', (data: any) => {
      console.log('Question started:', data)
      dispatch(setQuestionStarted({
        questionId: data.questionId,
        text: data.text,
        options: data.options,
        timeLimit: data.timeLimit
      }))
      // Reset submitted state when new question starts
      dispatch(resetSubmitted())
    })

    // Question started (admin view for teachers)
    socketService.on('question_started_admin', (data: any) => {
      console.log('Question started (admin):', data)
      dispatch(setQuestionStartedAdmin({
        questionId: data.questionId,
        text: data.text,
        options: data.options,
        timeLimit: data.timeLimit
      }))
    })

    // New question created
    socketService.on('new_question', (data: any) => {
      console.log('New question created:', data)
    })

    // Live updates during question
    socketService.on('live_update', (data: { questionId: string; counts: Record<string, number>; total: number; percentages: Record<string, number> }) => {
      console.log('Live update:', data)
      dispatch(setLiveUpdate({
        questionId: data.questionId,
        counts: data.counts,
        percentages: data.percentages,
        total: data.total
      }))
    })

    // Question ended
    socketService.on('question_ended', (data: { questionId: string; counts: Record<string, number>; total: number; percentages: Record<string, number> }) => {
      console.log('Question ended:', data)
      dispatch(setQuestionEnded({
        questionId: data.questionId,
        counts: data.counts,
        percentages: data.percentages,
        total: data.total
      }))
    })

    // Participants update
    socketService.on('participants_update', (data: { students: Array<{ clientId: string; displayName: string; role: string }> }) => {
      console.log('Participants update:', data)
      // Cast role to proper Role type
      const participants = data.students.map(student => ({
        ...student,
        role: student.role as 'student' | 'teacher'
      }))
      dispatch(setParticipants(participants))
    })

    // Answer submission acknowledgment
    socketService.on('submit_ack', (data: { success: boolean; message?: string }) => {
      console.log('Submit acknowledgment:', data)
      if (data.success) {
        dispatch(markSubmitted())
      }
    })

    // Student kicked
    socketService.on('kicked', (data: { reason: string }) => {
      console.log('Kicked:', data)
      // Handle being kicked (redirect to error page, etc.)
      window.location.hash = '#/kicked'
    })

    // Error handling
    socketService.on('error', (data: { message: string }) => {
      console.error('Socket error:', data)
    })

    return true
  }
)