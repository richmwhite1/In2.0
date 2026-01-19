'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, ExternalLink } from 'lucide-react';
import GlassCard from './GlassCard';

interface CalendarPickerProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        title: string;
        description?: string;
        date: Date;
        location: string;
    };
}

export default function CalendarPicker({ isOpen, onClose, event }: CalendarPickerProps) {
    const formatDateForGoogle = (date: Date) => {
        // Format: YYYYMMDDTHHmmssZ
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const formatDateForApple = (date: Date) => {
        return date.toISOString();
    };

    const getGoogleCalendarUrl = () => {
        const startDate = formatDateForGoogle(event.date);
        const endDate = formatDateForGoogle(new Date(event.date.getTime() + 2 * 60 * 60 * 1000)); // 2 hours later

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            dates: `${startDate}/${endDate}`,
            details: event.description || `Hangout: ${event.title}`,
            location: event.location || '',
        });

        return `https://www.google.com/calendar/render?${params.toString()}`;
    };

    const getAppleCalendarUrl = () => {
        // For Apple Calendar, we generate an ICS file and trigger download
        const startDate = event.date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const endDate = new Date(event.date.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//In.//Hangout//EN
BEGIN:VEVENT
UID:${Date.now()}@in.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || event.title}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        return URL.createObjectURL(blob);
    };

    const handleGoogleCalendar = () => {
        window.open(getGoogleCalendarUrl(), '_blank');
        onClose();
    };

    const handleAppleCalendar = () => {
        const link = document.createElement('a');
        link.href = getAppleCalendarUrl();
        link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-sm relative z-10"
                    >
                        <GlassCard className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white font-bold text-lg">Add to Calendar</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={18} className="text-white/60" />
                                </button>
                            </div>

                            <p className="text-white/60 text-sm">{event.title}</p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleGoogleCalendar}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                                            <path fill="currentColor" d="M19.5 4h-3V2.5a.5.5 0 0 0-1 0V4h-7V2.5a.5.5 0 0 0-1 0V4h-3A2.5 2.5 0 0 0 2 6.5v12A2.5 2.5 0 0 0 4.5 21h15a2.5 2.5 0 0 0 2.5-2.5v-12A2.5 2.5 0 0 0 19.5 4zm1.5 14.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V9h18v9.5z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-bold">Google Calendar</p>
                                        <p className="text-white/40 text-xs">Opens in new tab</p>
                                    </div>
                                    <ExternalLink size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
                                </button>

                                <button
                                    onClick={handleAppleCalendar}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                        <Calendar size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-bold">Apple Calendar</p>
                                        <p className="text-white/40 text-xs">Downloads .ics file</p>
                                    </div>
                                    <ExternalLink size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
