import { useState } from "react"
import { Button } from "@/components/ui/button"
import BadgeComponent from "@/components/custom/global/IntervuePollBadge"
import HeadingComponent from "@/components/custom/global/Heading"
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { setRole } from '@/redux/session/sessionSlice'

export default function Home() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null)

    const startFlow = () => {
        if (selectedRole) {
            dispatch(setRole(selectedRole))
            navigate('/name-entry')
        }
    }
    return (
        <>
            <div className="flex flex-col items-center justify-center gap-4 max-w-[600px] mx-auto">
                <BadgeComponent />
                <HeadingComponent firstPart={"Welcome to the "} secondPart={"Live Polling System"} />
                <p className="text-gray-500">Please select the role that best describes you to begin using the live polling system</p>
                <div className="flex justify-center items-center text-left w-full gap-4">
                    <div className={`cursor-pointer border-2 rounded-lg p-4 w-1/2 h-[140px] ${selectedRole === 'student' ? 'border-[#7765DA]' : 'border-gray-300'}`} onClick={() => setSelectedRole('student')}>
                        <p className="text-xl font-semibold">I’m a Student</p>
                        <p className="text-gray-600">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry
                        </p>
                    </div>
                    <div className={`cursor-pointer border-2 rounded-lg p-4 w-1/2 h-[140px] ${selectedRole === 'teacher' ? 'border-[#7765DA]' : 'border-gray-300'}`} onClick={() => setSelectedRole('teacher')}>
                        <p className="text-xl font-semibold">I’m a Teacher</p>
                        <p className="text-gray-600">
                            Submit answers and view live poll results in real-time.
                        </p>
                    </div>
                </div>
                <Button 
                    className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] rounded-3xl focus:outline-none active:outline-none"
                    disabled={!selectedRole}
                    onClick={() => {
                        if (selectedRole) {
                            startFlow()
                        }
                    }}
                >
                    Continue
                </Button>
            </div>
        </>
    )
}