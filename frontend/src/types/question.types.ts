// frontend/src/types/question.types.ts  (augment existing)
export interface Option {
	optionId: string
	text: string
	// teacher-only info is never shown to students (but typed here for admin views)
	isCorrect?: boolean
}

export interface Question {
	questionId: string
	text: string
	options: Option[]
	timeLimit: number // in seconds
}