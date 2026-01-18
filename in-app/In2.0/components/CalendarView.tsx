'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event } from '@/lib/types';
import EventCard from './EventCard';
import BentoGrid, { BentoItem } from './BentoGrid';
import GlassCard from './GlassCard';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { findSocialGaps, GapSuggestion as GapSuggestionType } from '@/lib/gapFinder';
import GapSuggestion from './GapSuggestion';

interface CalendarViewProps {
    events: Event[];
}

export default function CalendarView({ events }: CalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date('2026-01-17'));
    const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
    const [suggestion, setSuggestion] = useState<GapSuggestionType | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkGaps = async () => {
            const gaps = await findSocialGaps(events);
            if (gaps.length > 0) {
                setSuggestion(gaps[0]);
            }
        };
        checkGaps();
    }, [events]);

    // Generate dates for The Horizon (30 days)
    const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date('2026-01-15');
        d.setDate(d.getDate() + i);
        return d;
    });

    const hasEvent = (date: Date) => {
        return events.some(e =>
            new Date(e.date).getDate() === date.getDate() &&
            new Date(e.date).getMonth() === date.getMonth()
        );
    };

    const isToday = (date: Date) => {
        const today = new Date('2026-01-17');
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
    };

    const isSelected = (date: Date) => {
        return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
    };

    // Grouping Logic
    const today = new Date('2026-01-17');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const weekendEnd = new Date(today);
    // If today is Sat (6), tomorrow is Sun (0). Weekend is today/tomorrow.
    // Let's just say Sat/Sun is weekend.

    const groups = {
        'This Weekend': events.filter(e => {
            const d = new Date(e.date);
            return (d.getDate() === 17 || d.getDate() === 18) && d.getMonth() === 0;
        }),
        'This Week': events.filter(e => {
            const d = new Date(e.date);
            return d.getDate() >= 19 && d.getDate() <= 23 && d.getMonth() === 0;
        }),
        'Later': events.filter(e => {
            const d = new Date(e.date);
            return (d.getDate() > 23 && d.getMonth() === 0) || d.getMonth() > 0;
        })
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Agent Summary & Gap Suggestion */}
            <section className="px-6 space-y-4">
                {suggestion && (
                    <GapSuggestion
                        suggestion={suggestion}
                        onDismiss={() => setSuggestion(null)}
                    />
                )}

                <GlassCard className="p-6 bg-gradient-to-br from-charcoal/80 to-obsidian/40 border-white/5 shadow-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Sparkles className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-white/60 text-sm font-medium mb-1">Agent Summary</h2>
                            <p className="text-white text-lg font-semibold leading-tight">
                                You have <span className="text-orange-400">3 hangouts</span> this week. <br />
                                <span className="text-purple-400">Saturday</span> looks like the peak mood.
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* The Horizon */}
            <section className="relative group">
                <div className="flex justify-between items-center px-6 mb-4">
                    <h3 className="text-white font-bold text-xl">The Horizon</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode(viewMode === 'day' ? 'month' : 'day')}
                            className="text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors"
                        >
                            {viewMode === 'day' ? 'Show Month' : 'Show Days'}
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar px-6 py-2 scroll-smooth"
                >
                    {dates.map((date, i) => (
                        <motion.button
                            key={i}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDate(date)}
                            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-24 rounded-3xl transition-all duration-500 relative ${isSelected(date)
                                ? 'bg-white text-black shadow-xl shadow-white/10'
                                : 'bg-white/5 text-white/40 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-tighter mb-1">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                            <span className="text-2xl font-black">
                                {date.getDate()}
                            </span>

                            {hasEvent(date) && (
                                <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 shadow-sm" />
                            )}

                            {isToday(date) && !isSelected(date) && (
                                <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-orange-500" />
                            )}
                        </motion.button>
                    ))}
                </div>
            </section>

            {/* The Agenda */}
            <section className="px-6 pb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={viewMode}
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-10"
                    >
                        {Object.entries(groups).map(([title, groupEvents]) => (
                            groupEvents.length > 0 && (
                                <div key={title} className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-white/40 text-xs font-black uppercase tracking-[0.2em]">{title}</h4>
                                        <div className="h-[1px] flex-1 bg-white/10" />
                                    </div>

                                    <BentoGrid>
                                        {groupEvents.map((event, idx) => (
                                            <BentoItem
                                                key={event.id}
                                                span={event.size === 'large' ? 2 : 1}
                                            >
                                                <EventCard event={event} index={idx} />
                                            </BentoItem>
                                        ))}
                                    </BentoGrid>
                                </div>
                            )
                        ))}
                    </motion.div>
                </AnimatePresence>
            </section>
        </div>
    );
}
