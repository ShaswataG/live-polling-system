interface Option {
    optionId: string
    text: string
}

export interface Question {
    questionId: string
    text: string
    options: Option[]
    timeLimit: number // in seconds
}