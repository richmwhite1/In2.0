import { prisma } from '@/lib/db';
import MoodDetail from '@/components/MoodDetail';
import Navigation from '@/components/Navigation';
import { getEventById } from '@/lib/mockData';

export default async function MoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: eventId } = await params;

    // Try fetching from DB first
    let eventData: any = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            guests: true,
            options: true,
            comments: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    // Fallback to mock if not found (for legacy/demo support)
    if (!eventData) {
        eventData = getEventById(eventId);
    }

    if (!eventData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
                    <p className="text-white/60">This event doesn&apos;t exist or has been removed.</p>
                </div>
                <Navigation />
            </div>
        );
    }

    // Transform Prisma data to component props if needed
    const adaptedEvent = {
        ...eventData,
        date: new Date(eventData.date),
        guests: eventData.guests?.map((g: any) => ({
            id: g.id,
            name: g.name,
            avatar: g.avatar || `https://ui-avatars.com/api/?name=${g.name}&background=random`,
        })) || eventData.guests || [],
        comments: eventData.comments || []
    };

    return (
        <main className="min-h-screen pb-24 bg-background">
            <MoodDetail event={adaptedEvent} />
            <Navigation />
        </main>
    );
}

