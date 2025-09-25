import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BadgeComponent from "@/components/custom/global/IntervuePollBadge"
import HeadingComponent from "@/components/custom/global/Heading"
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setDisplayName, setClientId, setPollId } from '@/redux/session/sessionSlice'
import { connectSocket, joinRoom } from '@/redux/socket/socketThunks'
import apiService from '@/services/api.service'

export default function NameEntry() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { role } = useAppSelector(state => state.session)
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleContinue = async () => {
        if (!name.trim() || !role) return

        setIsLoading(true)

        try {
            // Store name in localStorage and redux
            dispatch(setDisplayName(name.trim()))

            // Generate or get client ID
            let clientId = localStorage.getItem('clientId')
            if (!clientId) {
                clientId = crypto.randomUUID()
                dispatch(setClientId(clientId))
            }

            // For demo purposes, use a default poll ID or create one
            let pollId = localStorage.getItem('pollId')
            if (!pollId) {
                pollId = 'demo-poll'

                // Check if demo poll already exists (for both teachers and students)
                try {
                    await apiService.getPoll(pollId)
                    console.log('Demo poll already exists, joining existing poll')
                } catch (error) {
                    // Demo poll doesn't exist, create it
                    try {
                        const pollTitle = role === 'teacher' ? `${name.trim()}'s Poll` : 'Demo Poll'
                        await apiService.createPoll({
                            pollId: pollId,
                            title: pollTitle,
                        })
                        console.log('Created new demo poll')
                    } catch (createError) {
                        // Handle the case where poll was created by another user between our check and create
                        console.log('Poll was created by another user, proceeding with existing poll')
                    }
                }

                dispatch(setPollId(pollId))
            }

            // 1. Connect socket first
            await dispatch(connectSocket())

            // 2. Join the room via socket
            await dispatch(joinRoom({
                pollId,
                role,
                clientId,
                displayName: name.trim()
            }))

            // Navigate based on role
            if (role === 'teacher') {
                navigate('/create-question')
            } else {
                navigate(`/question/${pollId}`)
            }
        } catch (error) {
            console.error('Error joining room:', error)
            alert('Failed to join the polling system. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 max-w-[600px] mx-auto min-h-screen px-4">
            <BadgeComponent />
            <HeadingComponent firstPart={"Let's Get "} secondPart={"Started"} />
            <p className="text-gray-500 text-center max-w-md">
                {role === 'student'
                    ? "If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates"
                    : "As a teacher, you can create questions, start polls, and monitor student responses in real-time"
                }
            </p>

            <div className="w-full max-w-md">
                <label className="block text-sm font-medium mb-2">
                    Enter your Name
                </label>
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Bajaj"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && name.trim() && !isLoading) {
                            handleContinue()
                        }
                    }}
                />
            </div>

            <Button
                onClick={handleContinue}
                disabled={!name.trim() || isLoading}
                className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] hover:from-[#6454C8] hover:to-[#3D09BC] disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl focus:outline-none px-8 py-2 text-white font-medium"
            >
                {isLoading ? 'Joining...' : 'Continue'}
            </Button>
        </div>
    )
}