import { Button } from "@/components/ui/button"
import BadgeComponent from "@/components/custom/global/IntervuePollBadge"
import HeadingComponent from "@/components/custom/global/Heading"
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { emitJoinRoom } from '@/redux/socket/socketThunks'
import { joinRoom } from '@/redux/session/sessionSlice'

export default function Home() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const startFlow = (role: 'student' | 'teacher') => {
        const clientId = localStorage.getItem('clientId') || crypto.randomUUID()
        localStorage.setItem('clientId', clientId)
        const displayName = localStorage.getItem('displayName') || (role === 'teacher' ? 'Teacher' : 'Student')
        const pollId = localStorage.getItem('pollId') || 'demo'
        dispatch(joinRoom({ pollId, role, clientId, displayName }))
        dispatch(emitJoinRoom({ pollId, role, clientId, displayName }))
        if (role === 'teacher') navigate('/create-question')
        else navigate('/question/current')
    }
    return (
        <>
            <div className="flex flex-col items-center justify-center gap-4 max-w-[600px] mx-auto">
                <BadgeComponent />
                <HeadingComponent firstPart={"Welcome to the "} secondPart={"Live Polling System"} />
                <p className="text-gray-500">Please select the role that best describes you to begin using the live polling system</p>
                <div className="flex justify-center items-center text-left w-full gap-4">
                    <div className="cursor-pointer" onClick={() => startFlow('student')}>
                        <p className="text-xl font-semibold">I’m a Student</p>
                        <p className="text-gray-600">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry
                        </p>
                    </div>
                    <div className="cursor-pointer" onClick={() => startFlow('teacher')}>
                        <p className="text-xl font-semibold">I’m a Teacher</p>
                        <p className="text-gray-600">
                            Submit answers and view live poll results in real-time.
                        </p>
                    </div>
                </div>
                <Button className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] rounded-3xl focus:outline-none active:outline-none">
                    Continue
                </Button>
            </div>
        </>
    )
}