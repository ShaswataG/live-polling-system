// frontend/src/redux/participants/participantsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Participant } from '../../types/socket.types'

export interface ParticipantsState {
	students: Participant[]
}

const initialState: ParticipantsState = {
	students: [],
}

const participantsSlice = createSlice({
	name: 'participants',
	initialState,
	reducers: {
		setParticipants(state, action: PayloadAction<Participant[]>) {
			state.students = action.payload
		}
	}
})

export const { setParticipants } = participantsSlice.actions
export default participantsSlice.reducer