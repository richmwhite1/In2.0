'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activities } from '@/lib/activities';
import QuickCreateHangout from './QuickCreateHangout';

export default function MoodBar() {
    const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
    const [preSelectedActivity, setPreSelectedActivity] = useState<string | null>(null);

    const handleIconClick = (activityId: string) => {
        setPreSelectedActivity(activityId);
        setIsQuickCreateOpen(true);
    };

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 mb-4 px-6">
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.25em]">Quick Actions</h3>
                <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 py-2">
                {activities.map((activity, idx) => (
                    <motion.button
                        key={activity.id}
                        whileHover={{ y: -4, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleIconClick(activity.id)}
                        className="flex-shrink-0 flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/5 flex items-center justify-center text-3xl group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-500 shadow-xl shadow-black/20">
                            {activity.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-white/30 group-hover:text-white/60 transition-colors">
                            {activity.label}
                        </span>
                    </motion.button>
                ))}
            </div>

            <QuickCreateHangout
                isOpen={isQuickCreateOpen}
                onClose={() => setIsQuickCreateOpen(false)}
            />
        </div>
    );
}
