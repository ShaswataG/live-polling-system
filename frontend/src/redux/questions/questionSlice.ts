import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Question } from '../../types/question.types';

const initialState = {
    questions: [] as Question[],
    currentQuestion: null as Question | null,
    loading: false,
    error: null as string | null,
};

const questionSlice = createSlice({
    name: 'questions',
    initialState,
    reducers: {
    },
});

export const {} = questionSlice.actions;
export default questionSlice.reducer;
