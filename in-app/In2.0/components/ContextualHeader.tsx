'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function ContextualHeader() {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-40 glass-nav px-6 py-4 mb-6">
            <div className="flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-white font-black text-2xl mb-1">In.</h1>
                    <p className="text-white/60 text-sm">Organize hangouts without the chaos</p>
                </motion.div>

                {/* Avatar / Profile Link */}
                <button
                    onClick={() => router.push('/profile')}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
                />
            </div>
        </header>
    );
}
