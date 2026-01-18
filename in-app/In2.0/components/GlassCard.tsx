'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export default function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
    return (
        <div
            className={`glass overflow-hidden ${hover ? 'transition-all duration-500 hover:border-white/20 hover:shadow-xl hover:shadow-white/5' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
