'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, X, Plus } from 'lucide-react';
import GlassCard from './GlassCard';
import { GapSuggestion as GapSuggestionType } from '@/lib/gapFinder';
import { useRouter } from 'next/navigation';

interface GapSuggestionProps {
    suggestion: GapSuggestionType;
    onDismiss: () => void;
}

export default function GapSuggestion({ suggestion, onDismiss }: GapSuggestionProps) {
    const router = useRouter();

    const handleStartHangout = () => {
        const params = new URLSearchParams({
            title: suggestion.suggestion.title,
            location: suggestion.suggestion.venue,
            description: suggestion.suggestion.description,
            date: suggestion.startTime.toISOString(),
            eventType: suggestion.suggestion.eventType,
            friends: suggestion.friends.map(f => f.name).join(','),
        });
        router.push(`/create?${params.toString()}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative p-[1.5px] rounded-[32px] overflow-hidden"
        >
            {/* Animated Border Gradient */}
            <motion.div
                animate={{
                    background: [
                        'linear-gradient(45deg, #6D28D9, #D97706, #6D28D9)',
                        'linear-gradient(135deg, #6D28D9, #D97706, #6D28D9)',
                        'linear-gradient(225deg, #6D28D9, #D97706, #6D28D9)',
                        'linear-gradient(315deg, #6D28D9, #D97706, #6D28D9)',
                        'linear-gradient(405deg, #6D28D9, #D97706, #6D28D9)',
                    ],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 z-0"
            />

            <GlassCard className="relative z-10 p-6 bg-obsidian/90 backdrop-blur-3xl border-0 rounded-[30.5px]">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold tracking-tight">AI Opportunity</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest leading-none">Social Gap Detected</p>
                        </div>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/20 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-white text-lg font-semibold leading-tight">
                            {suggestion.startTime.toLocaleDateString('en-US', { weekday: 'long' })} night is quiet. <br />
                            <span className="text-purple-400">{suggestion.friends.slice(0, 2).map(f => f.name).join(' & ')}</span> are in the mood for <span className="text-orange-400">{suggestion.suggestion.eventType}</span>.
                        </p>
                        <p className="text-white/60 text-sm">
                            Want to start a hangout at <span className="font-bold text-white/80">{suggestion.suggestion.venue}</span>?
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <div className="flex -space-x-2 mr-2">
                            {suggestion.friends.map((friend, i) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-obsidian overflow-hidden bg-charcoal">
                                    <img src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} alt={friend.name} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Matching Moods</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleStartHangout}
                            className="flex-1 bg-white text-black h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Start Hangout
                        </button>
                        <button
                            onClick={onDismiss}
                            className="px-6 h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-all"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}
