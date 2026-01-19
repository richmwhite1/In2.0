'use server';

import { prisma } from '@/lib/db';
import { generateEventRecommendation, generateHangoutRecipe, generateConsensusOptions } from '@/lib/agent';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const DEMO_USER_ID = 'demo-user-123';

// Fallback suggestions when AI is unavailable
const FALLBACK_SUGGESTIONS = [
    { id: 'fallback-1', title: 'Local Coffee Shop', location: 'Nearby café', description: 'A cozy spot for catching up', flavorTag: 'Casual', expertTip: 'Great for morning hangouts' },
    { id: 'fallback-2', title: 'Park Meetup', location: 'Local park', description: 'Outdoor hangout with good vibes', flavorTag: 'Outdoors', expertTip: 'Perfect for sunny days' },
    { id: 'fallback-3', title: 'Downtown Spot', location: 'City center', description: 'Easy to access for everyone', flavorTag: 'Central', expertTip: 'Good for groups' },
];

/**
 * Get AI suggestions for venue options (used inline during create flow)
 */
export async function getAISuggestions(activity: string) {
    try {
        // Fetch user profile for location context
        const profile = await prisma.profile.findFirst({
            where: { userId: DEMO_USER_ID }
        });

        const locationContext = profile?.defaultLocation || 'local area';

        const options = await generateConsensusOptions(
            activity,
            `Looking for great spots for ${activity} in ${locationContext}.`
        );

        // Ensure options are serializable (no circular refs)
        const cleanOptions = options.map((opt: any) => ({
            id: opt.id || `opt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title: opt.title || 'Suggested Spot',
            location: opt.location || 'Local area',
            description: opt.description || '',
            image: opt.image || '',
            flavorTag: opt.flavorTag || '',
            expertTip: opt.expertTip || '',
            price: opt.price || '',
            sourceUrl: opt.sourceUrl || ''
        }));

        return { success: true, options: cleanOptions };
    } catch (error) {
        console.error('Failed to get AI suggestions:', error);
        // Return fallback suggestions instead of empty array
        return {
            success: true,
            options: FALLBACK_SUGGESTIONS.map(s => ({
                ...s,
                title: `${activity} at ${s.title}`,
            })),
            fallback: true
        };
    }
}

/**
 * Create event with pre-selected options from inline AI suggestions
 * If 1 option: creates confirmed hangout
 * If 2+ options: creates poll
 */
export async function createEventWithOptions(data: {
    title: string;
    date: string;
    type: string;
    privacy: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
    selectedOptions: Array<{
        title: string;
        location: string;
        description?: string;
        image?: string;
        flavorTag?: string;
        expertTip?: string;
    }>;
}) {
    try {
        const eventDate = new Date(data.date);
        if (isNaN(eventDate.getTime())) {
            throw new Error(`Invalid date: ${data.date}`);
        }

        const isPoll = data.selectedOptions.length > 1;
        const singleOption = data.selectedOptions.length === 1 ? data.selectedOptions[0] : null;

        const event = await prisma.event.create({
            data: {
                title: data.title,
                description: `${data.type} - ${data.title}`,
                date: eventDate,
                location: singleOption ? singleOption.location : 'TBD - Voting',
                type: isPoll ? 'POLL' : data.type,
                status: isPoll ? 'PROPOSED' : 'CONFIRMED',
                privacy: data.privacy,
                options: isPoll ? {
                    create: data.selectedOptions.map(opt => ({
                        title: opt.title,
                        location: opt.location,
                        description: opt.description || '',
                        image: opt.image || '',
                        expertTip: opt.expertTip,
                        flavorTag: opt.flavorTag,
                        voteCount: 0
                    }))
                } : undefined
            },
            include: { options: true }
        });

        revalidatePath('/');
        return { success: true, event };
    } catch (error) {
        console.error('Failed to create event with options:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create event' };
    }
}


export async function createEvent(data: {
    title: string;
    description?: string;
    date: string; // ISO string
    location: string;
    image?: string;
    type?: string;
    withSuggestions?: boolean;
    privacy?: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
    coverPhoto?: string;
}) {
    try {
        console.log('Creating event with data:', data);

        // Validations
        const eventDate = new Date(data.date);
        if (isNaN(eventDate.getTime())) {
            throw new Error(`Invalid date: ${data.date}`);
        }

        // Logic Branch: AI Suggestions Requested
        if (data.withSuggestions) {
            // Fetch user profile for location context
            const DEMO_USER_ID = 'demo-user-123';
            const profile = await prisma.profile.findFirst({
                where: { userId: DEMO_USER_ID }
            });

            // Use profile location or default to general area
            const locationContext = profile?.defaultLocation || 'local area';

            // Generate AI options using title + location context
            const options = await generateConsensusOptions(
                data.title,
                `${data.description || data.title}. Looking for spots in ${locationContext}.`
            );

            const event = await prisma.event.create({
                data: {
                    title: data.title,
                    description: data.description,
                    date: eventDate,
                    location: "TBD - Voting",
                    type: data.type || "POLL",
                    status: 'PROPOSED',
                    privacy: data.privacy || 'PRIVATE',
                    coverPhoto: data.coverPhoto,
                    options: {
                        create: options.map(opt => ({
                            title: opt.title,
                            location: opt.location,
                            description: opt.description,
                            image: opt.image,
                        }))
                    }
                },
                include: { options: true }
            });
            revalidatePath('/');
            return { success: true, event };
        }

        // Standard Creation
        const event = await prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                date: eventDate,
                location: data.location,
                image: data.coverPhoto || data.image || '/images/event-placeholder.jpg', // Use uploaded cover or default
                coverPhoto: data.coverPhoto,
                type: data.type || "EVENT",
                privacy: data.privacy || 'PRIVATE',
            },
        });

        console.log('Event created successfully:', event.id);
        revalidatePath('/');
        revalidatePath('/events');
        return { success: true, event };
    } catch (error) {
        console.error('Failed to create event - Full error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
        return { success: false, error: errorMessage };
    }
}

/**
 * Create a "Shadow Guest" - a temporary user account for a specific event
 * Sets a long-lived cookie for recognition
 */
export async function createShadowGuest(eventId: string, name: string) {
    try {
        // 1. Create the guest record
        const guest = await prisma.guest.create({
            data: {
                eventId,
                name,
                status: 'MAYBE', // Default to MAYBE until they confirm specific details
            }
        });

        // 2. Set strict, long-lived cookie
        const cookieStore = await cookies();

        // Expiry: 90 days
        const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

        cookieStore.set('guest_session', guest.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires
        });

        revalidatePath(`/guest/${eventId}`);
        return { success: true, guestId: guest.id, guestName: guest.name };
    } catch (error) {
        console.error('Failed to create shadow guest:', error);
        return { success: false, error: 'Failed to join event' };
    }
}

export async function toggleAttendance(eventId: string, status: string, guestInfo: { name: string; userId?: string; avatar?: string }) {
    try {
        // Simple logic: If guest exists (by userId or name+eventId), update. Else create.
        // For MVP without robust auth, we might rely on client-generated ID or just name.
        // Let's assume guestInfo has a 'userId' or we generate one client-side.

        // Check if guest exists
        // simplified lookup
        const existing = await prisma.guest.findFirst({
            where: {
                eventId,
                userId: guestInfo.userId, // Prefer userId
                // OR name match if no userId? Let's stick to userId for checking dupes if possible.
            }
        });

        if (existing) {
            await prisma.guest.update({
                where: { id: existing.id },
                data: { status },
            });
        } else {
            await prisma.guest.create({
                data: {
                    eventId,
                    status,
                    name: guestInfo.name,
                    userId: guestInfo.userId,
                    avatar: guestInfo.avatar,
                },
            });
        }

        revalidatePath(`/events/${eventId}`);
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to toggle attendance:', error);
        return { success: false, error: 'Failed to update attendance' };
    }
}

export async function postComment(eventId: string, message: string, author: { name: string; avatar?: string; userId?: string }) {
    try {
        const comment = await prisma.comment.create({
            data: {
                eventId,
                message,
                author: author.name,
                avatar: author.avatar,
                userId: author.userId,
            },
        });
        revalidatePath(`/events/${eventId}`);
        return { success: true, comment };
    } catch (error) {
        console.error('Failed to post comment:', error);
        return { success: false, error: 'Failed to post comment' };
    }
}

export async function getMoodRecommendation(prompt: string) {
    try {
        const event = await generateEventRecommendation(prompt);
        return { success: true, event };
    } catch (error) {
        console.error('Failed to get recommendation:', error);
        return { success: false, error: 'Failed to generate recommendation' };
    }
}

export async function getHangoutSuggestion(activity: string, mood?: string) {
    try {
        const event = await generateHangoutRecipe(activity, mood);
        return { success: true, event };
    } catch (error) {
        console.error('Failed to get hangout suggestions:', error);
        return { success: false, error: 'Failed to generate hangout suggestions' };
    }
}

export async function voteForOption(eventId: string, optionId: string, guestInfo: { name: string; userId?: string }) {
    try {
        // Find or create guest
        let guest = await prisma.guest.findFirst({
            where: {
                eventId,
                OR: [
                    { userId: guestInfo.userId },
                    { name: guestInfo.name }
                ]
            }
        });

        if (!guest) {
            // Create guest if not found
            guest = await prisma.guest.create({
                data: {
                    eventId,
                    name: guestInfo.name,
                    userId: guestInfo.userId,
                    status: 'MAYBE'
                }
            });
        }

        // Transaction to update vote and check consensus
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Vote and set voter to MAYBE (interested)
            await tx.guest.update({
                where: { id: guest.id },
                data: {
                    votedOptionId: optionId,
                    status: 'MAYBE' // Interested by voting
                },
            });

            const updatedOption = await tx.eventOption.update({
                where: { id: optionId },
                data: { voteCount: { increment: 1 } },
            });

            // 2. Check Consensus
            const totalGuests = await tx.guest.count({
                where: { eventId }
            });

            // If we have voters and reach 60% threshold OR minimum 3 votes
            const threshold = Math.max(3, Math.ceil(totalGuests * 0.6));
            if (totalGuests > 0 && updatedOption.voteCount >= threshold) {
                const event = await tx.event.findUnique({ where: { id: eventId } });
                if (event && event.status !== 'CONFIRMED') {
                    // Update event to CONFIRMED and set location
                    await tx.event.update({
                        where: { id: eventId },
                        data: {
                            status: 'CONFIRMED',
                            location: updatedOption.location || event.location // Use winning option's location
                        }
                    });

                    // AUTO-RSVP: Update all voters for winning option to IN status
                    await tx.guest.updateMany({
                        where: {
                            eventId,
                            votedOptionId: optionId
                        },
                        data: { status: 'IN' }
                    });

                    return { consensusReached: true, winningOption: updatedOption };
                }
            }
            return { consensusReached: false };
        });

        revalidatePath(`/mood/${eventId}`);
        return { success: true, consensusReached: result.consensusReached };
    } catch (error) {
        console.error('Failed to vote:', error);
        return { success: false, error: 'Failed to vote' };
    }
}

/**
 * Track affiliate click for partner reporting
 */
export async function trackAffiliateClick(data: {
    partnerId: string;
    eventId?: string;
    userId?: string;
}) {
    try {
        await prisma.affiliateClick.create({
            data: {
                partnerId: data.partnerId,
                eventId: data.eventId,
                userId: data.userId || `guest-${Date.now()}`,
            }
        });

        // Fire and forget - don't block user navigation
        return { success: true };
    } catch (error) {
        console.error('Error tracking affiliate click:', error);
        return { success: false };
    }
}

// Admin Actions

/**
 * Get partner analytics for admin dashboard
 */
export async function getPartnerAnalytics() {
    try {
        // Total clicks
        const totalClicks = await prisma.affiliateClick.count();

        // Top performing mood (based on events with clicks)
        const clicksByActivity = await prisma.affiliateClick.groupBy({
            by: ['eventId'],
            _count: true,
        });

        // Partner performance
        const partnerStats = await prisma.partner.findMany({
            include: {
                clicks: {
                    select: { id: true }
                }
            }
        });

        const partnerPerformance = partnerStats.map(p => ({
            id: p.id,
            name: p.name,
            clicks: p.clicks.length,
            category: p.category
        }));

        return {
            totalClicks,
            topMood: 'Dating', // Simplified for now
            partnerPerformance
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return { totalClicks: 0, topMood: 'N/A', partnerPerformance: [] };
    }
}

/**
 * Get all partners for admin table
 */
export async function getPartners() {
    try {
        const partners = await prisma.partner.findMany({
            include: {
                clicks: {
                    select: { id: true }
                }
            },
            orderBy: {
                priority: 'desc'
            }
        });

        return partners.map(p => ({
            ...p,
            clickCount: p.clicks.length
        }));
    } catch (error) {
        console.error('Error fetching partners:', error);
        return [];
    }
}

/**
 * Create new partner venue
 */
export async function createPartner(data: {
    name: string;
    category: string;
    zipCode: string;
    affiliateUrl: string;
    priority: number;
}) {
    try {
        const partner = await prisma.partner.create({
            data: {
                name: data.name,
                category: data.category,
                zipCode: data.zipCode,
                affiliateUrl: data.affiliateUrl,
                priority: data.priority,
                isActive: true
            }
        });

        return { success: true, partner };
    } catch (error) {
        console.error('Error creating partner:', error);
        return { success: false, error: 'Failed to create partner' };
    }
}

/**
 * Update existing partner
 */
export async function updatePartner(id: string, data: {
    name?: string;
    category?: string;
    zipCode?: string;
    affiliateUrl?: string;
    priority?: number;
    isActive?: boolean;
}) {
    try {
        const partner = await prisma.partner.update({
            where: { id },
            data
        });

        return { success: true, partner };
    } catch (error) {
        console.error('Error updating partner:', error);
        return { success: false, error: 'Failed to update partner' };
    }
}


/**
 * Delete partner
 */
export async function deletePartner(id: string) {
    try {
        await prisma.partner.delete({
            where: { id }
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting partner:', error);
        return { success: false, error: 'Failed to delete partner' };
    }
}

// Post-Event Feedback Actions

export async function checkPendingFeedbackEvent() {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find confirmed events that started more than 1 hour ago
        // We fetching recent ones to avoid checking ancient history if not needed, 
        // but for now let's just check all confirmed events in the last 2 weeks maybe?
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const events = await prisma.event.findMany({
            where: {
                status: 'CONFIRMED',
                date: {
                    lt: oneHourAgo,
                    gt: twoWeeksAgo
                }
            },
            take: 5,
            orderBy: {
                date: 'desc'
            }
        });

        // Filter in memory for metadata flags
        const pendingEvent = events.find(event => {
            const meta = event.metadata as any || {};
            return !meta.feedbackGiven && !meta.dismissedFeedback;
        });

        return { success: true, event: pendingEvent };
    } catch (error) {
        console.error('Error checking pending feedback:', error);
        return { success: false };
    }
}

export async function submitEventFeedback(eventId: string, rating: number, photo: string | null) {
    try {
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return { success: false, error: 'Event not found' };

        const currentMeta = event.metadata as any || {};
        const newMeta = {
            ...currentMeta,
            feedbackGiven: true,
            rating,
            postEventPhoto: photo,
            feedbackSubmittedAt: new Date().toISOString()
        };

        await prisma.event.update({
            where: { id: eventId },
            data: { metadata: newMeta }
        });

        return { success: true };
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: 'Failed to submit feedback' };
    }
}

export async function dismissEventFeedback(eventId: string) {
    try {
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) return { success: false, error: 'Event not found' };

        const currentMeta = event.metadata as any || {};
        const newMeta = {
            ...currentMeta,
            dismissedFeedback: true
        };

        await prisma.event.update({
            where: { id: eventId },
            data: { metadata: newMeta }
        });

        return { success: true };
    } catch (error) {
        console.error('Error dismissing feedback:', error);
        return { success: false, error: 'Failed to dismiss feedback' };
    }
}

/**
 * Run contingency check for an event (simulating a cron job)
 */
export async function runContingencyCheck(eventId: string, forceFailure: boolean = false) {
    console.log(`[Contingency] Checking event ${eventId}...`);
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) return { success: false, error: 'Event not found' };

        // 1. Check time (T < 4 hours)
        const timeDiff = new Date(event.date).getTime() - Date.now();
        const hoursRemaining = timeDiff / (1000 * 60 * 60);

        // Simulation logic:
        // Trigger if < 4 hours OR forceFailure is true
        // AND not already in contingency
        if (event.status === 'CONTINGENCY_VOTE') {
            return { success: true, message: 'Already in contingency mode', triggered: false };
        }

        const isFailure = forceFailure || (hoursRemaining < 4 && Math.random() < 0.1);

        if (!isFailure) {
            console.log('[Contingency] Status normal.');
            return { success: true, triggered: false };
        }

        console.log('[Contingency] ⚠️ Failure detected! Initiating Plan B...');

        // 2. Generate Plan B Data
        // Use original event description/title for context
        const moodContext = event.description || "Fun evening";

        const planBOptions = await generateConsensusOptions(
            "Plan B: " + event.title, // Modified title for context
            `Original plan failed. Need a solid Plan B for: ${moodContext}. Keep it reliable.`,
            // zipCode can be inferred if we had it, for now undefined
        );

        // 3. Update Event state
        // We replace options in a transaction
        await prisma.$transaction([
            // Remove old options
            prisma.eventOption.deleteMany({ where: { eventId: event.id } }),
            // Create new options and update status
            prisma.event.update({
                where: { id: event.id },
                data: {
                    status: 'CONTINGENCY_VOTE',
                    deadline: new Date(Date.now() + 60 * 60 * 1000), // 1 hour form now
                    options: {
                        create: planBOptions.map(opt => ({
                            title: opt.title,
                            location: opt.location,
                            description: opt.description,
                            image: opt.image,
                            expertTip: opt.expertTip,
                            flavorTag: opt.flavorTag,
                            voteCount: 0
                        }))
                    }
                }
            })
        ]);

        console.log('[Contingency] Plan B activated.');
        revalidatePath(`/events/${eventId}`);
        revalidatePath('/');
        return { success: true, triggered: true };

    } catch (error) {
        console.error('Contingency check failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Contingency check failed' };
    }
}

/**
 * Get the next upcoming event for the user
 */
export async function getNextEvent() {
    try {
        const now = new Date();
        const event = await prisma.event.findFirst({
            where: {
                date: {
                    gte: now
                },
                status: {
                    not: 'CANCELLED'
                }
            },
            orderBy: {
                date: 'asc'
            },
            include: {
                options: true, // Include useful data if needed
                guests: true
            }
        });
        return { success: true, event };
    } catch (error) {
        console.error('Failed to get next event:', error);
        return { success: false, error: 'Failed to fetch next event' };
    }
}

const GHOST_NAMES = ['Alex', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor', 'Jamie', 'Quinn'];
const GHOST_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey'
];

export async function createGhostGuests(eventId: string, count: number = 1) {
    try {
        const promises = [];
        for (let i = 0; i < count; i++) {
            const name = GHOST_NAMES[Math.floor(Math.random() * GHOST_NAMES.length)];
            const avatar = GHOST_AVATARS[Math.floor(Math.random() * GHOST_AVATARS.length)];

            promises.push(prisma.guest.create({
                data: {
                    eventId,
                    name: name,
                    status: 'IN', // They are IN to provide social proof
                    userId: `ghost-${Date.now()}-${i}`, // Fake ID
                    avatar
                }
            }));
        }

        await Promise.all(promises);
        revalidatePath(`/mood/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to create ghosts:', error);
        return { success: false, error: 'Failed' };
    }
}

// Social Graph Actions

export async function getFriendsFeed() {
    try {
        // In a real app, filtering by current user's friends
        // For MVP/Demo: Fetch all events with privacy = 'FRIENDS' or 'PUBLIC'
        const events = await prisma.event.findMany({
            where: {
                privacy: { in: ['FRIENDS', 'PUBLIC'] },
                date: { gte: new Date() }, // Future events only
                status: { not: 'CANCELLED' }
            },
            orderBy: { date: 'asc' },
            include: {
                guests: true,
                partner: true
            },
            take: 10
        });

        return { success: true, events };
    } catch (error) {
        console.error('Failed to get friends feed:', error);
        return { success: false, events: [] };
    }
}

export async function addFriend(friendUsername: string) {
    try {
        // Placeholder "me" - in real app we'd get this from session
        const me = await prisma.profile.findFirst({ where: { username: 'me' } });
        if (!me) {
            // Create a "me" profile for demo purposes if it doesn't exist
            await prisma.profile.create({
                data: {
                    userId: 'current-user-id',
                    username: 'me',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Me'
                }
            });
        }

        const friend = await prisma.profile.findUnique({ where: { username: friendUsername } });
        if (!friend) return { success: false, message: 'User not found' };

        const myProfile = await prisma.profile.findUnique({ where: { username: 'me' } });
        if (!myProfile) return { success: false, message: 'Your profile not found' };

        await prisma.friendship.upsert({
            where: {
                requesterId_addresseeId: {
                    requesterId: myProfile.id,
                    addresseeId: friend.id
                }
            },
            update: { status: 'ACCEPTED' },
            create: {
                requesterId: myProfile.id,
                addresseeId: friend.id,
                status: 'ACCEPTED' // Auto-accept for demo
            }
        });

        return { success: true, message: 'Friend added!' };
    } catch (error) {
        console.error('Failed to add friend:', error);
        return { success: false, message: 'Failed to add friend' };
    }
}

export async function toggleFriendship(profileId: string) {
    // Similar to addFriend but based on ID and toggles
    return { success: true };
}

export async function getSuggestedFriends() {
    try {
        // Fetch users who are not me (placeholder "me")
        const profiles = await prisma.profile.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        // If empty, return fake data for demo
        if (profiles.length === 0) {
            console.log('Returning mock profiles');
            return {
                success: true,
                profiles: [
                    { id: '1', username: 'Sarah', mood: 'Looking for sushi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
                    { id: '2', username: 'Mike', mood: 'Coding late', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
                    { id: '3', username: 'Jessica', mood: 'Gym session', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica' },
                ]
            };
        }

        console.log('Returning real profiles:', profiles.length);
        return { success: true, profiles };
    } catch (error) {
        return { success: false, profiles: [] };
    }
}
