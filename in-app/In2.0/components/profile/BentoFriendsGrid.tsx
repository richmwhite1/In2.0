'use client';

import { User } from '@/lib/types';
import GlassCard from '../GlassCard';
import BentoGrid, { BentoItem } from '../BentoGrid';
import { Plus } from 'lucide-react';

interface Friend extends User {
    mood?: string;
}

interface BentoFriendsGridProps {
    friends: Friend[];
}

export default function BentoFriendsGrid({ friends }: BentoFriendsGridProps) {
    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="label opacity-50">Mutuals & Friends</h2>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold">
                    {friends.length} TOTAL
                </span>
            </div>

            <BentoGrid>
                {friends.map((friend, index) => (
                    <BentoItem key={friend.id} span={index % 3 === 0 ? 2 : 1}>
                        <GlassCard className="p-5 h-full flex flex-col justify-between" hover>
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={friend.avatar}
                                    alt={friend.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                                />
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{friend.name}</p>
                                    <p className="text-[10px] text-white/40 uppercase tracking-tight truncate">
                                        {friend.mood || 'Chilling'}
                                    </p>
                                </div>
                            </div>

                            <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 group">
                                <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                                <span className="text-[10px] font-bold uppercase">Invite</span>
                            </button>
                        </GlassCard>
                    </BentoItem>
                ))}
            </BentoGrid>
        </section>
    );
}
