'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Get or create profile for a user
export async function getOrCreateProfile(userId: string) {
    try {
        let profile = await prisma.profile.findUnique({
            where: { userId },
            include: {
                friends: {
                    where: { status: 'ACCEPTED' },
                    include: { addressee: true }
                },
                friendOf: {
                    where: { status: 'ACCEPTED' },
                    include: { requester: true }
                }
            }
        });

        if (!profile) {
            profile = await prisma.profile.create({
                data: {
                    userId,
                    username: `user_${userId.slice(0, 8)}`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
                    mood: 'Ready for adventure',
                    preferredActivities: [],
                    availableTimes: [],
                    dietaryRestrictions: [],
                },
                include: {
                    friends: {
                        where: { status: 'ACCEPTED' },
                        include: { addressee: true }
                    },
                    friendOf: {
                        where: { status: 'ACCEPTED' },
                        include: { requester: true }
                    }
                }
            });
        }

        // Combine friends from both directions
        const allFriends = [
            ...profile.friends.map(f => f.addressee),
            ...profile.friendOf.map(f => f.requester)
        ];

        return { success: true, profile, friends: allFriends };
    } catch (error) {
        console.error('Error getting profile:', error);
        return { success: false, error: 'Failed to get profile' };
    }
}

// Update profile preferences
export async function updateProfilePreferences(
    userId: string,
    data: {
        username?: string;
        bio?: string;
        mood?: string;
        avatar?: string;
        preferredActivities?: string[];
        availableTimes?: string[];
        dietaryRestrictions?: string[];
        defaultLocation?: string;
    }
) {
    try {
        const profile = await prisma.profile.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data,
            }
        });

        revalidatePath('/profile');
        return { success: true, profile };
    } catch (error) {
        console.error('Error updating preferences:', error);
        return { success: false, error: 'Failed to update preferences' };
    }
}

// Update just the mood status
export async function updateMood(userId: string, mood: string) {
    try {
        const profile = await prisma.profile.update({
            where: { userId },
            data: { mood }
        });

        revalidatePath('/profile');
        return { success: true, profile };
    } catch (error) {
        console.error('Error updating mood:', error);
        return { success: false, error: 'Failed to update mood' };
    }
}

// Get friend requests (pending)
export async function getPendingFriendRequests(userId: string) {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });

        if (!profile) return { success: true, requests: [] };

        const requests = await prisma.friendship.findMany({
            where: {
                addresseeId: profile.id,
                status: 'PENDING'
            },
            include: {
                requester: true
            }
        });

        return { success: true, requests };
    } catch (error) {
        console.error('Error getting friend requests:', error);
        return { success: false, requests: [] };
    }
}

// Accept friend request
export async function acceptFriendRequest(friendshipId: string) {
    try {
        const friendship = await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'ACCEPTED' }
        });

        revalidatePath('/profile');
        revalidatePath('/friends');
        return { success: true, friendship };
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return { success: false, error: 'Failed to accept request' };
    }
}

// Decline friend request
export async function declineFriendRequest(friendshipId: string) {
    try {
        await prisma.friendship.delete({
            where: { id: friendshipId }
        });

        revalidatePath('/profile');
        revalidatePath('/friends');
        return { success: true };
    } catch (error) {
        console.error('Error declining friend request:', error);
        return { success: false, error: 'Failed to decline request' };
    }
}

// Get user's upcoming events
export async function getUserEvents(userId: string) {
    try {
        const events = await prisma.event.findMany({
            where: {
                OR: [
                    { guests: { some: { userId, status: 'IN' } } },
                    { guests: { some: { userId, status: 'INTERESTED' } } }
                ],
                date: { gte: new Date() }
            },
            include: {
                guests: true,
                options: true
            },
            orderBy: { date: 'asc' },
            take: 10
        });

        return { success: true, events };
    } catch (error) {
        console.error('Error getting user events:', error);
        return { success: false, events: [] };
    }
}
