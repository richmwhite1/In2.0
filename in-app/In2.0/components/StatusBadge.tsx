'use client';

import React from 'react';

interface StatusBadgeProps {
    status: 'GOING' | 'INTERESTED' | 'SUGGESTED';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = {
        GOING: {
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        INTERESTED: {
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        },
        SUGGESTED: {
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20'
        }
    }[status];

    return (
        <div className={`px-2 py-1 rounded-lg border ${config.bg} ${config.border} backdrop-blur-md`}>
            <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                {status}
            </span>
        </div>
    );
}
