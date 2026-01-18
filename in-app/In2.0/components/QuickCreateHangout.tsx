'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Send } from 'lucide-react';
import { activities, EvergreenActivity } from '@/lib/activities';
import GlassCard from './GlassCard';
import { getHangoutSuggestion, createEvent, createEventWithOptions } from '@/lib/actions';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

interface QuickCreateHangoutProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedActivity?: string | null;
}

export default function QuickCreateHangout({ isOpen, onClose, preSelectedActivity }: QuickCreateHangoutProps) {
    const [selectedActivity, setSelectedActivity] = useState<EvergreenActivity | null>(
        preSelectedActivity ? activities.find(a => a.id === preSelectedActivity) || null : null
    );
    const [moodText, setMoodText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const router = useRouter();

    const handleBroadcast = async () => {
        if (!selectedActivity) return;

        setIsGenerating(true);
        try {
            // Create a Proposed Event with Options
            const result = await createEventWithOptions({
                title: `${selectedActivity.label} Huddle`,
                description: moodText || `${selectedActivity.label} with the group!`,
                date: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                activity: selectedActivity.label,
                mood: moodText,
            });

            if (result.success && result.event) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#A020F0', '#FFD700', '#00FFFF']
                });

                onClose();
                router.push(`/events/${result.event.id}`); // Navigate to voting page
            }
        } catch (error) {
            console.error('Failed to broadcast mood:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md relative z-10"
                    >
                        <GlassCard className="p-8 bg-obsidian/90 border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Find Activity</h2>
                                    <p className="text-white/40 text-sm font-medium">What are you in the mood for?</p>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Activity Grid */}
                                <div className="grid grid-cols-4 gap-3">
                                    {activities.map((activity) => (
                                        <button
                                            key={activity.id}
                                            onClick={() => setSelectedActivity(activity)}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-500 ${selectedActivity?.id === activity.id
                                                ? 'bg-accent-purple/20 border-accent-purple shadow-lg shadow-purple-500/20'
                                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                                }`}
                                        >
                                            <span className="text-2xl mb-1">{activity.icon}</span>
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">{activity.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Mood Input */}
                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea
                                            value={moodText}
                                            onChange={(e) => setMoodText(e.target.value)}
                                            placeholder="What do you want to do? (e.g., 'Sunset hike' or 'Competitive gaming tonight')"
                                            className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-accent-purple/50 transition-all resize-none text-sm"
                                        />
                                        <div className="absolute bottom-4 right-4 text-white/10 pointer-events-none">
                                            <Sparkles size={16} />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleBroadcast}
                                        disabled={!selectedActivity || isGenerating}
                                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-500 ${selectedActivity && !isGenerating
                                            ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/5'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                                            }`}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Agent Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Get Suggestions
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
