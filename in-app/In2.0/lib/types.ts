// User type definition
export interface User {
    id: string;
    name: string;
    avatar: string;
}

export interface EventOption {
    id: string;
    title: string;
    location: string;
    description?: string;
    image?: string;
    expertTip?: string;
    flavorTag?: string;
    voteCount: number;
    // Monetization fields
    affiliateUrl?: string;
    partnerId?: string;
    isTopPick?: boolean;
}

// Event type definition
export interface Event {
    id: string;
    title: string;
    description: string;
    image: string;
    date: Date;
    endDate?: Date;
    location: string;
    organizer: User;
    guests: User[];
    guestCount: number;
    isPublic: boolean;
    tags: string[];
    status: 'upcoming' | 'ongoing' | 'past' | 'PROPOSED' | 'CONFIRMED' | 'CANCELLED';
    type?: 'EVENT' | 'HANGOUT' | 'DIGITAL';
    size?: 'small' | 'medium' | 'large'; // For bento grid layout
    aiGenerated?: boolean; // Flag for AI-generated events
    options?: EventOption[];
}

// Attendance status
export interface Attendance {
    userId: string;
    eventId: string;
    status: 'in' | 'out' | 'maybe' | 'interested';
    timestamp: Date;
}

// Mood data from AI agent
export interface MoodData {
    title: string;
    mood_tags: string[];
    image_suggestion: string;
    location_name: string;
    suggested_time?: string;
    description_summary?: string;
}

// Guest RSVP for non-authenticated users
export interface GuestRSVP {
    sessionId: string;
    eventId: string;
    guestName: string;
    status: RSVPStatus;
    timestamp: Date;
    avatar?: string; // Generated avatar for the guest
}

// RSVP status type
export type RSVPStatus = 'in' | 'out' | 'maybe' | 'interested';
