import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import BadgeComponent from "../global/IntervuePollBadge"
import HeadingComponent from "../global/Heading"
import SelectDemo from "./components/Dropdown"
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { createQuestion, startQuestion } from '@/redux/socket/socketThunks'
import { useNavigate } from 'react-router-dom'

interface Option {
    id: string
    text: string
    isCorrect: boolean
}

export default function QuestionFormComponent() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { pollId } = useAppSelector(state => state.session)

    const [questionText, setQuestionText] = useState('')
    const [options, setOptions] = useState<Option[]>([
        { id: '1', text: '', isCorrect: false },
        { id: '2', text: '', isCorrect: false }
    ])
    const [timeLimit, setTimeLimit] = useState('60')
    const [isLoading, setIsLoading] = useState(false)

    const addOption = () => {
        if (options.length < 6) {
            setOptions([...options, {
                id: (options.length + 1).toString(),
                text: '',
                isCorrect: false
            }])
        }
    }

    const setCorrectOption = (id: string) => {
        setOptions(options.map(opt => ({
            ...opt,
            isCorrect: opt.id === id
        })))
    }

    const handleSubmit = async () => {
        if (!pollId || !questionText.trim()) {
            alert('Please enter a question')
            return
        }

        const filledOptions = options.filter(opt => opt.text.trim())
        if (filledOptions.length < 2) {
            alert('Please provide at least 2 options')
            return
        }

        const hasCorrectAnswer = filledOptions.some(opt => opt.isCorrect)
        if (!hasCorrectAnswer) {
            alert('Please select a correct answer')
            return
        }

        setIsLoading(true)

        try {
            // Format options for backend
            const formattedOptions = filledOptions.map(opt => ({
                optionId: opt.id,
                text: opt.text.trim(),
                isCorrect: opt.isCorrect
            }))

            // Create question via socket
            const result = await dispatch(createQuestion({
                pollId,
                text: questionText.trim(),
                options: formattedOptions,
                timeLimit: parseInt(timeLimit)
            })).unwrap()

            // Start the question immediately
            if ((result as any).question && (result as any).question._id) {
                await dispatch(startQuestion({
                    pollId,
                    questionId: (result as any).question._id
                }))
            }

            // Navigate to question view for teacher
            navigate(`/question/${pollId}`)
        } catch (error) {
            console.error('Error creating question:', error)
            alert('Failed to create question. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col justify-center gap-4 w-2/3 h-full p-4 relative">
            <div>
                <BadgeComponent />
                <HeadingComponent firstPart={"Let's Get "} secondPart={"Started"} />
                <p className="text-gray-500">
                    You'll have the ability to create and manage polls with questions, and monitor
                    your students' responses in real-time.
                </p>
            </div>

            <div className="flex flex-col gap-6 p-6 bg-whited">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <label className="text-sm font-medium">Enter your question</label>
                        </div>
                        <div>
                            <SelectDemo
                                value={timeLimit}
                                onValueChange={setTimeLimit}
                                placeholder={`${timeLimit} seconds`}
                            />
                        </div>
                    </div>
                    <div>
                        <Textarea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="What planet is known as the Red Planet?"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            rows={3}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex text-left font-semibold justify-between items-center">
                    <div className="w-3/5">
                        <p>Edit Options</p>
                    </div>
                    <div className="w-2/5">
                        <p>Is it Correct?</p>
                    </div>
                </div>

                <RadioGroup
                    value={options.find(opt => opt.isCorrect)?.id || ''}
                    onValueChange={setCorrectOption}
                >
                    {options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-4">
                            <div className="w-3/5 flex justify-center items-center gap-2">
                                <div className="w-[26px] h-[26px] rounded-full bg-[#7451B6] text-white p-0">
                                    <p className="w-full">{option.id}</p>
                                </div>
                                <Input type="text" placeholder={`Option ${option.id+1}`} className="w-full" value={option.text} onChange={(e) => {
                                    const updatedOptions = [...options];
                                    updatedOptions[index].text = e.target.value;
                                    setOptions(updatedOptions);
                                }} />
                            </div>
                            <div className="w-2/5 flex justify-start items-center gap-2">
                                <RadioGroup value={option.isCorrect ? "yes" : "no"} onValueChange={(value) => {
                                    const updatedOptions = options.map((opt, idx) => ({
                                        ...opt,
                                        isCorrect: idx === index ? value === "yes" : opt.isCorrect
                                    }));
                                    setOptions(updatedOptions);
                                }} className="flex flex-row gap-4">
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem className="w-[10px] border-10 border-[#7451B6]" value="yes" id={`option-${index}-yes`} />
                                        <Label htmlFor={`option-${index}-yes`}>Yes</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem className="border-10 border-[#7451B6] focus:ring-2 focus:ring-[#7451B6] focus:bg-[#7451B6]/10" value="no" id={`option-${index}-no`} />
                                        <Label htmlFor={`option-${index}-no`}>No</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    ))}
                </RadioGroup>

                {options.length < 6 && (
                    <Button
                        variant="outline"
                        onClick={addOption}
                        className="w-full border-dashed border-purple-400 text-purple-600 hover:bg-purple-50"
                    >
                        + Add more option
                    </Button>
                )}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={isLoading || !questionText.trim()}
                className="bg-gradient-to-r from-[#7565D9] to-[#4D0ACD] hover:from-[#6454C8] hover:to-[#3D09BC] disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl focus:outline-none px-8 py-2 text-white font-medium"
            >
                {isLoading ? 'Creating Question...' : 'Ask Question'}
            </Button>
        </div>
    )
}