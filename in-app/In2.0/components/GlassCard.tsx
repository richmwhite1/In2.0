'use client';

import { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
    return (
        <div
            onClick={onClick}
            className={`glass rounded-elite overflow-hidden ${hover ? 'transition-all duration-500 hover:border-white/20 hover:shadow-xl hover:shadow-white/5' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        >
            {children}
        </div>
    );
}
