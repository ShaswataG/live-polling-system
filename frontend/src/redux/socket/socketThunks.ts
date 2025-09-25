// frontend/src/redux/socket/socketThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { getSocket, ensureSocketConnected } from '../../lib/socket'
import { setConnected, setKicked } from '../session/sessionSlice'
import { setParticipants } from '../participants/participantsSlice'
import { setQuestionStarted, setQuestionStartedAdmin, setLiveUpdate, setQuestionEnded } from '../questions/questionSlice'
import type { JoinRoomPayload, QuestionAdminEvent, QuestionStartedEvent, LiveUpdateEvent, QuestionEndedEvent } from '../../types/socket.types'

let listenersBound = false

export const bindSocketListeners = createAsyncThunk('socket/bind', async (_, { dispatch }) => {
	if (listenersBound) return
	const socket = getSocket()

	ensureSocketConnected(() => dispatch(setConnected(true)))
	socket.on('connect', () => dispatch(setConnected(true)))
	socket.on('disconnect', () => dispatch(setConnected(false)))

	socket.on('kicked', () => {
		dispatch(setKicked(true))
		socket.disconnect()
	})

	socket.on('participants_update', (payload: { students: any[] }) => {
		dispatch(setParticipants(payload.students || []))
	})

	socket.on('question_started', (payload: QuestionStartedEvent) => {
		dispatch(setQuestionStarted(payload))
	})

	socket.on('question_started_admin', (payload: QuestionAdminEvent) => {
		dispatch(setQuestionStartedAdmin(payload))
	})

	socket.on('live_update', (payload: LiveUpdateEvent) => {
		dispatch(setLiveUpdate(payload))
	})

	socket.on('question_ended', (payload: QuestionEndedEvent) => {
		dispatch(setQuestionEnded(payload))
	})

	listenersBound = true
})

export const emitJoinRoom = createAsyncThunk('socket/join', async (payload: JoinRoomPayload) => {
	const socket = getSocket()
	socket.emit('join_room', payload)
})