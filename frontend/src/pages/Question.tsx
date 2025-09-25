import { useState } from 'react'
import Question from '../components/custom/global/Question'

export default function QuestionPage() {
    const [currQuestion, setCurrQuestion] = useState<{
        questionNo: number;
        text: string;
        timeLimit: number;
        options: {
            optionId: number;
            text: string;
            isCorrect?: boolean;
        }[]
    }>({
        questionNo: 0,
        text: "This is a sample question",
        timeLimit: 60,
        options: [
            {
                optionId: 1,
                text: "Option 1",
            },
            {
                optionId: 2,
                text: "Option 2",
            },
            {
                optionId: 3,
                text: "Option 3",
            },
            {
                optionId: 4,
                text: "Option 4",
            }
        ]
    })

    return (
        <>
            <div className='w-2/3 h-full'>
                <Question questionNo={currQuestion?.questionNo} text={currQuestion?.text} timeLimit={currQuestion?.timeLimit} options={currQuestion?.options} />
            </div>
        </>
    )
}