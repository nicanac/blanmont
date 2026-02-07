
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
    getCalendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    getEventAttendance,
    setEventAttendance,
    getLeaderboardEntries,
    createLeaderboardEntry,
    updateLeaderboardEntry,
    LeaderboardEntry,
    EventAttendance,
    CalendarEvent,
} from '@/app/lib/firebase';

export async function GET() {
    try {
        const csvPath = path.join(process.cwd(), 'public', 'CC Blanmont - sorties 2026 - SORTiES.csv');
        if (!fs.existsSync(csvPath)) {
            return NextResponse.json({ error: 'CSV file not found' }, { status: 404 });
        }

        const fileContent = fs.readFileSync(csvPath, 'utf-8');
        const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
            return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
        }

        // Parse Header
        const header = lines[0].split(',');
        // Expected: groupe(s),prénom,Nom,∑,01/01,03/01,04/01...
        // Date columns start at index 4
        const dateColumns: { index: number; dateStr: string; isoDate: string }[] = [];

        for (let i = 4; i < header.length; i++) {
            const dateStr = header[i].trim();
            if (dateStr && dateStr.match(/^\d{2}\/\d{2}$/)) {
                const [day, month] = dateStr.split('/');
                const isoDate = `2026-${month}-${day}`;
                dateColumns.push({ index: i, dateStr: `${dateStr}/2026`, isoDate });
            }
        }

        console.log(`Found ${dateColumns.length} date columns for 2026.`);

        // 1. Fetch Existing Data
        const [existingEvents, existingLeaderboard] = await Promise.all([
            getCalendarEvents(),
            getLeaderboardEntries(),
        ]);

        // Map Events by ISO Date
        const eventMapByDate: Record<string, CalendarEvent> = {};
        existingEvents.forEach((evt) => {
            if (evt.isoDate) eventMapByDate[evt.isoDate] = evt;
        });

        // Map Leaderboard Entries by Name (Normalize: First Last)
        // CSV: First, Last
        // Leaderboard: First Last
        const memberMapByName: Record<string, LeaderboardEntry> = {};
        existingLeaderboard.forEach((entry) => {
            memberMapByName[entry.name.toLowerCase().trim()] = entry;
        });

        // 2. Clear 2026 Data
        // - Identify all events in 2026
        const events2026 = existingEvents.filter(e => e.isoDate.startsWith('2026-'));
        console.log(`Clearing attendance for ${events2026.length} existing 2026 events.`);

        for (const evt of events2026) {
            await setEventAttendance(evt.id, evt.isoDate, {}); // Clear attendance
        }

        // - Update Leaderboard: remove 2026 dates and recalculate rides
        console.log('Cleaning up leaderboard 2026 stats...');
        for (const entry of existingLeaderboard) {
            const originalDates = entry.dates || [];
            const newDates = originalDates.filter(d => !d.endsWith('/2026'));

            if (originalDates.length !== newDates.length) {
                await updateLeaderboardEntry(entry.id, {
                    dates: newDates,
                    rides: newDates.length
                });
                // Update local map reference to reflect changes
                memberMapByName[entry.name.toLowerCase().trim()] = {
                    ...entry,
                    dates: newDates,
                    rides: newDates.length
                };
            }
        }

        // 3. Process CSV Rows
        const attendanceUpdates: Record<string, { members: Record<string, any>, isoDate: string }> = {}; // eventId -> { members, isoDate }
        const memberUpdates: Record<string, Partial<LeaderboardEntry>> = {}; // memberId -> updates

        // Helper to get or create event
        const getOrCreateEventId = async (isoDate: string): Promise<string> => {
            if (eventMapByDate[isoDate]) {
                return eventMapByDate[isoDate].id;
            }
            // Create new event
            console.log(`Creating new event for ${isoDate}`);
            const newEventData = {
                isoDate,
                location: 'Sortie Club',
                distances: '', // Default
                departure: '09:00', // Default
                address: '',
                remarks: 'Imported from CSV',
                alternative: '',
                group: 'All', // Default
            };
            const result = await createCalendarEvent(newEventData);
            if (result.success && result.id) {
                eventMapByDate[isoDate] = { id: result.id, ...newEventData } as CalendarEvent;
                return result.id;
            }
            throw new Error(`Failed to create event for ${isoDate}`);
        };

        // Helper to get or create member
        const getOrCreateMember = async (firstName: string, lastName: string, group: string): Promise<LeaderboardEntry> => {
            const fullName = `${firstName} ${lastName}`.trim();
            const normalizedName = fullName.toLowerCase();

            if (memberMapByName[normalizedName]) {
                return memberMapByName[normalizedName];
            }

            // Create new member
            console.log(`Creating new member: ${fullName}`);
            const newMemberData = {
                name: fullName,
                group: group || 'A', // Default to A if missing
                rides: 0,
                dates: [] as string[],
            };

            const result = await createLeaderboardEntry(newMemberData);
            if (result.success && result.id) {
                const newEntry = { id: result.id, ...newMemberData } as LeaderboardEntry;
                memberMapByName[normalizedName] = newEntry;
                return newEntry;
            }
            throw new Error(`Failed to create member ${fullName}`);
        };

        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            if (row.length < 5) continue; // Skip invalid rows

            const group = row[0].trim();
            const firstName = row[1].trim();
            const lastName = row[2].trim();

            if (!firstName || !lastName) continue;

            const member = await getOrCreateMember(firstName, lastName, group);
            const memberId = member.id;

            let rideCount = member.rides || 0;
            const rideDates = [...(member.dates || [])];

            // Iterate Date Columns
            for (const col of dateColumns) {
                const val = row[col.index]?.trim();
                if (val === '1') {
                    // Member attended this event
                    const eventId = await getOrCreateEventId(col.isoDate);

                    // Prepare Attendance Update
                    if (!attendanceUpdates[eventId]) {
                        attendanceUpdates[eventId] = {
                            isoDate: col.isoDate,
                            members: {}
                        };
                    }

                    attendanceUpdates[eventId].members[memberId] = {
                        memberId: memberId,
                        name: member.name,
                        group: group,
                        markedAt: new Date().toISOString()
                    };

                    // Update Leaderboard Stats locally
                    if (!rideDates.includes(col.dateStr)) {
                        rideDates.push(col.dateStr);
                        rideCount++;
                    }
                }
            }

            // Store member updates if changed
            if (rideCount !== member.rides || rideDates.length !== (member.dates?.length || 0)) {
                memberUpdates[memberId] = {
                    rides: rideCount,
                    dates: rideDates
                };
            }
        }

        // 4. Apply Updates
        console.log(`Applying attendance updates for ${Object.keys(attendanceUpdates).length} events...`);
        for (const [eventId, data] of Object.entries(attendanceUpdates)) {
            // We use setEventAttendance to overwrite/set the members list for this event
            await setEventAttendance(eventId, data.isoDate, data.members);
        }

        console.log(`Applying leaderboard updates for ${Object.keys(memberUpdates).length} members...`);
        for (const [memberId, updates] of Object.entries(memberUpdates)) {
            await updateLeaderboardEntry(memberId, updates);
        }

        return NextResponse.json({
            success: true,
            message: 'Import complete',
            stats: {
                eventsProcessed: Object.keys(attendanceUpdates).length,
                membersUpdated: Object.keys(memberUpdates).length
            }
        });

    } catch (error) {
        console.error('Import failed:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
