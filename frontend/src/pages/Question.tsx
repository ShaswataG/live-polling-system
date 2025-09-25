import { useAppSelector } from '@/redux/hooks'
import Question from '../components/custom/global/Question'
import WaitComponent from '../components/custom/global/Wait'

export default function QuestionPage() {
    const { currentQuestion } = useAppSelector(state => state.questions)

    return (
        <div className='flex justify-center items-center min-h-screen p-4'>
            {currentQuestion ? (
                <div className='w-full max-w-2xl'>
                    <Question
                        questionNo={1}
                        text={currentQuestion.text}
                        timeLimit={currentQuestion.timeLimit}
                        options={currentQuestion.options}
                    />
                </div>
            ) : (
                <WaitComponent />
            )}
        </div>
    )
}