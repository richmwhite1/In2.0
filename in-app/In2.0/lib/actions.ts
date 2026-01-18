'use server';

import { prisma } from '@/lib/db';
import { generateEventRecommendation, generateHangoutRecipe, generateConsensusOptions } from '@/lib/agent';
import { revalidatePath } from 'next/cache';

export async function createEvent(data: {
    title: string;
    description?: string;
    date: string; // ISO string
    location: string;
    image?: string;
    type?: string;
}) {
    try {
        console.log('Creating event with data:', data);

        // Validate date
        const eventDate = new Date(data.date);
        if (isNaN(eventDate.getTime())) {
            throw new Error(`Invalid date: ${data.date}`);
        }

        const event = await prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                date: eventDate,
                location: data.location,
                image: data.image || '/images/event-placeholder.jpg',
                type: data.type || "EVENT",
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
        const guest = await prisma.guest.findFirst({
            where: {
                eventId,
                userId: guestInfo.userId,
                name: guestInfo.name,
            }
        });

        if (!guest) return { success: false, error: 'Guest not found' };

        // Update vote
        await prisma.guest.update({
            where: { id: guest.id },
            data: { votedOptionId: optionId },
        });

        // Increment vote count on option (simplified)
        await prisma.eventOption.update({
            where: { id: optionId },
            data: { voteCount: { increment: 1 } },
        });

        revalidatePath(`/mood/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error('Failed to vote:', error);
        return { success: false, error: 'Failed to vote' };
    }
}

export async function createEventWithOptions(data: {
    title: string;
    description?: string;
    date: string;
    activity: string;
    mood?: string;
}) {
    try {
        const options = await generateConsensusOptions(data.activity, data.mood);

        const event = await prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                date: new Date(data.date),
                location: "TBD - Voting in progress",
                type: 'HANGOUT',
                status: 'PROPOSED',
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
    } catch (error) {
        console.error('Failed to create event with options:', error);
        return { success: false, error: 'Failed to create event' };
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
