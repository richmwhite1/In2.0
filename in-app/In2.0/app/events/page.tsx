'use client';

import EventFeed from '@/components/EventFeed';
import Navigation from '@/components/Navigation';

export default function EventFeedPage() {
    return (
        <main className="min-h-screen pb-24 bg-background">
            <header className="sticky top-0 z-40 glass-nav px-6 py-4 mb-6">
                <h1 className="text-white font-black text-2xl">Events</h1>
                <p className="text-white/60 text-sm">Discover and join hangouts</p>
            </header>
            <EventFeed />
            <Navigation />
        </main>
    );
}
