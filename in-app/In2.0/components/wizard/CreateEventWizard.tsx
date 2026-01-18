'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { createEvent } from '@/lib/actions';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';
import StepMood from './StepMood';
import StepLogistics from './StepLogistics';
import StepPreview from './StepPreview';

export default function CreateEventWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        mood: '',
        date: '',
        location: '',
        title: '',
        description: '',
        image: '',
        aiGenerated: false
    });

    useEffect(() => {
        const title = searchParams.get('title');
        const location = searchParams.get('location');
        const description = searchParams.get('description');
        const date = searchParams.get('date');
        const image = searchParams.get('image');
        const eventType = searchParams.get('eventType');

        if (title || location || description || date) {
            setFormData({
                mood: eventType || title || '',
                title: title || '',
                description: description || '',
                date: date ? new Date(date).toISOString().slice(0, 16) : '',
                location: location || '',
                image: image || '',
                aiGenerated: true
            });
            // If we have data, skip to step 3 for review
            setStep(3);
        }
    }, [searchParams]);

    const handleAIResult = (event: any) => {
        setFormData(prev => ({
            ...prev,
            mood: event.title, // Use title as mood/name
            title: event.title,
            description: event.description,
            date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
            location: event.location,
            image: event.image,
            aiGenerated: true
        }));
        nextStep();
    };

    const nextStep = () => {
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handlePublish = async () => {
        try {
            const result = await createEvent({
                title: formData.mood, // Using mood as title for now
                description: formData.mood,
                date: formData.date,
                location: formData.location,
                image: '/images/event-placeholder.jpg', // Default image or use random from mock
            });

            if (result.success && result.event) {
                // Trigger Confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#A020F0', '#FFD700', '#00FFFF']
                });

                // Navigate to the new event
                setTimeout(() => {
                    router.push(`/mood/${result.event.id}`);
                }, 1000); // Delay slightly to enjoy confetti
            } else {
                console.error('Failed to create event:', result.error);
                // Show error state
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative min-h-[500px]">
            {/* Progress Indicator */}
            <div className="flex gap-2 mb-8 justify-center">
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-white' : s < step ? 'w-4 bg-accent-purple' : 'w-4 bg-white/20'
                            }`}
                    />
                ))}
            </div>

            <div className="transition-opacity duration-300">
                {step === 1 && (
                    <StepMood
                        value={formData.mood}
                        onChange={(val) => setFormData({ ...formData, mood: val })}
                        onNext={nextStep}
                        onAIResult={handleAIResult}
                    />
                )}

                {step === 2 && (
                    <StepLogistics
                        date={formData.date}
                        location={formData.location}
                        onDateChange={(val) => setFormData({ ...formData, date: val })}
                        onLocationChange={(val) => setFormData({ ...formData, location: val })}
                        onNext={nextStep}
                        onBack={prevStep}
                    />
                )}

                {step === 3 && (
                    <StepPreview
                        data={formData}
                        onPublish={handlePublish}
                        onBack={prevStep}
                    />
                )}
            </div>
        </div>
    );
}
