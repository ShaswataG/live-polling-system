import { useState, useEffect } from 'react';
import socketService from '@/lib/socket';

export default function ConnectionStatus() {
    const [isConnected, setIsConnected] = useState(false);
    const [showStatus, setShowStatus] = useState(false);

    useEffect(() => {
        const checkConnection = () => {
            const connected = socketService.isConnected;
            setIsConnected(connected);

            // Only show status if disconnected or just reconnected
            if (!connected) {
                setShowStatus(true);
            } else if (showStatus && connected) {
                // Hide status after 2 seconds when reconnected
                setTimeout(() => setShowStatus(false), 2000);
            }
        };

        // Check connection status every 2 seconds
        const interval = setInterval(checkConnection, 2000);
        checkConnection(); // Initial check

        return () => clearInterval(interval);
    }, [showStatus]);

    if (!showStatus) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium ${isConnected
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}>
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-200' : 'bg-red-200 animate-pulse'
                    }`} />
                {isConnected ? 'Connected' : 'Connection lost - reconnecting...'}
            </div>
        </div>
    );
}