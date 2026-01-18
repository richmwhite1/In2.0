'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <Check size={18} />,
        error: <X size={18} />,
        info: <Info size={18} />,
        warning: <AlertCircle size={18} />
    };

    const colors = {
        success: 'bg-green-500/90 border-green-400/50',
        error: 'bg-red-500/90 border-red-400/50',
        info: 'bg-blue-500/90 border-blue-400/50',
        warning: 'bg-orange-500/90 border-orange-400/50'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-safe left-1/2 -translate-x-1/2 z-[9999] max-w-[90vw] w-auto`}
        >
            <div className={`${colors[type]} backdrop-blur-xl border px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white`}>
                {icons[type]}
                <span className="font-bold text-sm">{message}</span>
            </div>
        </motion.div>
    );
}

// Toast Container Component
interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <AnimatePresence>
            {toasts.map((toast, index) => (
                <div key={toast.id} style={{ top: `${20 + index * 70}px` }} className="absolute">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </AnimatePresence>
    );
}

// Toast Hook
export function useToast() {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

    const addToast = (message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, addToast, removeToast };
}
