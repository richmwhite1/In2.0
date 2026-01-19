import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import GuestOnboarding from '@/components/guest/GuestOnboarding';

interface GuestPageProps {
    params: Promise<{
        eventId: string;
    }>;
}

export default async function GuestPage({ params }: GuestPageProps) {
    const { eventId } = await params; // Ensure params are awaited in Next.js 15+ if applicable, or standard access

    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) {
        return notFound();
    }

    // Check for existing guest session
    const cookieStore = await cookies();
    const guestId = cookieStore.get('guest_session')?.value;

    let guestName = undefined;

    if (guestId) {
        const guest = await prisma.guest.findUnique({
            where: { id: guestId }
        });

        // Only verify if this guest record matches the current event
        if (guest && guest.eventId === eventId) {
            guestName = guest.name;
        }
    }

    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-4">
            <GuestOnboarding
                event={event as any}
                existingGuestName={guestName}
            />
        </main>
    );
}
