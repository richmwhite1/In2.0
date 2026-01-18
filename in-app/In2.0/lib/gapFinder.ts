import { Event } from './types';

export interface GapSuggestion {
    startTime: Date;
    endTime: Date;
    friends: Array<{ name: string; avatar?: string; mood: string }>;
    suggestion: {
        title: string;
        venue: string;
        eventType: string;
        description: string;
        image: string;
    };
}

const SOCIAL_WINDOWS = [
    { day: 5, start: 17, end: 23 }, // Friday
    { day: 6, start: 12, end: 23 }, // Saturday
    { day: 0, start: 11, end: 18 }, // Sunday
];

/**
 * Client-safe gap finder - only analyzes existing events
 * For AI suggestions, use server action findSocialGapsWithSuggestions
 */
export function findSocialGaps(events: Event[]): Array<{ startTime: Date; endTime: Date }> {
    const now = new Date();
    const gaps: Array<{ startTime: Date; endTime: Date }> = [];

    // Look at the next 7 days
    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const dayOfWeek = checkDate.getDay();

        const window = SOCIAL_WINDOWS.find(w => w.day === dayOfWeek);
        if (!window) continue;

        const windowStart = new Date(checkDate);
        windowStart.setHours(window.start, 0, 0, 0);
        const windowEnd = new Date(checkDate);
        windowEnd.setHours(window.end, 0, 0, 0);

        // Don't look at windows in the past
        if (windowEnd <= now) continue;
        const actualStart = windowStart < now ? now : windowStart;

        // Find events overlapping with this window
        const windowEvents = events.filter(e => {
            const eStart = new Date(e.date);
            const eEnd = e.endDate ? new Date(e.endDate) : new Date(eStart.getTime() + 2 * 60 * 60 * 1000);
            return (eStart < windowEnd && eEnd > actualStart);
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Check for gaps
        let lastTime = actualStart;
        for (const event of windowEvents) {
            const eStart = new Date(event.date);
            const gapDuration = (eStart.getTime() - lastTime.getTime()) / (1000 * 60 * 60);

            if (gapDuration >= 4) {
                gaps.push({ startTime: lastTime, endTime: eStart });
            }

            const eEnd = event.endDate ? new Date(event.endDate) : new Date(eStart.getTime() + 2 * 60 * 60 * 1000);
            if (eEnd > lastTime) lastTime = eEnd;
        }

        // Check gap at the end of window
        const finalGapDuration = (windowEnd.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
        if (finalGapDuration >= 4) {
            gaps.push({ startTime: lastTime, endTime: windowEnd });
        }
    }

    return gaps;
}
