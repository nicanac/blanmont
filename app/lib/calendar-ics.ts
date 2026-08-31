import { CalendarEvent } from '../types';

/**
 * Formats a date and time string into iCalendar DTSTART / DTEND format.
 */
function formatIcsDateTime(isoDate: string, timeStr?: string, durationHours = 4): { dtStart: string; dtEnd: string; isAllDay: boolean } {
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (!timeStr) {
    // All-day format: YYYYMMDD
    const pad = (n: number) => String(n).padStart(2, '0');
    const start = `${year}${pad(month)}${pad(day)}`;
    
    // All-day end date is next day per iCalendar spec
    const nextDay = new Date(year, month - 1, day + 1);
    const end = `${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
    return { dtStart: start, dtEnd: end, isAllDay: true };
  }

  // Parse time: "8h30", "08:30", "9h00", "13h30", "8h"
  let hours = 8;
  let minutes = 30;

  const match = timeStr.match(/(\d{1,2})[h:H](\d{0,2})/);
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = match[2] ? parseInt(match[2], 10) : 0;
  } else {
    const rawNum = parseInt(timeStr.replace(/\D/g, ''), 10);
    if (!isNaN(rawNum) && rawNum >= 0 && rawNum <= 23) {
      hours = rawNum;
      minutes = 0;
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;

  // Calculate end time
  let endHours = hours + durationHours;
  let endDay = day;
  let endMonth = month;
  let endYear = year;

  if (endHours >= 24) {
    endHours = endHours % 24;
    const nextDate = new Date(year, month - 1, day + 1);
    endYear = nextDate.getFullYear();
    endMonth = nextDate.getMonth() + 1;
    endDay = nextDate.getDate();
  }

  const endStr = `${endYear}${pad(endMonth)}${pad(endDay)}T${pad(endHours)}${pad(minutes)}00`;
  return { dtStart: startStr, dtEnd: endStr, isAllDay: false };
}

/**
 * Escapes special characters for iCalendar text fields.
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Generates an RFC 5545 compliant iCalendar string (.ics) from a list of CalendarEvents.
 */
export function generateICalendarFeed(events: CalendarEvent[], siteUrl = 'https://blanmont.be'): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Club de Blanmont//CC Saint-Martin Blanmont//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Club de Blanmont - Sorties Cyclo',
    'X-WR-TIMEZONE:Europe/Brussels',
    'X-WR-CALDESC:Calendrier officiel des sorties et événements du Club de Blanmont (CC Saint-Martin)',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
  ];

  for (const event of events) {
    if (!event.isoDate) continue;

    const { dtStart, dtEnd, isAllDay } = formatIcsDateTime(event.isoDate, event.departure);
    const summary = `Sortie Blanmont : ${event.location || 'Place de Blanmont'}${event.distances ? ` (${event.distances})` : ''}`;

    let description = `Sortie du Club de Blanmont\\n`;
    description += `Lieu de rendez-vous: ${event.location || 'Place de Blanmont'}\\n`;
    if (event.departure) description += `Heure de départ: ${event.departure}\\n`;
    if (event.distances) description += `Distances prévues: ${event.distances}\\n`;
    if (event.group) description += `Groupes: ${event.group}\\n`;
    if (event.remarks) description += `Remarques: ${event.remarks}\\n`;
    if (event.gpxUrl) description += `Trace GPX: ${event.gpxUrl}\\n`;
    description += `Plus d'infos: ${siteUrl}/calendrier`;

    const locationStr = event.address
      ? `${event.location || 'Blanmont'}, ${event.address}`
      : `${event.location || 'Place de Blanmont'}, 1450 Chastre, Belgique`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id || event.isoDate}@blanmont.be`);
    lines.push(`DTSTAMP:${dtStamp}`);

    if (isAllDay) {
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
    } else {
      lines.push(`DTSTART;TZID=Europe/Brussels:${dtStart}`);
      lines.push(`DTEND;TZID=Europe/Brussels:${dtEnd}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`LOCATION:${escapeIcsText(locationStr)}`);
    lines.push(`URL:${siteUrl}/calendrier`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
