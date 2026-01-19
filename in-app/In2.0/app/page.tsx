'use client';

import { useRouter } from 'next/navigation';
import ContextualHeader from '@/components/ContextualHeader';
import Navigation from '@/components/Navigation';
import QuickCreateBento from '@/components/QuickCreateBento';
import EventFeed from '@/components/EventFeed';
import { toggleAttendance } from '@/lib/actions';

const DEMO_USER_ID = 'demo-user-123';

export default function Home() {
    const router = useRouter();

    const handleJoinEvent = async (eventId: string) => {
        // Add user as a guest (MAYBE status initially)
        await toggleAttendance(eventId, 'IN', {
            name: 'You',
            userId: DEMO_USER_ID
        });
        // Navigate to the event
        router.push(`/mood/${eventId}`);
    };

    return (
        <main className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <ContextualHeader />

            {/* Collapsible Create Module */}
            <QuickCreateBento />

            {/* Section Label */}
            <div className="px-6 mb-4">
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Your Feed
                </h3>
            </div>

            {/* Event Feed with Tabs */}
            <EventFeed onJoinEvent={handleJoinEvent} />

            {/* Navigation */}
            <Navigation />
        </main>
    );
}
