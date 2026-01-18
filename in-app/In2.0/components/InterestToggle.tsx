'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, X } from 'lucide-react';

export type InterestState = 'interested' | 'going' | 'out';

interface InterestToggleProps {
    initialState?: InterestState;
    onChange?: (state: InterestState) => void;
}

export default function InterestToggle({ initialState = 'out', onChange }: InterestToggleProps) {
    const [state, setState] = useState<InterestState>(initialState);

    const states: { id: InterestState; label: string; icon: any; color: string; bgColor: string }[] = [
        { id: 'interested', label: 'Interested', icon: Star, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
        { id: 'going', label: 'Going', icon: Check, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
        { id: 'out', label: 'Out', icon: X, color: 'text-white/40', bgColor: 'bg-white/5' },
    ];

    const handleClick = (newState: InterestState) => {
        setState(newState);
        onChange?.(newState);
    };

    return (
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-sm">
            {states.map((s) => {
                const isActive = state === s.id;
                const Icon = s.icon;

                return (
                    <button
                        key={s.id}
                        onClick={() => handleClick(s.id)}
                        className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'z-10' : 'hover:bg-white/5'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="active-pill"
                                className={`absolute inset-0 rounded-xl ${s.bgColor} border border-white/10`}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon size={14} className={`relative z-10 ${isActive ? s.color : 'text-white/20'}`} />
                        <span className={`relative z-10 text-xs font-bold tracking-tight ${isActive ? 'text-white' : 'text-white/20'}`}>
                            {s.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
