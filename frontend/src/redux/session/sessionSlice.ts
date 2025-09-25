// frontend/src/redux/session/sessionSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { getSocket } from '../../lib/socket'
import type { Role } from '../../types/socket.types'

export interface SessionState {
	pollId: string | null
	role: Role | null
	clientId: string | null
	displayName: string | null
	connected: boolean
	kicked: boolean
}

const initialState: SessionState = {
	pollId: null,
	role: null,
	clientId: null,
	displayName: null,
	connected: false,
	kicked: false,
}

export const joinRoom = createAsyncThunk(
	'session/joinRoom',
	async (payload: { pollId: string; role: Role; clientId: string; displayName: string }) => {
		const socket = getSocket()
		socket.emit('join_room', payload)
		return payload
	}
)

const sessionSlice = createSlice({
	name: 'session',
	initialState,
	reducers: {
		setConnected(state, action: PayloadAction<boolean>) { state.connected = action.payload },
		setKicked(state, action: PayloadAction<boolean>) { state.kicked = action.payload },
		resetSession(state) {
			Object.assign(state, initialState)
		}
	},
	extraReducers: builder => {
		builder.addCase(joinRoom.fulfilled, (state, action) => {
			state.pollId = action.payload.pollId
			state.role = action.payload.role
			state.clientId = action.payload.clientId
			state.displayName = action.payload.displayName
		})
	}
})

export const { setConnected, setKicked, resetSession } = sessionSlice.actions
export default sessionSlice.reducer