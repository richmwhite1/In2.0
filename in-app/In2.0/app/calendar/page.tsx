import CalendarAgendaView from '@/components/CalendarAgendaView';
import Navigation from '@/components/Navigation';
import ContextualHeader from '@/components/ContextualHeader';
import { getUpcomingEvents } from '@/lib/mockData';

export default function CalendarPage() {
    const events = getUpcomingEvents();

    return (
        <main className="min-h-screen pb-24 overflow-x-hidden pt-6">
            <ContextualHeader />

            <CalendarAgendaView events={events} />

            <Navigation />
        </main>
    );
}
