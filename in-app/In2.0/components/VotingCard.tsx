'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

export interface VotingOption {
    id: string;
    title: string;
    subtitle?: string;
    thumbnail: string;
    votes: number;
}

interface VotingCardProps {
    options: VotingOption[];
    totalVoters: number;
    deadline?: Date;
    onVote?: (optionId: string) => void;
    onAddToCalendar?: (winningOption: VotingOption) => void;
    className?: string;
}

export default function VotingCard({
    options,
    totalVoters,
    deadline,
    onVote,
    onAddToCalendar,
    className = ''
}: VotingCardProps) {
    const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
    const [localOptions, setLocalOptions] = useState(options);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [winningOption, setWinningOption] = useState<VotingOption | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    // Calculate majority threshold (more than 50%)
    const majorityThreshold = Math.ceil(totalVoters / 2);

    // Timer logic
    useEffect(() => {
        if (!deadline || isConfirmed) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = deadline.getTime() - now;

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft('00:00');

                // Finalize vote automatically
                const maxVotes = Math.max(...localOptions.map(opt => opt.votes));
                // If there are votes, pick the winner (or first of the winners in tie)
                if (maxVotes > 0) {
                    const leader = localOptions.find(opt => opt.votes === maxVotes);
                    if (leader) {
                        setIsConfirmed(true);
                        setWinningOption(leader);
                        // Trigger confetti
                        import('canvas-confetti').then((confettiModule) => {
                            confettiModule.default({
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.6 }
                            });
                        });
                    }
                }
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline, isConfirmed, localOptions]);

    // Check for consensus
    useEffect(() => {
        const maxVotes = Math.max(...localOptions.map(opt => opt.votes));
        const leader = localOptions.find(opt => opt.votes === maxVotes);

        if (leader && leader.votes >= majorityThreshold && !isConfirmed) {
            setIsConfirmed(true);
            setWinningOption(leader);

            // Trigger confetti dynamically to avoid SSR issues
            import('canvas-confetti').then((confettiModule) => {
                const confetti = confettiModule.default;
                const duration = 3 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => {
                    return Math.random() * (max - min) + min;
                }

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);

                    // since particles fall down, start a bit higher than random
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);
            });
        }
    }, [localOptions, majorityThreshold, isConfirmed]);

    const handleVote = (optionId: string) => {
        if (isConfirmed) return;

        setLocalOptions(prev => {
            return prev.map(opt => {
                // Case 1: Undoing vote (clicking same option)
                if (votedOptionId === optionId && opt.id === optionId) {
                    return { ...opt, votes: Math.max(0, opt.votes - 1) };
                }
                // Case 2: Changing vote
                // Decrement previous vote
                if (votedOptionId && opt.id === votedOptionId) {
                    return { ...opt, votes: Math.max(0, opt.votes - 1) };
                }
                // Increment new vote
                if (opt.id === optionId && votedOptionId !== optionId) {
                    return { ...opt, votes: opt.votes + 1 };
                }
                return opt;
            });
        });

        // Update voted state
        if (votedOptionId === optionId) {
            // Undo
            setVotedOptionId(null);
        } else {
            // New vote or change
            setVotedOptionId(optionId);
            onVote?.(optionId);
        }
    };

    const handleAddToCalendar = () => {
        if (winningOption) {
            onAddToCalendar?.(winningOption);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {!isConfirmed ? (
                <motion.div
                    key="voting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={className}
                >
                    <GlassCard className="p-6">
                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="heading-md text-white">Vote for Your Pick</h3>
                                    {timeLeft && (
                                        <div className="text-sm text-red-400 font-mono mt-1 flex items-center gap-1">
                                            <span>⏰</span> {timeLeft} remaining
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-white/60">
                                    {majorityThreshold} votes needed
                                </div>
                            </div>

                            {/* Voting Options Grid */}
                            <div className="grid grid-cols-1 gap-3">
                                {localOptions.map((option, index) => {
                                    const votePercentage = totalVoters > 0
                                        ? (option.votes / totalVoters) * 100
                                        : 0;
                                    const isVoted = votedOptionId === option.id;
                                    const isLeading = option.votes === Math.max(...localOptions.map(o => o.votes)) && option.votes > 0;

                                    return (
                                        <motion.button
                                            key={option.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleVote(option.id)}
                                            disabled={isConfirmed}
                                            className={`
                                                relative overflow-hidden rounded-extra p-4
                                                transition-all duration-300
                                                ${isVoted
                                                    ? 'bg-white/10 border-2 border-white/30'
                                                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                                }
                                                ${votedOptionId && !isVoted ? 'opacity-50' : ''}
                                                ${isLeading ? 'ring-2 ring-white/20' : ''}
                                                disabled:cursor-not-allowed
                                            `}
                                        >
                                            {/* Background Progress Bar */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${votePercentage}%` }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                            />

                                            {/* Content */}
                                            <div className="relative flex items-center gap-4">
                                                {/* Thumbnail */}
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-charcoal">
                                                    <img
                                                        src={option.thumbnail}
                                                        alt={option.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 text-left">
                                                    <h4 className="font-bold text-white text-lg">
                                                        {option.title}
                                                    </h4>
                                                    {option.subtitle && (
                                                        <p className="text-sm text-white/60 mt-1">
                                                            {option.subtitle}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Vote Count */}
                                                <div className="flex flex-col items-end gap-1">
                                                    <motion.div
                                                        className={`
                                                            text-2xl font-black
                                                            ${isLeading ? 'text-white' : 'text-white/60'}
                                                        `}
                                                        animate={isVoted ? { scale: [1, 1.2, 1] } : {}}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        {option.votes}
                                                    </motion.div>
                                                    <div className="text-xs text-white/40">
                                                        {votePercentage.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Vote Status */}
                            {votedOptionId && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center text-sm text-white/60 pt-2"
                                >
                                    ✓ Your vote has been recorded
                                </motion.div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>
            ) : (
                <motion.div
                    key="confirmed"
                    initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.34, 1.56, 0.64, 1] // Bounce easing
                    }}
                    className={className}
                >
                    <GlassCard className="p-8 relative overflow-hidden">
                        {/* Animated Background Gradient */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20"
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 100%'],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatType: 'reverse',
                            }}
                        />

                        <div className="relative space-y-6">
                            {/* Success Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className="flex justify-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </motion.div>

                            {/* Confirmed Text */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-center"
                            >
                                <h3 className="heading-lg text-white mb-2">
                                    Consensus Reached! 🎉
                                </h3>
                                <p className="text-white/60">
                                    The group has decided on
                                </p>
                            </motion.div>

                            {/* Winning Option Card */}
                            {winningOption && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white/10 rounded-extra p-6 border-2 border-white/20"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={winningOption.thumbnail}
                                                alt={winningOption.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-2xl font-bold text-white">
                                                {winningOption.title}
                                            </h4>
                                            {winningOption.subtitle && (
                                                <p className="text-white/70 mt-1">
                                                    {winningOption.subtitle}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="text-sm font-bold text-white">
                                                    {winningOption.votes} votes
                                                </div>
                                                <div className="text-sm text-white/60">
                                                    ({((winningOption.votes / totalVoters) * 100).toFixed(0)}%)
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Add to Calendar Button */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddToCalendar}
                                className="w-full btn-primary text-center py-4 text-lg font-bold"
                            >
                                📅 Add to Calendar
                            </motion.button>
                        </div>
                    </GlassCard>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
