import { getCalendarEvents } from '../lib/notion';
import CalendarView from './CalendarView';

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage() {
    const events = await getCalendarEvents();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-grow">
                {/* No container needed here as CalendarView handles its own layout/headings */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 h-full">
                    <CalendarView events={events} />
                </div>
            </main>
        </div>
    );
}
