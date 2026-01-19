'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import GlassCard from './GlassCard';

interface ChecklistItem {
    id: string;
    label: string;
    checked: boolean;
}

interface BentoChecklistProps {
    title?: string;
    items?: ChecklistItem[];
}

export default function BentoChecklist({
    title = 'Ready to go?',
    items: initialItems = [
        { id: '1', label: 'Tickets', checked: false },
        { id: '2', label: 'ID', checked: false },
        { id: '3', label: 'Keys', checked: false },
        { id: '4', label: 'Wallet', checked: false }
    ]
}: BentoChecklistProps) {
    const [items, setItems] = useState(initialItems);

    const toggleItem = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    return (
        <GlassCard className="p-4 space-y-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wide opacity-80">{title}</h3>
            <div className="space-y-2">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={false}
                        animate={{ opacity: item.checked ? 0.5 : 1 }}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => toggleItem(item.id)}
                    >
                        <div className={`
                            w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-all
                            ${item.checked ? 'bg-green-500 border-green-500' : 'group-hover:border-white/40 bg-white/5'}
                        `}>
                            {item.checked && <Check size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm text-white transition-all ${item.checked ? 'line-through' : ''}`}>
                            {item.label}
                        </span>
                    </motion.div>
                ))}
            </div>
        </GlassCard>
    );
}
