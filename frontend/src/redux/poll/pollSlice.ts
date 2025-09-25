// frontend/src/redux/poll/pollSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { PollMeta, QuestionStatsDoc } from '../../types/poll.types'

export interface PollState {
	meta: PollMeta | null
	results: QuestionStatsDoc[]
	loading: boolean
	error: string | null
}

const initialState: PollState = {
	meta: null,
	results: [],
	loading: false,
	error: null
}

export const fetchPoll = createAsyncThunk('poll/fetchPoll', async (pollId: string) => {
	const res = await fetch(`/api/polls/${encodeURIComponent(pollId)}`)
	if (!res.ok) throw new Error('Failed to fetch poll')
	const data = await res.json()
	return data.data as PollMeta
})

export const fetchPollResults = createAsyncThunk('poll/fetchPollResults', async (pollId: string) => {
	const res = await fetch(`/api/polls/${encodeURIComponent(pollId)}/results`)
	if (!res.ok) throw new Error('Failed to fetch poll results')
	const data = await res.json()
	return data.data as QuestionStatsDoc[]
})

const pollSlice = createSlice({
	name: 'poll',
	initialState,
	reducers: {
		setPollMeta(state, action: PayloadAction<PollMeta | null>) { state.meta = action.payload }
	},
	extraReducers: builder => {
		builder
			.addCase(fetchPoll.pending, (s) => { s.loading = true; s.error = null })
			.addCase(fetchPoll.fulfilled, (s, a) => { s.loading = false; s.meta = a.payload })
			.addCase(fetchPoll.rejected, (s, a) => { s.loading = false; s.error = a.error.message || 'Error' })
			.addCase(fetchPollResults.fulfilled, (s, a) => { s.results = a.payload })
	}
})

export const { setPollMeta } = pollSlice.actions
export default pollSlice.reducer