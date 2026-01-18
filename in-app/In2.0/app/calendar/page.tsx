import CalendarAgendaView from '@/components/CalendarAgendaView';
import Navigation from '@/components/Navigation';
import { getUpcomingEvents } from '@/lib/mockData';

export default function CalendarPage() {
    const events = getUpcomingEvents();

    return (
        <main className="min-h-screen pb-24 overflow-x-hidden pt-6">
            <header className="px-6 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Agenda</h1>
                    <p className="text-white/40 font-medium">Your social roadmap</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                </div>
            </header>

            <CalendarAgendaView events={events} />

            <Navigation />
        </main>
    );
}
