'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BentoGridProps {
    children: ReactNode;
}

export default function BentoGrid({ children }: BentoGridProps) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 auto-rows-auto"
        >
            {children}
        </motion.div>
    );
}

// Helper component for grid items
interface BentoItemProps {
    children: ReactNode;
    span?: 1 | 2;
    className?: string;
}

export function BentoItem({ children, span = 1, className = '' }: BentoItemProps) {
    const spanClass = span === 2 ? 'col-span-2' : 'col-span-1';

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
    };

    return (
        <motion.div variants={item} className={`${spanClass} ${className}`}>
            {children}
        </motion.div>
    );
}
