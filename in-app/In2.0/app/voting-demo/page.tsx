'use client';

import { useState } from 'react';
import VotingCard, { VotingOption } from '@/components/VotingCard';

export default function VotingDemoPage() {
    const [totalVoters] = useState(5); // Simulating 5 people in the group
    // Set deadline to 2 minutes from now
    const [deadline] = useState(new Date(Date.now() + 2 * 60 * 1000));

    // Sample restaurant options that might come from the Flash agent
    const restaurantOptions: VotingOption[] = [
        {
            id: '1',
            title: 'Osteria Mozza',
            subtitle: 'Italian • $$$$ • 2.3 mi away',
            thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop',
            votes: 1
        },
        {
            id: '2',
            title: 'Nobu Malibu',
            subtitle: 'Japanese • $$$$ • 5.1 mi away',
            thumbnail: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop',
            votes: 2
        },
        {
            id: '3',
            title: 'Gjelina',
            subtitle: 'American • $$$ • 1.8 mi away',
            thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop',
            votes: 1
        }
    ];

    const handleVote = (optionId: string) => {
        console.log('Voted for option:', optionId);
        // In a real app, this would send the vote to your backend
    };

    const handleAddToCalendar = (winningOption: VotingOption) => {
        console.log('Adding to calendar:', winningOption);
        // In a real app, this would integrate with calendar APIs
        alert(`Adding "${winningOption.title}" to your calendar!`);
    };

    return (
        <div className="mobile-container min-h-screen p-6">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="heading-xl text-white">
                        VotingCard Demo
                    </h1>
                    <p className="text-white/60 max-w-xl mx-auto">Experience the &quot;Bento Voting&quot; system. Click options to vote. When consensus is reached, the plan locks.</p>
                </div>

                {/* VotingCard Component */}
                <VotingCard
                    options={restaurantOptions}
                    totalVoters={totalVoters}
                    deadline={deadline}
                    onVote={handleVote}
                    onAddToCalendar={handleAddToCalendar}
                />

                {/* Instructions */}
                <div className="glass p-6 space-y-4">
                    <h2 className="heading-md text-white">How It Works</h2>
                    <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Click on any restaurant option to cast your vote</li>
                        <li>• Each option shows real-time vote counts and percentages</li>
                        <li>• The leading option is highlighted with a ring</li>
                        <li>• When majority is reached (3/5 votes), the card transforms</li>
                        <li>• The confirmed state shows the winning option with an &quot;Add to Calendar&quot; button</li>
                    </ul>
                </div>

                {/* Component Features */}
                <div className="glass p-6 space-y-4">
                    <h2 className="heading-md text-white">Component Features</h2>
                    <div className="grid gap-3">
                        <div className="bg-white/5 rounded-2xl p-4">
                            <h3 className="font-bold text-white mb-1">✨ Glassmorphic Design</h3>
                            <p className="text-sm text-white/60">
                                Follows the Bento Grid system with 32px border radius and 20px backdrop blur
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4">
                            <h3 className="font-bold text-white mb-1">🎬 Framer Motion Animations</h3>
                            <p className="text-sm text-white/60">
                                Smooth transitions between voting and confirmed states with spring physics
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4">
                            <h3 className="font-bold text-white mb-1">🗳️ Real-time Consensus</h3>
                            <p className="text-sm text-white/60">
                                Automatically detects when majority threshold is reached
                            </p>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4">
                            <h3 className="font-bold text-white mb-1">📊 Progress Visualization</h3>
                            <p className="text-sm text-white/60">
                                Animated progress bars show vote distribution in real-time
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
