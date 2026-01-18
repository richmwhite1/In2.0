'use client';

import { motion } from 'framer-motion';
import GlassCard from '../GlassCard';

interface GlassHeroProps {
    avatar: string;
    username: string;
    mood: string;
}

export default function GlassHero({ avatar, username, mood }: GlassHeroProps) {
    return (
        <GlassCard className="p-8 mb-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/10 blur-3xl -ml-16 -mb-16 rounded-full" />

            <div className="flex flex-col items-center text-center relative z-10">
                <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#A855F7] to-[#EC4899]">
                        <img
                            src={avatar}
                            alt={username}
                            className="w-full h-full rounded-full object-cover border-4 border-[#0A0A0A]"
                        />
                    </div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -bottom-2 -right-2 bg-white text-black px-4 py-1 rounded-full text-xs font-bold shadow-xl border border-white/20"
                    >
                        LIVE ⚡️
                    </motion.div>
                </div>

                <h1 className="heading-lg mb-2 text-gradient">@{username}</h1>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    <span className="text-xl">{getMoodEmoji(mood)}</span>
                    <span className="text-sm font-medium text-white/90">{mood}</span>
                </div>
            </div>
        </GlassCard>
    );
}

function getMoodEmoji(mood: string) {
    const m = mood.toLowerCase();
    if (m.includes('cocktail') || m.includes('drink')) return '🍸';
    if (m.includes('jazz') || m.includes('music')) return '🎷';
    if (m.includes('coffee')) return '☕️';
    if (m.includes('food') || m.includes('dinner')) return '🍽️';
    if (m.includes('party')) return '🎉';
    return '✨';
}
