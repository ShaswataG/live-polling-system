import { useState, useEffect } from 'react';

interface TimerProps {
    timeLimit: number; // in seconds
    onTimeUp?: () => void;
}

export default function Timer({ timeLimit, onTimeUp }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    useEffect(() => {
        setTimeLeft(timeLimit);
    }, [timeLimit]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Color based on time remaining
    const getTimeColor = () => {
        const percentage = (timeLeft / timeLimit) * 100;
        if (percentage <= 25) return 'text-red-500'; // Red when <= 25% time left
        if (percentage <= 50) return 'text-orange-500'; // Orange when <= 50% time left
        return 'text-gray-700'; // Default color
    };

    return (
        <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
                <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span className={`font-mono text-sm font-medium ${getTimeColor()}`}>
                    {formatTime(timeLeft)}
                </span>
            </div>
        </div>
    );
}