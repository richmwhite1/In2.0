'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventOption } from '@/lib/types';
import GlassCard from './GlassCard';
import { Check, Info, Users, MapPin, Sparkles } from 'lucide-react';
import { voteForOption } from '@/lib/actions';
import { downloadICS } from '@/lib/CalendarIntegration';
import { useToast, ToastContainer } from './Toast';
import CountdownTimer from './CountdownTimer';

interface ConsensusCardProps {
    eventId: string;
    options: EventOption[];
    onVote?: (optionId: string) => void;
    deadline?: Date; // Optional voting deadline
}

export default function ConsensusCard({ eventId, options, onVote, deadline }: ConsensusCardProps) {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const { toasts, addToast, removeToast } = useToast();

    const totalVotes = options.reduce((acc, opt) => acc + opt.voteCount, 0);
    const selectedOption = options.find(o => o.id === selectedOptionId);

    const handleVote = async (optionId: string) => {
        // If already voted for this option, allow changing vote
        if (selectedOptionId === optionId) {
            setSelectedOptionId(null);
            addToast('Vote removed', 'info');
            return;
        }

        setSelectedOptionId(optionId);

        // Mock guest info
        const guestInfo = { name: 'Guest User', userId: 'guest-' + Math.random().toString(36).substr(2, 9) };

        try {
            await voteForOption(eventId, optionId, guestInfo);
            addToast('Vote saved! Tap again to change', 'success');
            onVote?.(optionId);
        } catch (error) {
            console.error('Failed to vote:', error);
            addToast('Failed to save vote', 'error');
        }
    };

    const handleAddToCalendar = () => {
        if (selectedOption) {
            downloadICS({
                title: selectedOption.title,
                description: selectedOption.description || '',
                location: selectedOption.location,
                address: selectedOption.location,
                googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOption.location)}`,
                startTime: new Date(),
                durationMinutes: 120
            });
            addToast('✓ Added to calendar', 'success');
        }
    };

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Countdown Timer Header */}
            {deadline && (
                <div className="mb-4 flex items-center justify-between p-4 rounded-2xl glass">
                    <div>
                        <h4 className="text-white font-bold text-sm mb-1">Vote for your favorite</h4>
                        <p className="text-white/60 text-xs">Help the group decide</p>
                    </div>
                    <CountdownTimer deadline={deadline} />
                </div>
            )}

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {options
                        .filter(opt => !isConfirmed || opt.id === selectedOptionId)
                        .map((option, idx) => {
                            const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
                            const isSelected = selectedOptionId === option.id;
                            const isDimmed = selectedOptionId && !isSelected;

                            // Determine if this is the winning option
                            const maxVotes = Math.max(...options.map(o => o.voteCount));
                            const isWinning = option.voteCount > 0 && option.voteCount === maxVotes && totalVotes > 0;

                            return (
                                <motion.div
                                    key={option.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{
                                        opacity: isDimmed ? 0.3 : 1,
                                        scale: 1,
                                        height: isDimmed ? 60 : 'auto'
                                    }}
                                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                >
                                    <GlassCard
                                        onClick={() => !selectedOptionId && handleVote(option.id)}
                                        className={`p-5 group relative overflow-hidden transition-all duration-500 rounded-[28px] ${isSelected ? 'border-accent-purple/50 bg-accent-purple/5' : 'hover:border-white/20'
                                            } ${selectedOptionId && !isSelected ? 'cursor-default pointer-events-none' : 'cursor-pointer'}`}
                                    >
                                        {/* Pulse Progress Bar - Hide when confirmed */}
                                        {!isConfirmed && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className="absolute inset-y-0 left-0 bg-white/5 z-0"
                                                transition={{ type: 'spring', bounce: 0, duration: 1 }}
                                            />
                                        )}

                                        <div className="relative z-10 flex gap-4">
                                            <div className={`rounded-2xl overflow-hidden flex-shrink-0 bg-white/5 transition-all duration-500 ${isDimmed ? 'w-10 h-10' : 'w-16 h-16'}`}>
                                                {option.image ? (
                                                    <img src={option.image} alt={option.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                                        <MapPin size={isDimmed ? 16 : 24} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <h4 className={`text-white font-black tracking-tight truncate transition-all ${isDimmed ? 'text-xs' : 'text-sm'}`}>
                                                            {option.title}
                                                        </h4>
                                                        {option.isTopPick && !isDimmed && (
                                                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[8px] font-black uppercase tracking-widest shadow-lg">
                                                                ⭐ Top Pick
                                                            </span>
                                                        )}
                                                        {isWinning && !option.isTopPick && !isDimmed && (
                                                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/90 text-black text-[8px] font-black uppercase tracking-widest shadow-lg">
                                                                🏆 Leading
                                                            </span>
                                                        )}
                                                        {option.flavorTag && !isDimmed && !option.isTopPick && !isWinning && (
                                                            <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/40">
                                                                {option.flavorTag}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {!isDimmed && (
                                                        <div className="flex items-center gap-1.5 text-white/40">
                                                            <Users size={12} />
                                                            <span className="text-[10px] font-black">{option.voteCount}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {!isDimmed && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="space-y-2"
                                                    >
                                                        <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2">
                                                            {option.description}
                                                        </p>

                                                        {option.expertTip && (
                                                            <div className="flex items-start gap-2 p-2 rounded-xl bg-orange-500/5 border border-orange-500/10">
                                                                <Sparkles size={10} className="text-orange-400 mt-0.5 shrink-0" />
                                                                <p className="text-orange-400/80 text-[10px] font-medium leading-tight">
                                                                    {option.expertTip}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {!isDimmed && !option.expertTip && (
                                                    <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                                        <MapPin size={10} />
                                                        {option.location}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-center">
                                                <div className={`rounded-full flex items-center justify-center transition-all duration-500 border ${isSelected
                                                    ? 'bg-white border-white text-black scale-110'
                                                    : 'bg-white/5 border-white/10 text-white/20'
                                                    } ${isDimmed ? 'w-6 h-6' : 'w-8 h-8'}`}>
                                                    {isSelected ? <Check size={isDimmed ? 12 : 16} /> : <div className="w-1 h-1 rounded-full bg-white/20" />}
                                                </div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                </AnimatePresence>
            </div>
        </>
    );
}
