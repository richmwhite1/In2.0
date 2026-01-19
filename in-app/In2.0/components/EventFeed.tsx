'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, ExternalLink, Plus } from 'lucide-react';
import GlassCard from './GlassCard';
import { getFriendsFeed } from '@/lib/actions';
import { getUserEvents } from '@/lib/profile';

type TabType = 'mine' | 'friends' | 'nearby';

const DEMO_USER_ID = 'demo-user-123';

interface EventFeedProps {
    onJoinEvent?: (eventId: string) => void;
}

export default function EventFeed({ onJoinEvent }: EventFeedProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('mine');
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            try {
                if (activeTab === 'mine') {
                    const result = await getUserEvents(DEMO_USER_ID);
                    setEvents(result.events || []);
                } else if (activeTab === 'friends' || activeTab === 'nearby') {
                    const result = await getFriendsFeed();
                    setEvents(result.events || []);
                }
            } catch (error) {
                console.error('Error loading events:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        loadEvents();
    }, [activeTab]);

    const tabs = [
        { id: 'mine' as TabType, label: 'My Plans' },
        { id: 'friends' as TabType, label: 'Friends' },
        { id: 'nearby' as TabType, label: 'Nearby' },
    ];

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) {
            return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else if (d.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else {
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        }
    };

    const handleEventClick = (event: any) => {
        router.push(`/mood/${event.id}`);
    };

    return (
        <div className="px-6">
            {/* Tab Bar */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? 'bg-white text-black'
                                : 'text-white/40 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Event List */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                >
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="animate-pulse text-white/40">Loading...</div>
                        </div>
                    ) : events.length === 0 ? (
                        <GlassCard className="p-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Calendar size={24} className="text-white/20" />
                            </div>
                            <p className="text-white/60 font-medium mb-1">
                                {activeTab === 'mine' && 'No hangouts yet'}
                                {activeTab === 'friends' && "No friends' events"}
                                {activeTab === 'nearby' && 'No nearby events'}
                            </p>
                            <p className="text-white/30 text-sm">
                                {activeTab === 'mine' && 'Create your first hangout above'}
                                {activeTab === 'friends' && 'Add friends to see their plans'}
                                {activeTab === 'nearby' && 'Check back later for public events'}
                            </p>
                        </GlassCard>
                    ) : (
                        events.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard
                                    className="p-4 cursor-pointer hover:bg-white/5 transition-all group"
                                    onClick={() => handleEventClick(event)}
                                >
                                    <div className="flex gap-4">
                                        {/* Event Image */}
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex-shrink-0 overflow-hidden">
                                            {event.image || event.coverPhoto ? (
                                                <img
                                                    src={event.image || event.coverPhoto}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">
                                                    {getEventEmoji(event.type || event.title)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Event Details */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold truncate group-hover:text-purple-300 transition-colors">
                                                {event.title}
                                            </h4>
                                            <p className="text-white/50 text-sm flex items-center gap-1 mt-1">
                                                <Calendar size={12} />
                                                {formatDate(event.date)}
                                            </p>
                                            {event.location && event.location !== 'TBD' && (
                                                <p className="text-white/40 text-sm flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    <span className="truncate">{event.location}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Guest Count / Status */}
                                        <div className="flex-shrink-0 flex flex-col items-end justify-between">
                                            {event.guests && event.guests.length > 0 && (
                                                <div className="flex items-center gap-1 text-white/40 text-xs">
                                                    <Users size={12} />
                                                    {event.guests.length}
                                                </div>
                                            )}
                                            {activeTab !== 'mine' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (onJoinEvent) onJoinEvent(event.id);
                                                    }}
                                                    className="px-3 py-1 rounded-lg bg-white text-black text-xs font-bold hover:scale-105 transition-transform"
                                                >
                                                    Join
                                                </button>
                                            )}
                                            {event.status === 'PROPOSED' && (
                                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-bold uppercase">
                                                    Voting
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function getEventEmoji(typeOrTitle: string): string {
    const t = typeOrTitle?.toLowerCase() || '';
    if (t.includes('dinner') || t.includes('food') || t.includes('taco')) return '🍽️';
    if (t.includes('drink') || t.includes('cocktail') || t.includes('bar')) return '🍸';
    if (t.includes('golf')) return '⛳';
    if (t.includes('hike') || t.includes('hiking') || t.includes('nature')) return '🥾';
    if (t.includes('coffee')) return '☕';
    if (t.includes('movie') || t.includes('film')) return '🎬';
    if (t.includes('concert') || t.includes('music')) return '🎵';
    if (t.includes('comedy')) return '🎤';
    if (t.includes('gym') || t.includes('workout') || t.includes('yoga')) return '🏋️';
    if (t.includes('date')) return '💖';
    return '✨';
}
