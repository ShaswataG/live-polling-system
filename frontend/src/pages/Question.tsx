import { useAppSelector } from '@/redux/hooks'
import Question from '../components/custom/global/Question'
import WaitComponent from '../components/custom/global/Wait'
import ConnectionStatus from '../components/custom/global/ConnectionStatus'

export default function QuestionPage() {
    const { currentQuestion, currentAdminView } = useAppSelector(state => state.questions)
    const { role } = useAppSelector(state => state.session)

    // Determine which question data to use based on role
    const questionData = role === 'teacher' ? currentAdminView || currentQuestion : currentQuestion

    return (
        <>
            <ConnectionStatus />
            <div className='flex justify-center items-center min-h-screen p-4'>
                {questionData ? (
                    <div className='w-full max-w-2xl'>
                        <Question
                            questionNo={1}
                            text={questionData.text}
                            timeLimit={questionData.timeLimit}
                            options={questionData.options}
                            isTeacher={role === 'teacher'}
                        />
                    </div>
                ) : (
                    <WaitComponent />
                )}
            </div>
        </>
    )
}