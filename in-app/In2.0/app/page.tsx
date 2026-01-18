'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EventCard from '@/components/EventCard';
import Navigation from '@/components/Navigation';
import BentoGrid, { BentoItem } from '@/components/BentoGrid';
import { mockEvents } from '@/lib/mockData';
import { createEvent } from '@/lib/actions';
import { Calendar, MapPin, Type } from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [quickCreate, setQuickCreate] = useState({
        activity: '',
        time: '',
        location: '',
        isDating: false
    });

    const handleQuickCreate = async () => {
        if (!quickCreate.activity || !quickCreate.time || !quickCreate.location) return;

        setIsCreating(true);
        try {
            const result = await createEvent({
                title: quickCreate.activity,
                description: quickCreate.activity,
                date: quickCreate.time,
                location: quickCreate.location,
                type: quickCreate.isDating ? 'DATE' : 'HANGOUT'
            });

            if (result.success && result.event) {
                router.push(`/mood/${result.event.id}${quickCreate.isDating ? '?dating=true&sender=You' : ''}`);
            }
        } catch (error) {
            console.error('Failed to create:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <main className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 glass-nav px-6 py-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-white font-black text-2xl mb-1">Plans</h1>
                        <p className="text-white/60 text-sm">Organize hangouts without the chaos</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                </div>
            </header>

            {/* Quick Create - 3 Fields */}
            <div className="px-6 mb-8">
                <div className="glass p-6 rounded-[32px] border border-white/10 space-y-4">
                    <h2 className="text-white font-bold text-lg mb-4">Create Plan</h2>

                    {/* Activity */}
                    <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Activity (e.g., Grab coffee, Hike, Dinner)"
                            value={quickCreate.activity}
                            onChange={(e) => setQuickCreate({ ...quickCreate, activity: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Time */}
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="datetime-local"
                            value={quickCreate.time}
                            onChange={(e) => setQuickCreate({ ...quickCreate, time: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Location */}
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Location"
                            value={quickCreate.location}
                            onChange={(e) => setQuickCreate({ ...quickCreate, location: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Dating Mode Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <div>
                            <p className="text-white font-medium text-sm">Make this a Date Invite</p>
                            <p className="text-white/40 text-xs">1-on-1 focused, hides group features</p>
                        </div>
                        <button
                            onClick={() => setQuickCreate({ ...quickCreate, isDating: !quickCreate.isDating })}
                            className={`relative w-14 h-8 rounded-full transition-colors ${quickCreate.isDating ? 'bg-pink-500' : 'bg-white/10'
                                }`}
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white transition-transform ${quickCreate.isDating ? 'translate-x-6' : ''
                                }`} />
                        </button>
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={handleQuickCreate}
                        disabled={!quickCreate.activity || !quickCreate.time || !quickCreate.location || isCreating}
                        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${quickCreate.activity && quickCreate.time && quickCreate.location
                            ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white shadow-lg'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                    >
                        {isCreating ? 'Creating...' : 'Create & Invite'}
                    </button>
                </div>
            </div>

            {/* Your Plans */}
            <div className="px-6 mb-6">
                <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-4">Your Plans</h3>
            </div>

            {/* Event Grid */}
            <div className="px-6">
                {mockEvents.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/40 mb-4">No plans yet</p>
                        <p className="text-white/60 text-sm">Create your first plan above</p>
                    </div>
                ) : (
                    <BentoGrid>
                        {mockEvents.map((event, index) => {
                            const span = index % 5 === 0 || index % 5 === 3 ? 2 : 1;
                            return (
                                <BentoItem key={event.id} span={span}>
                                    <EventCard event={event} index={index} />
                                </BentoItem>
                            );
                        })}
                    </BentoGrid>
                )}
            </div>

            {/* Navigation */}
            <Navigation />
        </main>
    );
}
