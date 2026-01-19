'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/lib/types';
import confetti from 'canvas-confetti';
import AvatarStack from './AvatarStack';
import InOutToggle from './InOutToggle';
import GlassCard from './GlassCard';
import EventChat from './EventChat';
import { toggleAttendance, voteForOption } from '@/lib/actions';
import ConsensusCard from './ConsensusCard';
import { Calendar, Check, Star, Share2 } from 'lucide-react';
import { downloadICS } from '@/lib/CalendarIntegration';
import ShareInvite from './ShareInvite';
import { useToast, ToastContainer } from './Toast';
import BentoChecklist from './BentoChecklist';
import PresenceFeed from './PresenceFeed';
import CalendarPicker from './CalendarPicker';
import InviteModal from './InviteModal';

import { useSearchParams } from 'next/navigation';

interface MoodDetailProps {
    event: any;
}

export default function MoodDetail({ event }: MoodDetailProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [rsvpStatus, setRsvpStatus] = useState<'in' | 'out' | null>(null);
    const [showCalendarPicker, setShowCalendarPicker] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { toasts, addToast, removeToast } = useToast();

    const isDating = searchParams.get('dating') === 'true';
    const senderName = searchParams.get('sender') || 'Someone';

    // Get current URL for sharing
    const [currentUrl, setCurrentUrl] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUrl(`${window.location.origin}${window.location.pathname}?dating=true&sender=Me`);
        }
    }, []);

    // Initial load from localStorage
    useEffect(() => {
        if (event.id) {
            const saved = localStorage.getItem(`rsvp_${event.id}`);
            if (saved === 'in' || saved === 'out') {
                setRsvpStatus(saved);
            }
        }
    }, [event.id]);

    const handleRsvp = async (status: 'in' | 'out') => {
        setRsvpStatus(status);
        if (event.id) {
            localStorage.setItem(`rsvp_${event.id}`, status);
        }

        if (status === 'in') {
            confetti({
                particleCount: 50,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#00FF00', '#FFFFFF']
            });

            // Auto-add to calendar
            downloadICS({
                title: event.title,
                description: event.description || '',
                location: event.location,
                startTime: new Date(event.date),
                durationMinutes: 120
            });
            addToast('✓ Added to calendar', 'success');
        }

        // User Name MVP: Just use "Me" or random if no auth
        await toggleAttendance(event.id, status, { name: 'Guest', userId: 'current-user-id' });
    };

    const isProposed = event.status === 'PROPOSED' || event.status === 'CONTINGENCY_VOTE';
    const isContingency = event.status === 'CONTINGENCY_VOTE';

    // Check if event is imminent (within 2 hours)
    const eventTime = new Date(event.date);
    const timeDiff = eventTime.getTime() - new Date().getTime();
    const isImminent = timeDiff > 0 && timeDiff < 2 * 60 * 60 * 1000;

    return (
        <>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="min-h-screen bg-background pb-32 relative">
                {/* Hero Image */}
                <div className="h-[40vh] relative">
                    <img
                        src={event.image || '/images/event-placeholder.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />

                    {/* Hide Back Button in Dating Mode */}
                    {!isDating && (
                        <button
                            onClick={() => router.back()}
                            className="absolute top-safe left-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white z-20"
                        >
                            ←
                        </button>
                    )}
                </div>

                <div className="px-6 -mt-10 relative z-10 space-y-6">
                    {/* Contingency Alert Banner */}
                    {isContingency && (
                        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 flex items-start gap-4 mb-4 backdrop-blur-md">
                            <div className="bg-red-500/20 p-2 rounded-full">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-200">Contingency Alert</h3>
                                <p className="text-red-200/80 text-sm">Original plan failed. Please vote on a Plan B below.</p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        {isDating ? (
                            <div className="space-y-1">
                                <h1 className="text-white/60 font-black text-xs uppercase tracking-[0.2em]">Personal Invitation</h1>
                                <h2 className="heading-lg text-white leading-tight">
                                    {senderName} wants to take you out.<br />
                                    <span className="text-accent-purple">Pick your favorite:</span>
                                </h2>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h1 className="heading-lg text-white">{event.title}</h1>
                                            {event.privacy === 'FRIENDS' && (
                                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">
                                                    Friends
                                                </span>
                                            )}
                                            {event.privacy === 'PRIVATE' && (
                                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
                                                    Private
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowCalendarPicker(true)}
                                            className="p-3 rounded-2xl bg-white text-black hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/5"
                                            title="Add to Calendar"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="p-3 rounded-2xl bg-purple-500 text-white hover:scale-110 active:scale-95 transition-all shadow-xl shadow-purple-500/30"
                                            title="Invite Friends"
                                        >
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Imminent Mode: Checklist & Map */}
                                {isImminent && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <BentoChecklist />

                                        <GlassCard className="p-4 space-y-2 border-orange-500/50 shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-white flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                                    Head there now
                                                </h3>
                                                <span className="text-xs font-mono text-orange-400">LIVE MAP</span>
                                            </div>
                                            <div className="h-40 bg-white/10 rounded-xl flex items-center justify-center text-white/40 text-sm overflow-hidden relative">
                                                {/* Placeholder Map Visual */}
                                                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black" />
                                                <div className="z-10 bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
                                                    Tap for Directions
                                                </div>
                                            </div>
                                            <p className="text-white/90 text-sm font-medium">{event.location}</p>
                                        </GlassCard>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isDating && currentUrl && (
                            <div className="space-y-3">
                                <ShareInvite
                                    title={event.title}
                                    url={currentUrl}
                                    type="hangout"
                                />

                                {/* Dating Mode Discovery Button - Only show for proposed events with options */}
                                {isProposed && event.options && event.options.length > 0 && (
                                    <button
                                        onClick={() => {
                                            const datingUrl = `${window.location.origin}${window.location.pathname}?dating=true&sender=Me`;
                                            navigator.clipboard.writeText(datingUrl);
                                            addToast('💝 Dating invite link copied!', 'success');
                                        }}
                                        className="w-full py-3 px-4 rounded-2xl glass border border-pink-500/20 text-pink-400 font-bold text-sm hover:bg-pink-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        💝 Share as Date Invite
                                    </button>
                                )}
                            </div>
                        )}

                        {!isDating && (
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{isProposed ? 'Voting in Progress' : event.location}</span>
                            </div>
                        )}
                    </div>

                    {isProposed && event.options && (
                        <div className="space-y-4">
                            {!isDating && (
                                <div className="flex items-center gap-3">
                                    <Star className="text-orange-400 fill-orange-400" size={16} />
                                    <h3 className="text-white font-black text-xs uppercase tracking-widest text--white">Group Consensus</h3>
                                </div>
                            )}
                            <ConsensusCard
                                eventId={event.id}
                                options={event.options}
                                deadline={event.deadline ? new Date(event.deadline) : undefined}
                                totalGuests={event.guests?.length || 0}
                            />

                            <PresenceFeed guests={event.guests || []} />

                            {/* Dating Mode: Accept/Decline Buttons */}
                            {isDating && (
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => {
                                            handleRsvp('in');
                                            addToast(`💝 You're in! ${senderName} will be notified`, 'success');
                                        }}
                                        className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        ✓ I&apos;m In!
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleRsvp('out');
                                            addToast('Response saved', 'info');
                                        }}
                                        className="flex-1 py-4 bg-white/10 text-white/80 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                                    >
                                        Maybe Later
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hide RSVP & Chat in Focused Dating Mode */}
                    {!isDating && (
                        <>
                            <InOutToggle status={rsvpStatus} onToggle={handleRsvp} />

                            <GlassCard className="p-4 flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-white/60 mb-1">Who&apos;s going?</div>
                                    <AvatarStack users={event.guests || []} max={4} size="md" />
                                </div>
                                <div className="text-xl font-bold text-white">
                                    {event.guests?.length || 0}
                                </div>
                            </GlassCard>

                            {event.id && (
                                <EventChat
                                    eventId={event.id}
                                    initialComments={event.comments || []}
                                    currentUser={{ id: 'current-user-id', name: 'Guest', avatar: '' }}
                                />
                            )}

                            <GlassCard className="p-4 space-y-2">
                                <h3 className="font-bold text-white">Location</h3>
                                <div className="h-32 bg-white/10 rounded-xl flex items-center justify-center text-white/40 text-sm">
                                    Map View
                                </div>
                                <p className="text-white/80 text-sm">{event.location}</p>
                            </GlassCard>

                            <div className="space-y-2">
                                <h3 className="font-bold text-white">About</h3>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    {event.description}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Calendar Picker Modal */}
            <CalendarPicker
                isOpen={showCalendarPicker}
                onClose={() => setShowCalendarPicker(false)}
                event={{
                    title: event.title,
                    description: event.description,
                    date: new Date(event.date),
                    location: event.location || 'TBD'
                }}
            />

            {/* Invite Modal */}
            <InviteModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                eventId={event.id}
                eventTitle={event.title}
            />
        </>
    );
}
