// frontend/src/redux/questions/questionSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Question } from '../../types/question.types'
import type { LiveUpdateEvent, QuestionEndedEvent, QuestionStartedEvent, QuestionAdminEvent } from '../../types/socket.types'
import socketService from '../../lib/socket'
import type { RootState } from '../store'

export interface LiveState {
	counts: Record<string, number>
	percentages: Record<string, number>
	total: number
	expectedRespondents: number
}

export interface QuestionsState {
	questions: Question[]
	currentQuestion: Question | null
	currentAdminView: Question | null // teacher-only (may include isCorrect in options)
	live: LiveState | null
	submitted: boolean
	timerEndsAt: number | null
	error: string | null
}

const initialState: QuestionsState = {
	questions: [],
	currentQuestion: null,
	currentAdminView: null,
	live: null,
	submitted: false,
	timerEndsAt: null,
	error: null,
}

export const submitAnswer = createAsyncThunk(
	'questions/submitAnswer',
	async (payload: { pollId: string; questionId: string; clientId: string; optionId: string }, { getState }) => {
		socketService.submitAnswer(payload)
		const state = getState() as RootState
		return { questionId: payload.questionId, previousCounts: state.questions.live?.counts || {} }
	}
)

const questionsSlice = createSlice({
	name: 'questions',
	initialState,
	reducers: {
		setQuestionStarted(state, action: PayloadAction<QuestionStartedEvent>) {
			const q: Question = {
				questionId: action.payload.questionId,
				text: action.payload.text,
				options: action.payload.options,
				timeLimit: action.payload.timeLimit
			}
			state.currentQuestion = q
			state.submitted = false
			state.live = { counts: {}, percentages: {}, total: 0, expectedRespondents: 0 }
			state.timerEndsAt = Date.now() + (q.timeLimit * 1000)
		},
		setQuestionStartedAdmin(state, action: PayloadAction<QuestionAdminEvent>) {
			state.currentAdminView = {
				questionId: action.payload.questionId,
				text: action.payload.text,
				options: action.payload.options,
				timeLimit: action.payload.timeLimit
			}
		},
		setLiveUpdate(state, action: PayloadAction<LiveUpdateEvent>) {
			state.live = {
				counts: action.payload.counts,
				percentages: action.payload.percentages,
				total: action.payload.total,
				expectedRespondents: action.payload.expectedRespondents
			}
		},
		setQuestionEnded(state, action: PayloadAction<QuestionEndedEvent>) {
			state.live = {
				counts: action.payload.counts,
				percentages: action.payload.percentages,
				total: action.payload.total,
				expectedRespondents: action.payload.expectedRespondents
			}
			state.questions = [...state.questions, state.currentQuestion!].filter(Boolean as any)
		},
		markSubmitted(state) { state.submitted = true },
		resetSubmitted(state) { state.submitted = false },
		resetQuestionState(state) {
			state.currentQuestion = null
			state.currentAdminView = null
			state.live = null
			state.submitted = false
			state.timerEndsAt = null
			state.error = null
		}
	},
	extraReducers: builder => {
		builder.addCase(submitAnswer.fulfilled, (state) => {
			state.submitted = true
		})
	}
})

export const {
	setQuestionStarted,
	setQuestionStartedAdmin,
	setLiveUpdate,
	setQuestionEnded,
	markSubmitted,
	resetSubmitted,
	resetQuestionState
} = questionsSlice.actions
export default questionsSlice.reducer