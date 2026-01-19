'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Guest } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface PresenceFeedProps {
    guests: Guest[];
}

export default function PresenceFeed({ guests }: PresenceFeedProps) {
    if (!guests || guests.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-white/60 font-black text-xs uppercase tracking-widest pl-1">Live Presence</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                {guests.map((guest, i) => (
                    <motion.div
                        key={guest.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center gap-2 min-w-[70px]"
                    >
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full border-2 border-white/10 overflow-hidden bg-white/5">
                                <img
                                    src={guest.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${guest.name}`}
                                    alt={guest.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                                <StatusBadge status={guest.status === 'IN' ? 'GOING' : guest.status === 'INTERESTED' ? 'INTERESTED' : 'SUGGESTED'} />
                            </div>
                        </div>
                        <span className="text-white text-xs font-medium truncate w-full text-center">
                            {guest.name.split(' ')[0]}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}


