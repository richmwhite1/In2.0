'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
    deadline: Date;
    onExpire?: () => void;
}

export default function CountdownTimer({ deadline, onExpire }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const deadlineTime = new Date(deadline).getTime();
            const remaining = Math.max(0, deadlineTime - now);
            setTimeRemaining(remaining);

            if (remaining === 0 && onExpire) {
                onExpire();
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [deadline, onExpire]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    const isUrgent = timeRemaining < 3600000; // Less than 1 hour

    if (timeRemaining === 0) {
        return (
            <div className="flex items-center gap-2 text-red-400">
                <Clock size={14} />
                <span className="text-xs font-bold">Voting Closed</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${isUrgent ? 'text-orange-400' : 'text-white/60'}`}>
            <Clock size={14} />
            <span className="text-xs font-bold">
                {isUrgent && '⚠️ '}
                {formatTime(timeRemaining)} left
            </span>
        </div>
    );
}
