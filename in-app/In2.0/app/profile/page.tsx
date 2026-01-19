'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import Navigation from '@/components/Navigation';
import GlassHero from '@/components/profile/GlassHero';
import BentoFriendsGrid from '@/components/profile/BentoFriendsGrid';
import InviteLink from '@/components/profile/InviteLink';
import {
    getOrCreateProfile,
    updateProfilePreferences,
    updateMood,
} from '@/lib/profile';
import {
    ACTIVITY_OPTIONS,
    TIME_OPTIONS,
    DIETARY_OPTIONS
} from '@/lib/constants';
import { Check, ChevronRight, Edit2, MapPin, Sparkles } from 'lucide-react';

// For demo purposes, using a static userId. In production, this would come from auth.
const DEMO_USER_ID = 'demo-user-123';

export default function ProfilePage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [profile, setProfile] = useState<any>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSection, setEditingSection] = useState<string | null>(null);

    // Form states
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
    const [location, setLocation] = useState('');
    const [moodInput, setMoodInput] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const result = await getOrCreateProfile(DEMO_USER_ID);
            if (result.success && result.profile) {
                setProfile(result.profile);
                setFriends(result.friends || []);
                setSelectedActivities(result.profile.preferredActivities || []);
                setSelectedTimes(result.profile.availableTimes || []);
                setSelectedDietary(result.profile.dietaryRestrictions || []);
                setLocation(result.profile.defaultLocation || '');
                setMoodInput(result.profile.mood || '');
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const toggleActivity = (id: string) => {
        setSelectedActivities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const toggleTime = (id: string) => {
        setSelectedTimes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    const toggleDietary = (id: string) => {
        setSelectedDietary(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const savePreferences = async () => {
        startTransition(async () => {
            await updateProfilePreferences(DEMO_USER_ID, {
                preferredActivities: selectedActivities,
                availableTimes: selectedTimes,
                dietaryRestrictions: selectedDietary,
                defaultLocation: location,
            });
            setEditingSection(null);
        });
    };

    const saveMood = async () => {
        startTransition(async () => {
            await updateMood(DEMO_USER_ID, moodInput);
            setProfile((prev: any) => ({ ...prev, mood: moodInput }));
            setEditingSection(null);
        });
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-background pb-32 flex items-center justify-center">
                <div className="animate-pulse text-white/40">Loading profile...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-32">
            <div className="max-w-[430px] mx-auto px-6 pt-safe">
                {/* Header */}
                <div className="pt-8 mb-6">
                    <h1 className="text-white font-black text-2xl">Your Profile</h1>
                    <p className="text-white/40 text-sm">Personalize your experience</p>
                </div>

                {/* Hero Section */}
                <GlassHero
                    avatar={profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${DEMO_USER_ID}`}
                    username={profile?.username || 'Guest'}
                    mood={profile?.mood || 'Ready for adventure'}
                />

                {/* Mood Editor */}
                {editingSection === 'mood' ? (
                    <GlassCard className="p-4 mb-6">
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Current Mood</label>
                        <input
                            type="text"
                            value={moodInput}
                            onChange={(e) => setMoodInput(e.target.value)}
                            placeholder="What are you in the mood for?"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 mb-3"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setEditingSection(null)} className="flex-1 py-2 rounded-xl bg-white/5 text-white/60">
                                Cancel
                            </button>
                            <button onClick={saveMood} disabled={isPending} className="flex-1 py-2 rounded-xl bg-white text-black font-bold">
                                {isPending ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </GlassCard>
                ) : (
                    <button
                        onClick={() => setEditingSection('mood')}
                        className="w-full mb-6 p-4 rounded-elite glass flex items-center justify-between hover:bg-white/5 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles size={18} className="text-purple-400" />
                            <span className="text-white/80 text-sm">Update your mood</span>
                        </div>
                        <Edit2 size={16} className="text-white/40" />
                    </button>
                )}

                {/* Invite Link */}
                <InviteLink inviteUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${profile?.username || DEMO_USER_ID}`} />

                {/* Friends Section */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white font-bold">Friends</h2>
                        <button
                            onClick={() => router.push('/friends')}
                            className="text-xs text-white/40 flex items-center gap-1 hover:text-white transition-colors"
                        >
                            Manage <ChevronRight size={14} />
                        </button>
                    </div>
                    {friends.length > 0 ? (
                        <BentoFriendsGrid friends={friends.map(f => ({
                            id: f.id,
                            name: f.username || 'Friend',
                            avatar: f.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.id}`,
                            mood: f.mood
                        }))} />
                    ) : (
                        <GlassCard className="p-6 text-center">
                            <p className="text-white/40 mb-4">No friends yet</p>
                            <button
                                onClick={() => router.push('/friends')}
                                className="px-6 py-2 bg-white text-black rounded-xl font-bold text-sm"
                            >
                                Find Friends
                            </button>
                        </GlassCard>
                    )}
                </div>

                {/* Preferences Section */}
                <div className="mt-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-white font-bold">Your Preferences</h2>
                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Helps AI personalize</p>
                    </div>

                    {/* Activities */}
                    <GlassCard className="p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <span>🎯</span> Favorite Activities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {ACTIVITY_OPTIONS.map(activity => (
                                <button
                                    key={activity.id}
                                    onClick={() => toggleActivity(activity.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedActivities.includes(activity.id)
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {activity.emoji} {activity.label}
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Availability */}
                    <GlassCard className="p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <span>📅</span> When are you free?
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {TIME_OPTIONS.map(time => (
                                <button
                                    key={time.id}
                                    onClick={() => toggleTime(time.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedTimes.includes(time.id)
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {time.label}
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Dietary */}
                    <GlassCard className="p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <span>🍽️</span> Dietary Preferences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {DIETARY_OPTIONS.map(diet => (
                                <button
                                    key={diet.id}
                                    onClick={() => toggleDietary(diet.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${selectedDietary.includes(diet.id)
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {diet.label}
                                </button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Location */}
                    <GlassCard className="p-5">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                            <MapPin size={16} /> Default Location
                        </h3>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter zip code or neighborhood"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                        />
                    </GlassCard>

                    {/* Save Button */}
                    <button
                        onClick={savePreferences}
                        disabled={isPending}
                        className="w-full py-4 rounded-elite bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {isPending ? 'Saving...' : (
                            <>
                                <Check size={20} />
                                Save Preferences
                            </>
                        )}
                    </button>
                </div>
            </div>

            <Navigation />
        </main>
    );
}
