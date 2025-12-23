import { getCalendarEvents } from '../lib/notion';
import { CalendarEvent } from '../types';
import Link from 'next/link';

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

// Helper to get day of week for the first day of the month (0 = Sunday, 1 = Monday, ...)
function getFirstDayOfMonth(year: number, month: number) {
    let day = new Date(year, month, 1).getDay();
    // Adjust so 0 = Monday, 6 = Sunday (Standard European week)
    return day === 0 ? 6 : day - 1;
}

const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const revalidate = 3600; // Revalidate every hour

export default async function CalendarPage() {
    const events = await getCalendarEvents();

    // Group events by Month for display (Assuming 2025 based on data)
    // We will render all months present in the data or just the current year
    const year = 2025;

    // Create an array of 12 months
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <main className="flex-grow">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-sans">
                            Calendrier {year}
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Programme des sorties et événements du club.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {months.map(monthIndex => {
                            // Filter events for this month
                            const monthEvents = events.filter(e => {
                                const d = new Date(e.isoDate);
                                return d.getFullYear() === year && d.getMonth() === monthIndex;
                            });

                            const daysInMonth = getDaysInMonth(year, monthIndex);
                            const firstDayOfWeek = getFirstDayOfMonth(year, monthIndex);

                            // Grid cells
                            const days = [];
                            // Empty cells for padding before start of month
                            for (let i = 0; i < firstDayOfWeek; i++) {
                                days.push({ day: null, events: [] });
                            }
                            // Days of the month
                            for (let i = 1; i <= daysInMonth; i++) {
                                const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                                const dayEvents = monthEvents.filter(e => e.isoDate === dateStr);
                                days.push({ day: i, dateStr, events: dayEvents });
                            }

                            return (
                                <div key={monthIndex} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Month Header */}
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <h2 className="text-xl font-bold text-gray-900">{MONTH_NAMES[monthIndex]}</h2>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="lg:flex lg:h-auto lg:flex-col">
                                        {/* Weekday Headers */}
                                        <div className="grid grid-cols-7 border-b border-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 bg-gray-50 lg:flex-none">
                                            <div className="bg-white py-2">Lun</div>
                                            <div className="bg-white py-2">Mar</div>
                                            <div className="bg-white py-2">Mer</div>
                                            <div className="bg-white py-2">Jeu</div>
                                            <div className="bg-white py-2">Ven</div>
                                            <div className="bg-white py-2 text-brand-primary">Sam</div>
                                            <div className="bg-white py-2 text-brand-primary">Dim</div>
                                        </div>

                                        {/* Days Grid */}
                                        <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
                                            <div className="hidden w-full lg:grid lg:grid-cols-7 lg:gap-px">
                                                {days.map((cell, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`relative min-h-[120px] bg-white px-3 py-2 ${!cell.day ? 'bg-gray-50 text-gray-300' : ''}`}
                                                    >
                                                        {cell.day && (
                                                            <time dateTime={cell.dateStr} className={`${
                                                                // Highlight today? (omitted for static year view)
                                                                'flex h-6 w-6 items-center justify-center rounded-full font-semibold'
                                                                // weekend highlight
                                                                + (idx % 7 >= 5 ? ' text-brand-secondary' : '')
                                                                }`}>
                                                                {cell.day}
                                                            </time>
                                                        )}
                                                        {cell.events.length > 0 && (
                                                            <ol className="mt-2 space-y-1">
                                                                {cell.events.map(event => (
                                                                    <li key={event.id}>
                                                                        <div className="group flex flex-col gap-0.5 rounded-md p-1.5 hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                                                                            <p className="flex-auto truncate font-medium text-gray-900">
                                                                                {event.location}
                                                                            </p>
                                                                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                                                                                <span>{event.departure}</span>
                                                                                {event.distances && <span>{event.distances}km</span>}
                                                                            </div>
                                                                            {event.alternative && (
                                                                                <p className="text-[9px] text-orange-600 truncate mt-0.5" title={event.alternative}>
                                                                                    Alt: {event.alternative}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Mobile / List View Fallback for small screens? 
                                                The grid above works well on desktop. For mobile, the grid might be too squashed.
                                                Let's add a responsive alternative: a simple list for mobile, hidden on LG.
                                            */}
                                            <div className="grid grid-cols-1 w-full lg:hidden bg-white divide-y divide-gray-100">
                                                {monthEvents.length > 0 ? (
                                                    monthEvents.map(event => {
                                                        const d = new Date(event.isoDate);
                                                        return (
                                                            <div key={event.id} className="p-4 flex gap-4">
                                                                <div className="flex-none bg-gray-50 rounded-lg p-2 text-center w-16 h-16 flex flex-col justify-center items-center border border-gray-100">
                                                                    <span className="text-xs text-gray-500 uppercase font-bold">
                                                                        {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                                                                    </span>
                                                                    <span className="text-xl font-bold text-gray-900">
                                                                        {d.getDate()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-auto">
                                                                    <h3 className="text-sm font-semibold text-gray-900">{event.location}</h3>
                                                                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                                                        <span className="flex items-center gap-1">
                                                                            🕒 {event.departure}
                                                                        </span>
                                                                        {event.distances && (
                                                                            <span className="flex items-center gap-1">
                                                                                🚲 {event.distances} km
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {event.remarks && (
                                                                        <p className="mt-2 text-xs text-gray-600 italic">
                                                                            Note: {event.remarks}
                                                                        </p>
                                                                    )}
                                                                    {event.alternative && (
                                                                        <p className="mt-1 text-xs text-orange-600">
                                                                            Alternative: {event.alternative}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="p-4 text-sm text-gray-500 text-center italic">Aucun événement ce mois-ci</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
