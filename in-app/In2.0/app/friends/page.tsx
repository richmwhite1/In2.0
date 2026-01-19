'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import Navigation from '@/components/Navigation';
import { getSuggestedFriends, addFriend, getFriendsFeed } from '@/lib/actions';
import { getPendingFriendRequests, acceptFriendRequest, declineFriendRequest, getOrCreateProfile } from '@/lib/profile';
import { Search, UserPlus, Check, X, Users, ChevronLeft, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useToast, ToastContainer } from '@/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const DEMO_USER_ID = 'demo-user-123';

export default function FriendsPage() {
    const router = useRouter();
    const { toasts, addToast, removeToast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [profile, setProfile] = useState<any>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [friendEvents, setFriendEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover'>('friends');

    useEffect(() => {
        const fetchData = async () => {
            const [profileResult, requestsResult, suggestionsResult, feedResult] = await Promise.all([
                getOrCreateProfile(DEMO_USER_ID),
                getPendingFriendRequests(DEMO_USER_ID),
                getSuggestedFriends(),
                getFriendsFeed()
            ]);

            if (profileResult.success) {
                setProfile(profileResult.profile);
                setFriends(profileResult.friends || []);
            }
            setPendingRequests(requestsResult.requests || []);
            if (suggestionsResult.success) {
                setSuggestions(suggestionsResult.profiles || []);
            }
            setFriendEvents(feedResult.events || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleAddFriend = async (username: string) => {
        startTransition(async () => {
            const result = await addFriend(username);
            if (result.success) {
                addToast(`Friend request sent to ${username}!`, 'success');
                setSuggestions(prev => prev.filter(s => s.username !== username));
            } else {
                addToast(result.message || 'Failed to send request', 'error');
            }
        });
    };

    const handleAccept = async (requestId: string, username: string) => {
        startTransition(async () => {
            await acceptFriendRequest(requestId);
            addToast(`You and ${username} are now friends!`, 'success');
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        });
    };

    const handleDecline = async (requestId: string) => {
        startTransition(async () => {
            await declineFriendRequest(requestId);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        });
    };

    const copyInviteLink = () => {
        const link = `${window.location.origin}/invite/${profile?.username || DEMO_USER_ID}`;
        navigator.clipboard.writeText(link);
        addToast('Invite link copied!', 'success');
    };

    const filteredFriends = friends.filter(f =>
        f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.mood?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <main className="min-h-screen bg-background pb-32 flex items-center justify-center">
                <div className="animate-pulse text-white/40">Loading friends...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-32">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="max-w-[430px] mx-auto px-6 pt-safe">
                {/* Header */}
                <div className="pt-8 mb-6 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl glass">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-white font-black text-2xl">Friends</h1>
                        <p className="text-white/40 text-sm">{friends.length} connections</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6 p-1 rounded-elite bg-white/5">
                    {[
                        { id: 'friends', label: 'Friends', count: friends.length },
                        { id: 'requests', label: 'Requests', count: pendingRequests.length },
                        { id: 'discover', label: 'Discover', count: suggestions.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 px-4 rounded-[28px] text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-black'
                                : 'text-white/60 hover:text-white'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && activeTab !== tab.id && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-[10px]">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search (Friends Tab) */}
                {activeTab === 'friends' && (
                    <div className="mb-6 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search friends..."
                            className="w-full bg-white/5 border border-white/10 rounded-elite py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                        />
                    </div>
                )}

                {/* Invite Link Banner */}
                {activeTab === 'discover' && (
                    <button
                        onClick={copyInviteLink}
                        className="w-full mb-6 p-4 rounded-elite glass border border-purple-500/30 flex items-center justify-between hover:bg-purple-500/10 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                                <LinkIcon size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-white font-bold text-sm">Share Invite Link</p>
                                <p className="text-white/40 text-xs">Invite friends outside the app</p>
                            </div>
                        </div>
                        <Sparkles size={18} className="text-purple-400" />
                    </button>
                )}

                {/* Content Based on Tab */}
                <AnimatePresence mode="wait">
                    {activeTab === 'friends' && (
                        <motion.div
                            key="friends"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {filteredFriends.length === 0 ? (
                                <GlassCard className="p-8 text-center">
                                    <Users size={32} className="mx-auto mb-4 text-white/20" />
                                    <p className="text-white/40 mb-2">No friends yet</p>
                                    <p className="text-white/60 text-sm mb-4">Discover new people or invite your friends</p>
                                    <button
                                        onClick={() => setActiveTab('discover')}
                                        className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm"
                                    >
                                        Find Friends
                                    </button>
                                </GlassCard>
                            ) : (
                                filteredFriends.map(friend => (
                                    <GlassCard key={friend.id} className="p-4 flex items-center gap-4">
                                        <img
                                            src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                                            alt={friend.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">@{friend.username}</p>
                                            <p className="text-white/40 text-sm truncate">{friend.mood || 'Available'}</p>
                                        </div>
                                        <button className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all">
                                            Invite
                                        </button>
                                    </GlassCard>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {pendingRequests.length === 0 ? (
                                <GlassCard className="p-8 text-center">
                                    <Check size={32} className="mx-auto mb-4 text-white/20" />
                                    <p className="text-white/40">No pending requests</p>
                                </GlassCard>
                            ) : (
                                pendingRequests.map(request => (
                                    <GlassCard key={request.id} className="p-4 flex items-center gap-4">
                                        <img
                                            src={request.requester.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requester.id}`}
                                            alt={request.requester.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">@{request.requester.username}</p>
                                            <p className="text-white/40 text-sm">Wants to connect</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAccept(request.id, request.requester.username)}
                                                className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-all"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDecline(request.id)}
                                                className="w-10 h-10 rounded-full bg-white/10 text-white/60 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </GlassCard>
                                ))
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'discover' && (
                        <motion.div
                            key="discover"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-3"
                        >
                            {suggestions.length === 0 ? (
                                <GlassCard className="p-8 text-center">
                                    <Sparkles size={32} className="mx-auto mb-4 text-white/20" />
                                    <p className="text-white/40 mb-2">No suggestions right now</p>
                                    <p className="text-white/60 text-sm">Invite friends with your link above</p>
                                </GlassCard>
                            ) : (
                                suggestions.map(user => (
                                    <GlassCard key={user.id} className="p-4 flex items-center gap-4">
                                        <img
                                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                                            alt={user.username}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">@{user.username}</p>
                                            <p className="text-white/40 text-sm truncate">{user.mood || 'New to In.'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddFriend(user.username)}
                                            disabled={isPending}
                                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all"
                                        >
                                            <UserPlus size={18} />
                                        </button>
                                    </GlassCard>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Friends' Activity (shown when on Friends tab and has events) */}
                {activeTab === 'friends' && friendEvents.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-white font-bold mb-4">Friends&apos; Plans</h3>
                        <div className="space-y-3">
                            {friendEvents.slice(0, 3).map(event => (
                                <GlassCard
                                    key={event.id}
                                    className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                                    onClick={() => router.push(`/mood/${event.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={event.coverPhoto || event.image || '/images/event-placeholder.jpg'}
                                            alt={event.title}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">{event.title}</p>
                                            <p className="text-white/40 text-sm truncate">{event.location}</p>
                                        </div>
                                        <button className="px-4 py-2 rounded-xl bg-white text-black text-sm font-bold">
                                            Join
                                        </button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Navigation />
        </main>
    );
}
