'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Users, MessageCircle, Link as LinkIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventId: string;
    eventTitle: string;
}

interface Friend {
    id: string;
    name: string;
    avatar: string;
    username?: string;
}

export default function InviteModal({ isOpen, onClose, eventId, eventTitle }: InviteModalProps) {
    const [copied, setCopied] = useState(false);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'friends' | 'share'>('friends');

    const inviteUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/guest/${eventId}`
        : `/guest/${eventId}`;

    // Mock friends - in real app, fetch from profile
    useEffect(() => {
        setFriends([
            { id: '1', name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', username: 'sarah' },
            { id: '2', name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', username: 'mike' },
            { id: '3', name: 'Jessica', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica', username: 'jessica' },
        ]);
    }, []);

    const toggleFriend = (id: string) => {
        setSelectedFriends(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: eventTitle,
                    text: `Join me for ${eventTitle}!`,
                    url: inviteUrl,
                });
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            copyToClipboard();
        }
    };

    const handleSendInvites = () => {
        // In real app, send invitations to selected friends
        console.log('Sending invites to:', Array.from(selectedFriends));
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
                                <h3 className="text-white font-bold text-lg">Invite Friends</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X size={18} className="text-white/60" />
                                </button>
                            </div>

                            {/* Tab Bar */}
                            <div className="flex bg-white/5 rounded-xl p-1">
                                <button
                                    onClick={() => setActiveTab('friends')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'friends' ? 'bg-white text-black' : 'text-white/40'
                                        }`}
                                >
                                    <Users size={14} className="inline mr-1" />
                                    Friends
                                </button>
                                <button
                                    onClick={() => setActiveTab('share')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'share' ? 'bg-white text-black' : 'text-white/40'
                                        }`}
                                >
                                    <Share2 size={14} className="inline mr-1" />
                                    Share Link
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'friends' ? (
                                    <motion.div
                                        key="friends"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-3"
                                    >
                                        {friends.length === 0 ? (
                                            <p className="text-white/40 text-center py-4">No friends to invite</p>
                                        ) : (
                                            friends.map(friend => (
                                                <button
                                                    key={friend.id}
                                                    onClick={() => toggleFriend(friend.id)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedFriends.has(friend.id)
                                                            ? 'bg-purple-500/20 border border-purple-500/50'
                                                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <img
                                                        src={friend.avatar}
                                                        alt={friend.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <span className="flex-1 text-left text-white font-medium">{friend.name}</span>
                                                    {selectedFriends.has(friend.id) && (
                                                        <Check size={18} className="text-purple-400" />
                                                    )}
                                                </button>
                                            ))
                                        )}

                                        {selectedFriends.size > 0 && (
                                            <button
                                                onClick={handleSendInvites}
                                                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition-transform"
                                            >
                                                Send {selectedFriends.size} Invite{selectedFriends.size > 1 ? 's' : ''}
                                            </button>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="share"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-3"
                                    >
                                        {/* Link Preview */}
                                        <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                                            <LinkIcon size={16} className="text-white/40 flex-shrink-0" />
                                            <span className="flex-1 text-white/60 text-sm truncate">{inviteUrl}</span>
                                            <button
                                                onClick={copyToClipboard}
                                                className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'
                                                    }`}
                                            >
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>

                                        {/* Native Share Button */}
                                        <button
                                            onClick={handleNativeShare}
                                            className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition-transform"
                                        >
                                            <Share2 size={18} />
                                            Share via...
                                        </button>

                                        <p className="text-white/30 text-xs text-center">
                                            Anyone with this link can join your hangout
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
