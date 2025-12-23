'use client';

import { useState } from 'react';
import { CalendarEvent } from '../types';
import {
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/20/solid';

const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

// Helper to get days in month
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

// Helper to get day of week for the first day of the month (0 = Sunday, 1 = Monday, ...)
// Standard JS: 0=Sun, 1=Mon.
// We want Monday as start of week? Tailwind UI usually starts Sunday or Monday.
// Let's stick to Monday start for Europe.
function getFirstDayOfMonth(year: number, month: number) {
    let day = new Date(year, month, 1).getDay();
    // Monday start: Sun(0) -> 6, Mon(1) -> 0
    return day === 0 ? 6 : day - 1;
}

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 0)); // Start at Jan 2025 by default or Today

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = getFirstDayOfMonth(year, month);

    // Previous Month padding
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    // Calculate Previous Month dates
    const prevMonthPadding = Array.from({ length: firstDayOfWeek }, (_, i) => {
        const day = daysInPrevMonth - firstDayOfWeek + i + 1;
        // Note: Month in Date constructor is 0-indexed. prev month is month-1.
        // Handling Year rollover is automatic with Date(year, month-1, day)
        const d = new Date(year, month - 1, day);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { day: day, currentMonth: false, dateStr };
    });

    // Current Month dates
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return { day, currentMonth: true, dateStr };
    });

    // Next Month dates
    const totalSlots = 42;
    const remainingSlots = totalSlots - (prevMonthPadding.length + currentMonthDays.length);
    const nextMonthPadding = Array.from({ length: remainingSlots }, (_, i) => {
        const day = i + 1;
        const d = new Date(year, month + 1, day);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { day, currentMonth: false, dateStr };
    });

    const allDays = [...prevMonthPadding, ...currentMonthDays, ...nextMonthPadding];

    // Filter events for current view
    const monthEvents = events.filter(e => {
        const d = new Date(e.isoDate);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="lg:flex lg:h-full lg:flex-col">
            {/* Top Bar */}
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 lg:flex-none">
                <h1 className="text-base font-semibold leading-6 text-gray-900">
                    <time dateTime={`${year}-${String(month + 1).padStart(2, '0')}`}>
                        {MONTH_NAMES[month]} {year}
                    </time>
                </h1>
                <div className="flex items-center">
                    <div className="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            className="flex h-9 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50"
                        >
                            <span className="sr-only">Previous month</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={goToToday}
                            className="hidden border-y border-gray-300 px-3.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:relative md:block h-9 pt-1.5"
                        >
                            Ce mois-ci
                        </button>
                        <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="flex h-9 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50"
                        >
                            <span className="sr-only">Next month</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Calendar Grid */}
            <div className="shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col">
                <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
                    <div className="bg-white py-2">Lun</div>
                    <div className="bg-white py-2">Mar</div>
                    <div className="bg-white py-2">Mer</div>
                    <div className="bg-white py-2">Jeu</div>
                    <div className="bg-white py-2">Ven</div>
                    <div className="bg-white py-2 text-brand-primary">Sam</div>
                    <div className="bg-white py-2 text-brand-primary">Dim</div>
                </div>
                <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
                    <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-6 lg:gap-px">
                        {allDays.map((cell, idx) => {
                            const dayEvents = cell.currentMonth
                                ? monthEvents.filter(e => e.isoDate === cell.dateStr)
                                : [];

                            return (
                                <div
                                    key={idx}
                                    className={classNames(
                                        cell.currentMonth ? 'bg-white' : 'bg-gray-50 text-gray-500',
                                        'relative px-3 py-2 min-h-[120px]'
                                    )}
                                >
                                    <time
                                        dateTime={cell.dateStr}
                                        className={classNames(
                                            // Highlight "today" if we wanted, for now just basic text
                                            cell.currentMonth ? 'font-semibold' : '',
                                            // Weekend highlight on current month (Green/Secondary)
                                            (cell.currentMonth && (idx % 7 >= 5)) ? 'text-brand-secondary' : '',
                                            // Weekday highlight (Red/Primary) if current month and not weekend
                                            (cell.currentMonth && (idx % 7 < 5)) ? 'text-brand-primary' : '',
                                            'block mb-1'
                                        )}
                                    >
                                        {cell.day}
                                    </time>
                                    {dayEvents.length > 0 && (
                                        <ol className="mt-1">
                                            {dayEvents.map(event => (
                                                <li key={event.id}>
                                                    <a href="#" className="group flex flex-col gap-0.5 rounded-md p-1.5 hover:bg-gray-100 transition-colors">
                                                        <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-brand-primary">
                                                            {event.location}
                                                        </p>
                                                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                                                            <span>{event.departure}</span>
                                                            {event.distances && <span>{event.distances}km</span>}
                                                        </div>
                                                        {event.alternative && (
                                                            <p className="text-[9px] text-orange-600 truncate mt-0.5">
                                                                Alt: {event.alternative}
                                                            </p>
                                                        )}
                                                    </a>
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {/* Mobile List View fallback */}
                    <div className="isolate grid w-full grid-cols-1 grid-rows-1 lg:hidden bg-white">
                        <div className="flex flex-col">
                            {monthEvents.length > 0 ? (
                                monthEvents.map(event => {
                                    const d = new Date(event.isoDate);
                                    return (
                                        <div key={event.id} className="p-4 border-b border-gray-100 flex gap-4">
                                            <div className="flex-none bg-gray-50 rounded-lg p-2 text-center w-14 h-14 flex flex-col justify-center items-center border border-gray-200">
                                                <span className="text-xs text-gray-500 font-bold uppercase">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                                                <span className="text-lg font-bold text-gray-900">{d.getDate()}</span>
                                            </div>
                                            <div className="flex-auto">
                                                <h3 className="text-sm font-semibold text-gray-900">{event.location}</h3>
                                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                                    <span>🕒 {event.departure}</span>
                                                    {event.distances && <span>🚲 {event.distances} km</span>}
                                                </div>
                                                {event.alternative && <div className="text-xs text-orange-600 mt-1">Alt: {event.alternative}</div>}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="p-8 text-center text-gray-500 italic">Aucun événement pour ce mois.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
