'use client';

import EventFeed from '@/components/EventFeed';
import { mockEvents } from '@/lib/mockData';

export default function EventFeedPage() {
    return <EventFeed events={mockEvents} />;
}
