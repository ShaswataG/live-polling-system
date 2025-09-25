import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { submitAnswer } from "@/redux/socket/socketThunks";
import Timer from "./Timer";
import type { Option } from "@/types/question.types";

interface QuestionProps {
    questionNo: number;
    text: string;
    timeLimit: number;
    options: Option[];
    isTeacher?: boolean;
}

export default function Component({ questionNo, text, timeLimit, options, isTeacher = false }: QuestionProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const { pollId, clientId } = useAppSelector(state => state.session);
    const { submitted, currentQuestion, live } = useAppSelector(state => state.questions);

    // Determine when to show percentages
    const showPercentages = isTeacher || submitted;
    const percentages = live?.percentages || {};
    // const total = live?.total || 0;

    // Check if all students have submitted (for teacher button)
    const allStudentsSubmitted = live ?
        (live.expectedRespondents === 0 || live.total >= live.expectedRespondents) :
        false;

    const handleSubmit = () => {
        if (!selectedOptionId || !pollId || !clientId || submitted || !currentQuestion) return;

        dispatch(submitAnswer({
            pollId,
            questionId: currentQuestion.questionId,
            clientId,
            optionId: selectedOptionId
        }));
    };

    const getPercentageColor = (isSelected: boolean, isCorrect?: boolean) => {
        if (isTeacher && isCorrect) {
            return 'bg-green-500'; // Green for correct answer (teacher view)
        }
        if (isSelected) {
            return 'bg-[#6766D5]'; // Purple for selected option
        }
        return 'bg-[#7451B6]'; // Default purple
    };

    return (
        <div className="flex flex-col gap-4 p-6 bg-white">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-semibold">Question {questionNo}</p>
                </div>
                <div className="flex items-center gap-4">
                    {!isTeacher && (
                        <Timer timeLimit={timeLimit} />
                    )}
                    <div>
                        <p className="text-sm text-gray-500">{timeLimit} seconds</p>
                    </div>
                </div>
            </div>
            <div className="rounded-lg border-2 border-[#8F64E1] relative">
                <div className="bg-gradient-to-r from-[#343434] to-[#6E6E6E] h-[48px] text-white flex border-inherit items-center px-4">
                    <p className="text-lg">{text}</p>
                </div>
                <div className="p-4">
                    <div className="flex flex-col gap-2">
                        {options.map((option, index) => {
                            const percentage = percentages[option.optionId] || 0;
                            const isSelected = selectedOptionId === option.optionId;
                            const isCorrect = isTeacher && option.isCorrect;

                            return (
                                <div
                                    key={option.optionId}
                                    className={`relative flex items-center gap-2 h-[50px] p-4 border rounded-lg cursor-pointer hover:bg-gray-100 overflow-hidden ${isSelected ? "bg-white border-2 border-[#8F64E1]" : "bg-gray-200"
                                        }`}
                                    onClick={() => !submitted && setSelectedOptionId(option.optionId)}
                                >
                                    {/* Percentage Bar Background */}
                                    {showPercentages && percentage > 0 && (
                                        <div
                                            className={`absolute left-0 top-0 h-full opacity-30 transition-all duration-300 ${getPercentageColor(isSelected, isCorrect)}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    )}

                                    {/* Option Content */}
                                    <div className="relative z-10 flex items-center gap-2 w-full">
                                        <div className="w-[26px] h-[26px] rounded-full bg-[#7451B6] text-white flex items-center justify-center text-sm">
                                            <p>{index + 1}</p>
                                        </div>
                                        <p className="text-sm flex-1">{option.text}</p>
                                        {showPercentages && (
                                            <div className="flex items-center gap-2">
                                                {isTeacher && isCorrect && (
                                                    <span className="text-green-600 font-semibold text-xs">✓</span>
                                                )}
                                                <span className="text-sm font-semibold">{percentage}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Show total responses count */}
                    {/* {showPercentages && total > 0 && (
                        <div className="mt-2 text-center text-sm text-gray-600">
                            {total} response{total !== 1 ? 's' : ''} received
                        </div>
                    )} */}
                </div>
            </div>
            <div className="flex justify-center w-full mx-auto p-4 gap-4">
                {!isTeacher && !submitted && (
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedOptionId}
                        className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] hover:from-[#7454C8] hover:to-[#1557AC] disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl focus:outline-none active:outline-none px-8 py-2"
                    >
                        Submit
                    </Button>
                )}

                {!isTeacher && submitted && (
                    <div className="text-center text-gray-600">
                        <p className="mb-4">Wait for the teacher to ask a new question...</p>
                    </div>
                )}

                {isTeacher && (
                    <Button
                        onClick={() => navigate('/create-question')}
                        disabled={!allStudentsSubmitted}
                        className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] hover:from-[#7454C8] hover:to-[#1557AC] disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl focus:outline-none active:outline-none px-8 py-2"
                    >
                        + Ask a new question
                    </Button>
                )}
            </div>
        </div>
    )
}