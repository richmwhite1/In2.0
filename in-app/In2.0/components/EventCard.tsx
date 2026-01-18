'use client';

import { useRouter } from 'next/navigation';
import { Event } from '@/lib/types';
import AvatarStack from './AvatarStack';
import { Calendar } from 'lucide-react';
import { downloadICS } from '@/lib/CalendarIntegration';

interface EventCardProps {
    event: Event;
    index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
    const router = useRouter();

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    // Determine card height based on size
    const heightClass = {
        small: 'h-[200px]',
        medium: 'h-[280px]',
        large: 'h-[400px]',
    }[event.size || 'medium'];

    return (
        <div
            className={`event-card ${heightClass} cursor-pointer group animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => router.push(`/mood/${event.id}`)}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 gradient-overlay" />
            </div>

            {/* Status Badge */}
            {event.status === 'PROPOSED' && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-orange-500/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <span>🗳️</span>
                    <span>Voting</span>
                </div>
            )}
            {event.status === 'upcoming' && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-green-500/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <span>✓</span>
                    <span>Confirmed</span>
                </div>
            )}

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between p-4">
                {/* Top Section - Avatar Stack and Date Badge */}
                <div className="flex justify-between items-start">
                    <AvatarStack users={event.guests} max={2} size="md" />

                    <div className="bg-white text-black px-3 py-1.5 rounded-full text-sm font-bold">
                        {new Date(event.date).getDate()}
                    </div>
                </div>

                {/* Bottom Section - Event Info */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>{event.location}</span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                downloadICS({
                                    title: event.title,
                                    description: event.description || '',
                                    location: event.location,
                                    startTime: new Date(event.date),
                                    durationMinutes: 120
                                });
                            }}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-md"
                            title="Add to Calendar"
                        >
                            <Calendar size={14} />
                        </button>
                    </div>

                    <h3 className="heading-md text-white">
                        {event.title}
                    </h3>

                    <p className="text-sm text-white/80">
                        Voted {event.guestCount.toLocaleString()} Participants
                    </p>
                </div>
            </div>

            {/* Hover Effect - Subtle Scale */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300 rounded-extra" />
        </div>
    );
}
