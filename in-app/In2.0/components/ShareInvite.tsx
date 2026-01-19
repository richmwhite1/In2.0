'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

interface ShareInviteProps {
    title: string;
    url: string;
    type?: 'date' | 'hangout';
    sender?: string;
}

export default function ShareInvite({ title, url, type = 'hangout', sender }: ShareInviteProps) {
    const [copied, setCopied] = useState(false);

    const shareMessage = type === 'date'
        ? `Hey! I found a few cool spots for our date. Pick your favorite here: ${url}`
        : `Check out this hangout: ${title}. RSVP here: ${url.replace(/\/events\/|\/mood\//, '/guest/')}`;

    const handleShare = async () => {
        // Fallback or specific logic
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `Join: ${title}`,
                    text: shareMessage,
                    url: url
                });
            } catch (error) {
                console.warn('Share cancelled or failed:', error);
                handleCopy(); // Fallback if share fails (e.g. desktop cancellation)
            }
        } else {
            handleCopy();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex gap-2">
            <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white text-black font-black text-sm shadow-xl shadow-white/5 transition-all"
            >
                <Share2 size={16} />
                {type === 'date' ? '💝 Send Date Options' : '👋 Invite Friends'}
            </motion.button>

            <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 flex items-center justify-center rounded-2xl glass text-white transition-all relative"
            >
                <AnimatePresence mode="wait">
                    {copied ? (
                        <motion.div
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                        >
                            <Check size={18} className="text-green-400" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="copy"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                        >
                            <Copy size={18} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
}
