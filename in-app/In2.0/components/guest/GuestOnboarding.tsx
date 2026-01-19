'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Check, ArrowRight, Loader2 } from 'lucide-react';
import { createShadowGuest } from '@/lib/actions';
import { CalendarEvent, downloadICS } from '@/lib/CalendarIntegration';

import EventCard from '../EventCard';

interface GuestOnboardingProps {
    event: any;
    existingGuestName?: string;
}

export default function GuestOnboarding({
    event,
    existingGuestName
}: GuestOnboardingProps) {
    const [step, setStep] = useState(existingGuestName ? 2 : 1);
    const [name, setName] = useState(existingGuestName || '');
    const [loading, setLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        const result = await createShadowGuest(event.id, name);
        setLoading(false);

        if (result.success) {
            setStep(2);
        } else {
            console.error(result.error);
            // Ideally assume success for UX/UI if it's just a shadow record, 
            // but let's stick to step logic.
        }
    };

    const handleDownloadICS = () => {
        downloadICS({
            title: event.title,
            startTime: new Date(event.date),
            location: event.location,
            description: event.description || '',
            durationMinutes: 120 // Default 2 hours
        });
        setDownloaded(true);
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <h1 className="text-center text-white/60 font-medium text-sm uppercase tracking-widest">
                                You&apos;ve been invited to
                            </h1>
                            <div className="pointer-events-none transform scale-95 origin-top">
                                <EventCard event={event} index={0} />
                            </div>
                        </div>

                        <form onSubmit={handleNameSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">
                                    Introduce Yourself
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name (e.g. Alex)"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-lg text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!name.trim() || loading}
                                className="w-full bg-white text-black font-black text-lg py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        Continue <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8 text-center"
                    >
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-green-400/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                You&apos;re In, {name}!
                            </h1>
                            <p className="text-white/60 max-w-[280px] mx-auto">
                                We&apos;ve let everyone know you&apos;re coming.
                            </p>
                        </div>

                        <button
                            onClick={handleDownloadICS}
                            className={`w-full relative group overflow-hidden py-5 rounded-2xl font-black text-lg transition-all ${downloaded
                                ? 'bg-white/10 text-white'
                                : 'bg-white text-black shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
                                }`}
                        >
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                {downloaded ? (
                                    <>Added to Calendar <Check size={20} /></>
                                ) : (
                                    <>Add to Calendar <Calendar size={20} /></>
                                )}
                            </div>
                        </button>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-white/30 text-sm">
                                Make sure to check the event details later for updates.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
