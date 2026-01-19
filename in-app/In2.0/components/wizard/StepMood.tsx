'use client';

import { useState } from 'react';
import { getMoodRecommendation } from '@/lib/actions';
import { Loader2, Sparkles } from 'lucide-react';

interface StepMoodProps {
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
    onAIResult: (event: any) => void;
}

export default function StepMood({ value, onChange, onNext, onAIResult }: StepMoodProps) {
    const [isLoading, setIsLoading] = useState(false);

    const predefinedMoods = [
        { id: 'chill', label: 'Chill', icon: '🍷' },
        { id: 'party', label: 'Party', icon: '🪩' },
        { id: 'dinner', label: 'Dinner', icon: '🍽️' },
        { id: 'adventure', label: 'Adventure', icon: '🏔️' },
    ];

    const handleNext = async () => {
        // If it's a long description, let's treat it as a prompt for AI
        const isPredefined = predefinedMoods.some(m => m.label === value);

        if (!isPredefined && value.length > 10) {
            setIsLoading(true);
            try {
                const result = await getMoodRecommendation(value);
                if (result.success && result.event) {
                    onAIResult(result.event);
                    return;
                }
            } catch (error) {
                console.error('AI recommendation failed:', error);
            } finally {
                setIsLoading(false);
            }
        }

        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">What&apos;s the plan?</h2>
                <p className="text-white/60 text-sm">Pick an activity or describe what you want to do.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {predefinedMoods.map((mood) => (
                    <button
                        key={mood.id}
                        onClick={() => onChange(mood.label)}
                        className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${value === mood.label
                            ? 'bg-white/10 border-accent-purple/50 scale-[1.02]'
                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                    >
                        <span className="text-3xl">{mood.icon}</span>
                        <span className="font-medium">{mood.label}</span>
                    </button>
                ))}
            </div>

            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Or describe it: 'Sunset drinks at a rooftop bar...'"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-accent-purple/50 transition-colors resize-none"
                />
                <p className="text-xs text-white/40 mt-2">Tip: Describe your idea and we&apos;ll suggest venues</p>
            </div>

            <button
                onClick={handleNext}
                disabled={!value || isLoading}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${value
                    ? 'bg-gradient-to-r from-accent-orange to-accent-purple text-white shadow-lg shadow-purple-900/20'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
            >
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        {(!predefinedMoods.some(m => m.label === value) && value.length > 10) ? (
                            <>
                                <Sparkles size={18} />
                                Get Suggestions
                            </>
                        ) : (
                            'Next Step'
                        )}
                    </>
                )}
            </button>
        </div>
    );
}
