'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AvatarStack from './AvatarStack';
import { Event } from '@/lib/types';

interface EventFeedProps {
    events: Event[];
}

export default function EventFeed({ events }: EventFeedProps) {
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

    // Navigate to event detail
    const handleEventClick = (eventId: string) => {
        setSelectedEvent(eventId);
        router.push(`/mood/${eventId}`);
    };

    // Format date for display
    const formatDate = (date: Date) => {
        const eventDate = new Date(date);
        const today = new Date();
        const isToday = eventDate.toDateString() === today.toDateString();

        if (isToday) {
            return 'In-Progress';
        }

        return eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Get current date for header
    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-nav px-6 py-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Events</h1>
                        <p className="text-xs text-white/60 mt-1">{getCurrentDate()}</p>
                    </div>

                    {/* Glassmorphic User Avatar */}
                    <div className="glass w-12 h-12 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                    </div>
                </div>
            </header>

            {/* Event Cards - Vertical Stack */}
            <div className="px-6 space-y-4">
                {events.map((event, index) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            delay: index * 0.1,
                            type: 'spring',
                            stiffness: 100
                        }}
                        whileTap={{
                            scale: 0.98,
                            transition: { type: 'spring', stiffness: 400, damping: 17 }
                        }}
                        onClick={() => handleEventClick(event.id)}
                        className="relative rounded-extra overflow-hidden cursor-pointer"
                        style={{ height: '400px' }}
                    >
                        {/* Full-Bleed Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Gradient Scrim for Text Legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Right Badge - Glassmorphic */}
                        <div className="absolute top-4 right-4">
                            <div className="glass bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full">
                                <span className="text-black text-sm font-bold">
                                    {formatDate(event.date)}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            {/* Overlapping Participant Avatars */}
                            <div className="mb-3">
                                <AvatarStack users={event.guests} max={4} size="md" />
                            </div>

                            {/* Event Title */}
                            <h2 className="text-white text-2xl font-bold mb-2 leading-tight">
                                {event.title}
                            </h2>

                            {/* Event Details */}
                            <div className="flex items-center gap-4 text-white/80 text-sm">
                                <span className="flex items-center gap-1">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    {event.guestCount} participants
                                </span>

                                <span className="flex items-center gap-1">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    {event.location}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Fixed Bottom Navigation - High Blur Glassmorphic */}
            <nav className="fixed bottom-0 left-0 right-0 z-50">
                <div className="glass-nav px-6 py-4 max-w-[430px] mx-auto backdrop-blur-3xl">
                    <div className="flex justify-around items-center">
                        {[
                            { id: 'calendar', label: 'Calendar', icon: '📅' },
                            { id: 'collections', label: 'Collections', icon: '📚' },
                            { id: 'search', label: 'Search', icon: '🔍' },
                            { id: 'menu', label: 'Menu', icon: '☰' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                className="flex flex-col items-center gap-1 transition-all duration-300 hover:scale-110"
                            >
                                <span className="text-2xl">{item.icon}</span>
                                <span className="text-xs text-white/60">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
}
