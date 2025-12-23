import { getCalendarEvents } from '../lib/notion';
import CalendarView from './CalendarView';

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage() {
    const events = await getCalendarEvents();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-grow">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 h-full">
                    <div className="max-w-2xl text-center md:text-left mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Calendrier</h2>
                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            Planning des sorties et événements du club.
                        </p>
                    </div>
                    <CalendarView events={events} />
                </div>
            </main>
        </div>
    );
}
