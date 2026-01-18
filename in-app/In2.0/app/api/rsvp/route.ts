import { NextRequest, NextResponse } from 'next/server';
import { GuestRSVP } from '@/lib/types';

/**
 * API Route: POST /api/rsvp
 * 
 * Handles guest RSVP submissions and saves them to Railway database
 * 
 * TODO: Connect to your Railway PostgreSQL database
 * Example using Prisma:
 * 
 * import { PrismaClient } from '@prisma/client';
 * const prisma = new PrismaClient();
 * 
 * await prisma.guestRSVP.create({
 *   data: {
 *     sessionId: rsvpData.sessionId,
 *     eventId: rsvpData.eventId,
 *     guestName: rsvpData.guestName,
 *     status: rsvpData.status,
 *     avatar: rsvpData.avatar,
 *   }
 * });
 */
export async function POST(request: NextRequest) {
    try {
        const rsvpData: GuestRSVP = await request.json();

        // Validate required fields
        if (!rsvpData.sessionId || !rsvpData.eventId || !rsvpData.guestName || !rsvpData.status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // TODO: Save to Railway database
        // For now, we'll just log and return success
        console.log('RSVP received:', {
            sessionId: rsvpData.sessionId,
            eventId: rsvpData.eventId,
            guestName: rsvpData.guestName,
            status: rsvpData.status,
            timestamp: rsvpData.timestamp,
        });

        // Simulate database save
        // Replace this with actual database logic:
        /*
        const savedRSVP = await prisma.guestRSVP.upsert({
          where: {
            sessionId_eventId: {
              sessionId: rsvpData.sessionId,
              eventId: rsvpData.eventId,
            }
          },
          update: {
            guestName: rsvpData.guestName,
            status: rsvpData.status,
            avatar: rsvpData.avatar,
            timestamp: new Date(rsvpData.timestamp),
          },
          create: {
            sessionId: rsvpData.sessionId,
            eventId: rsvpData.eventId,
            guestName: rsvpData.guestName,
            status: rsvpData.status,
            avatar: rsvpData.avatar,
            timestamp: new Date(rsvpData.timestamp),
          },
        });
        */

        return NextResponse.json(
            {
                success: true,
                message: 'RSVP saved successfully',
                data: rsvpData,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error processing RSVP:', error);
        return NextResponse.json(
            {
                error: 'Failed to process RSVP',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * API Route: GET /api/rsvp?eventId=xxx
 * 
 * Retrieves all RSVPs for a specific event
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId parameter is required' },
                { status: 400 }
            );
        }

        // TODO: Fetch from Railway database
        // const rsvps = await prisma.guestRSVP.findMany({
        //   where: { eventId },
        //   orderBy: { timestamp: 'desc' }
        // });

        // For now, return empty array
        return NextResponse.json(
            {
                success: true,
                eventId,
                rsvps: [],
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching RSVPs:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch RSVPs',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
