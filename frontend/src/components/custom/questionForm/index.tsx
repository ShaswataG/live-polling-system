import { useState } from "react"
import BadgeComponent from "../global/IntervuePollBadge"
import HeadingComponent from "../global/Heading"
import Dropdown from "./components/Dropdown"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function Component() {
    const [newQuestion, setNewQuestion] = useState<{ text: string; options: any[], timeLimit: number }>({
        text: "",
        options: [],
        timeLimit: 60
    });

    return (
        <>
            <div className="flex flex-col justify-center gap-4 w-2/3 h-full p-4 relative">
                <div>
                    <BadgeComponent />
                    <HeadingComponent firstPart={"Let’s "} secondPart={"Get Started"} />
                    <p className="text-gray-500">you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
                </div>
                <div className="flex flex-col gap-6 p-6 bg-whited">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold">Enter your question</p>
                            </div>
                            <div>
                                <Dropdown value="60" onValueChange={(value) => console.log(value)} />
                            </div>
                        </div>
                        <div>
                            <Textarea placeholder="Type your question here..." className="w-full h-[100px] bg-[#F2F2F2] resize-none" />
                        </div>
                    </div>
                    <div>
                        <div className="flex text-left font-semibold justify-between items-center">
                            <div className="w-3/5">
                                <p>Edit Options</p>
                            </div>
                            <div className="w-2/5">
                                <p>Is it Correct?</p>
                            </div>
                        </div>
                        {
                            newQuestion.options.map((option, index) => (
                                <div key={index} className="flex justify-between items-center gap-4 my-2">
                                    <div className="w-3/5 flex justify-center items-center gap-2">
                                        <div className="w-[26px] h-[26px] rounded-full bg-[#7451B6] text-white p-0">
                                            <p className="w-full">{index+1}</p>
                                        </div>
                                        <Input type="text" placeholder={`Option ${index + 1}`} className="w-full" value={option.text} onChange={(e) => {
                                            const updatedOptions = [...newQuestion.options];
                                            updatedOptions[index].text = e.target.value;
                                            setNewQuestion({ ...newQuestion, options: updatedOptions });
                                        }} />
                                    </div>
                                    <div className="w-2/5 flex justify-start items-center gap-2">
                                        <RadioGroup value={option.isCorrect ? "yes" : "no"} onValueChange={(value) => {
                                            const updatedOptions = newQuestion.options.map((opt, idx) => ({
                                                ...opt,
                                                isCorrect: idx === index ? value === "yes" : opt.isCorrect
                                            }));
                                            setNewQuestion({ ...newQuestion, options: updatedOptions });
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
                            ))
                        }
                        <div className="flex justify-start mt-4">
                            <Button variant="default" className="text-[#7451B6] border-[#7451B6] border-6 bg-white hover:bg-hover" onClick={() => {
                                setNewQuestion({
                                    ...newQuestion,
                                    options: [...newQuestion.options, { optionId: `option-${newQuestion.options.length + 1}`, text: "", isCorrect: false }]
                                });
                            }}>+ Add Option
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end w-[86vw] mx-auto absolute bottom-8">
                    <Button className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] rounded-3xl focus:outline-none active:outline-none">
                        Ask Question
                    </Button>
                </div>
            </div>
        </>
    )
}