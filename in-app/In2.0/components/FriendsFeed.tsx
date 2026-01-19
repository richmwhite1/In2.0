'use client';

import { useState, useEffect } from 'react';
import { getFriendsFeed, toggleAttendance } from '@/lib/actions';
import { Event } from '@/lib/types';
import GlassCard from './GlassCard';
import AvatarStack from './AvatarStack';
import { Calendar, MapPin, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';

export default function FriendsFeed() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { addToast } = useToast();

    useEffect(() => {
        const fetchFeed = async () => {
            const { events } = await getFriendsFeed();
            setEvents(events || []);
            setLoading(false);
        };
        fetchFeed();
    }, []);

    const handleJoin = async (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        await toggleAttendance(eventId, 'in', { name: 'Me', userId: 'current-user-id' });
        addToast('You joined the hangout!', 'success');
        // Optimistic update
        setEvents(prev => prev.map(ev =>
            ev.id === eventId
                ? { ...ev, guests: [...(ev.guests || []), { id: 'temp', avatar: '', name: 'Me' }] }
                : ev
        ));
    };

    if (!loading && events.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="px-6 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Friends&apos; Moves</h2>
                <button className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors">
                    <UserPlus size={12} />
                    Add Friends
                </button>
            </div>

            <div className="flex overflow-x-auto px-6 gap-4 pb-8 snap-x scrollbar-hide">
                {events.map((event) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => router.push(`/mood/${event.id}`)}
                        className="snap-center shrink-0 w-[280px] h-[320px] relative rounded-[32px] overflow-hidden cursor-pointer group"
                    >
                        {/* Background Image */}
                        <img
                            src={event.coverPhoto || event.image || '/images/event-placeholder.jpg'}
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

                        {/* Content */}
                        <div className="absolute inset-0 p-5 flex flex-col justify-between">
                            <div className="flex justify-end">
                                <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                                    {event.privacy === 'FRIENDS' ? 'Friends Only' : 'Public'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <h3 className="text-2xl font-black text-white leading-none mb-1">{event.title}</h3>
                                    <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
                                        <MapPin size={12} />
                                        {event.location}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <AvatarStack users={event.guests} size="sm" max={3} />
                                    <button
                                        onClick={(e) => handleJoin(e, event.id)}
                                        className="bg-white text-black px-4 py-2 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg"
                                    >
                                        I&apos;m In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
