'use client';

import GlassCard from '../GlassCard';

interface StepPreviewProps {
    data: {
        mood: string;
        date: string;
        location: string;
    };
    onPublish: () => void;
    onBack: () => void;
}

export default function StepPreview({ data, onPublish, onBack }: StepPreviewProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Review & Create</h2>
                <p className="text-white/60 text-sm">Check the details before inviting friends.</p>
            </div>

            <GlassCard className="overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-accent-purple/20 to-accent-orange/20 relative">
                    {/* Placeholder for event image */}
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        🎉
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-xl font-bold text-white capitalize">{data.mood}</h3>
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                            📅
                        </div>
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">When</p>
                            <p className="text-sm font-medium">{formatDate(data.date)}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                            📍
                        </div>
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Where</p>
                            <p className="text-sm font-medium">{data.location}</p>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 rounded-full font-bold text-lg bg-white/5 text-white hover:bg-white/10 transition-all duration-300"
                >
                    Edit
                </button>
                <button
                    onClick={onPublish}
                    className="flex-1 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-accent-orange to-accent-purple text-white shadow-lg shadow-purple-900/20 transition-all duration-300 transform active:scale-95"
                >
                    Create & Invite
                </button>
            </div>
        </div>
    );
}
