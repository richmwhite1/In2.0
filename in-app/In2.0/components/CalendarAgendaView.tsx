'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event } from '@/lib/types';
import EventCard from './EventCard';
import BentoGrid, { BentoItem } from './BentoGrid';
import GlassCard from './GlassCard';
import { Sparkles, Calendar, Plus, Filter } from 'lucide-react';
import StatusBadge from './StatusBadge';
import InterestToggle, { InterestState } from './InterestToggle';
import { findSocialGaps, GapSuggestion as GapSuggestionType } from '@/lib/gapFinder';
import GapSuggestion from './GapSuggestion';
import QuickCreateHangout from './QuickCreateHangout';

interface CalendarAgendaViewProps {
    events: Event[];
}

export default function CalendarAgendaView({ events }: CalendarAgendaViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date('2026-01-17'));
    const [suggestion, setSuggestion] = useState<GapSuggestionType | null>(null);
    const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter events for the selected date
    const dayEvents = events.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
    });

    useEffect(() => {
        const checkGaps = async () => {
            if (dayEvents.length === 0) {
                const gaps = await findSocialGaps(events);
                // Filter gaps for selected date
                const dayGap = gaps.find(g => g.startTime.getDate() === selectedDate.getDate());
                setSuggestion(dayGap || null);
            } else {
                setSuggestion(null);
            }
        };
        checkGaps();
    }, [selectedDate, events, dayEvents.length]);

    // Generate dates for the strip (14 days)
    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date('2026-01-17');
        d.setDate(d.getDate() + i);
        return d;
    });

    const getAttendanceStatus = (date: Date): { going: boolean, interested: boolean } => {
        const dateEvents = events.filter(e => {
            const d = new Date(e.date);
            return d.getDate() === date.getDate() && d.getMonth() === date.getMonth();
        });

        // Mock logic for status dots
        // In a real app, this would check the 'Guest' status for the current user
        return {
            going: dateEvents.some(e => e.id === '1' || e.id === '9'), // Example IDs
            interested: dateEvents.some(e => e.id === '2' || e.id === '5'),
        };
    };

    return (
        <div className="space-y-8 pb-32">
            {/* The Horizon (Date Strip) */}
            <section className="px-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white font-black text-2xl tracking-tight">The Horizon</h2>
                    <button
                        onClick={() => setIsQuickCreateOpen(true)}
                        className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                    {dates.map((date, i) => {
                        const isSelected = date.getDate() === selectedDate.getDate();
                        const status = getAttendanceStatus(date);

                        return (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(date)}
                                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-24 rounded-[24px] relative transition-all duration-500 ${isSelected
                                    ? 'bg-white text-black shadow-2xl shadow-white/10'
                                    : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <span className="text-[10px] font-black uppercase tracking-tighter mb-1 opacity-60">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-2xl font-black">
                                    {date.getDate()}
                                </span>

                                <div className="flex gap-1 mt-2">
                                    {status.going && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />}
                                    {status.interested && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            {/* The Agenda (Feed) */}
            <section className="px-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">The Agenda</h3>
                        <div className="h-[1px] w-24 bg-white/10" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedDate.toISOString()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-6"
                    >
                        {dayEvents.length > 0 ? (
                            <BentoGrid>
                                {dayEvents.map((event, idx) => (
                                    <BentoItem key={event.id} span={event.size === 'large' ? 2 : 1}>
                                        <div className="relative group overflow-hidden rounded-[32px]">
                                            <EventCard event={event} index={idx} />

                                            {/* Status Badge Overlay */}
                                            <div className="absolute top-4 right-4 z-20">
                                                <StatusBadge status={idx % 2 === 0 ? 'GOING' : 'INTERESTED'} />
                                            </div>

                                            {/* Interest Toggle on Hover/Expand */}
                                            <div className="absolute inset-x-4 bottom-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <InterestToggle initialState={idx % 2 === 0 ? 'going' : 'interested'} />
                                            </div>
                                        </div>
                                    </BentoItem>
                                ))}
                            </BentoGrid>
                        ) : (
                            <div className="space-y-6">
                                {suggestion ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-white/20">
                                            <Sparkles size={14} />
                                            <span className="text-xs font-bold uppercase tracking-widest text--white">Social Gap Detected</span>
                                        </div>
                                        <GapSuggestion
                                            suggestion={suggestion}
                                            onDismiss={() => setSuggestion(null)}
                                        />
                                    </div>
                                ) : (
                                    <GlassCard className="p-12 border-0 bg-white/5 flex flex-col items-center justify-center text-center rounded-[32px]">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                            <Calendar className="text-white/20" size={32} />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-2">A Quiet Day</h4>
                                        <p className="text-white/40 text-sm max-w-[200px]">No plans yet. Create an activity and invite friends.</p>
                                        <button
                                            onClick={() => setIsQuickCreateOpen(true)}
                                            className="mt-8 px-8 py-4 bg-white text-black rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Find Activity
                                        </button>
                                    </GlassCard>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </section>

            <QuickCreateHangout
                isOpen={isQuickCreateOpen}
                onClose={() => setIsQuickCreateOpen(false)}
            />
        </div>
    );
}
