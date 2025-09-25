// frontend/src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import sessionReducer from './session/sessionSlice'
import participantsReducer from './participants/participantsSlice'
import questionsReducer from './questions/questionSlice'
import pollReducer from './poll/pollSlice'

export const store = configureStore({
	reducer: {
		session: sessionReducer,
		participants: participantsReducer,
		questions: questionsReducer,
		poll: pollReducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch