'use client';

import { useState, useEffect } from 'react';
import { getNextEvent } from '@/lib/actions';

export type SocialState = 'PLANNING' | 'LOGISTICS' | 'ACTIVE' | 'FOLLOW_UP';

interface SocialContextData {
    state: SocialState;
    nextEvent: any | null;
    timeLeft: string; // Formatted string like "45m" or "2h 15m"
    isUrgent: boolean; // T < 2h
    isLoading: boolean;
}

export function useSocialContext(): SocialContextData {
    const [data, setData] = useState<SocialContextData>({
        state: 'PLANNING',
        nextEvent: null,
        timeLeft: '',
        isUrgent: false,
        isLoading: true
    });

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const fetchData = async () => {
            try {
                const { event } = await getNextEvent();

                // Initial calculation
                updateState(event);

                // Start timer if we have an event
                if (event) {
                    intervalId = setInterval(() => updateState(event), 60000); // UI updates every minute
                }
            } catch (error) {
                console.error("Failed to fetch social context:", error);
                setData(prev => ({ ...prev, isLoading: false }));
            }
        };

        const updateState = (event: any) => {
            if (!event) {
                setData({
                    state: 'PLANNING',
                    nextEvent: null,
                    timeLeft: '',
                    isUrgent: false,
                    isLoading: false
                });
                return;
            }

            const now = new Date();
            const eventTime = new Date(event.date);
            const diffMs = eventTime.getTime() - now.getTime();
            const diffHrs = diffMs / (1000 * 60 * 60);

            let state: SocialState = 'PLANNING';
            let isUrgent = false;

            // State Machine Logic
            if (diffHrs > 2) {
                state = 'PLANNING';
            } else if (diffHrs > 0 && diffHrs <= 2) {
                state = 'LOGISTICS';
                isUrgent = true;
            } else if (diffHrs <= 0 && diffHrs > -2) {
                state = 'ACTIVE';
            } else if (diffHrs <= -2) {
                // Should virtually never happen as getNextEvent filters past events, 
                // but good for completeness or if we change query logic
                state = 'FOLLOW_UP';
            }

            // Time Formatting
            let timeLeft = '';
            if (diffMs > 0) {
                if (diffHrs < 1) {
                    const mins = Math.floor(diffMs / (1000 * 60));
                    timeLeft = `${mins}m`;
                } else {
                    const hrs = Math.floor(diffHrs);
                    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    timeLeft = `${hrs}h ${mins}m`;
                }
            } else {
                timeLeft = 'Now';
            }

            setData({
                state,
                nextEvent: event,
                timeLeft,
                isUrgent,
                isLoading: false
            });
        };

        fetchData();

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    return data;
}
