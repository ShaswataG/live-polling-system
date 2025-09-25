import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Component({ questionNo, text, timeLimit, options }: { questionNo: number; text: string; timeLimit: number; options: { optionId: number; text: string; isCorrect?: boolean }[] }) {
    const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

    return (
        <div className="flex flex-col gap-4 p-6 bg-whited">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Question {questionNo}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">{timeLimit} seconds</p>
                </div>
            </div>
            <div className="rounded-lg border-2 border-[#8F64E1] relative">
                <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] h-[48px] text-white flex border-inherit items-center px-4">
                    <p className="text-lg">{text}</p>
                </div>
                <div className="p-4">
                    <div className="flex flex-col gap-2">
                        {options.map((option) => (
                            <div key={option.optionId} className={"flex items-center gap-2 h-[50px] p-4 border rounded-lg cursor-pointer hover:bg-gray-100 " + (selectedOptionId === option.optionId ? "bg-white border-2 border-[#8F64E1]" : "bg-gray-200")} onClick={() => setSelectedOptionId(option.optionId)}>
                                <div className="w-[26px] h-[26px] rounded-full bg-[#7451B6] text-white p-0">
                                    <p className="w-full">{option.optionId}</p>
                                </div>
                                <p className="text-sm">{option.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end w-full mx-auto p-4">
                <Button className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] rounded-3xl focus:outline-none active:outline-none">
                    Submit
                </Button>
            </div>
        </div>
    )
}