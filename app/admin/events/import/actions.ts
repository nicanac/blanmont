'use server';

import { CalendarEvent } from '@/app/types';
import { getAdminDatabase } from '@/app/lib/firebase/admin';

const MONTHS: { [key: string]: string } = {
  janvier: '01',
  février: '02',
  mars: '03',
  avril: '04',
  mai: '05',
  juin: '06',
  juillet: '07',
  août: '08',
  septembre: '09',
  octobre: '10',
  novembre: '11',
  décembre: '12',
};

export async function processPdf(formData: FormData) {
  console.log('Starting PDF processing...');

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, message: 'Aucun fichier fourni.' };
  }

  try {
    // Dynamic import to avoid build-time issues
    const pdfPackage = require('pdf-parse');
    const pdf = pdfPackage.default || pdfPackage;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`File received. Size: ${buffer.length} bytes.`);

    // pdf-parse logic
    const data = await pdf(buffer);
    console.log('PDF parsed successfully.');
    const text = data.text;

    const events = parsePdfText(text);

    if (events.length === 0) {
      return { success: false, message: 'Aucun événement trouvé ou format non reconnu.' };
    }

    const db = getAdminDatabase();
    const ref = db.ref('calendar-events');

    let count = 0;
    for (const event of events) {
      // Create a deterministic ID to allow idempotent imports
      // Pattern: YYYYMMDD-Location-EventNameHash
      const safeLoc = event.location.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      const id = `${event.isoDate.replace(/-/g, '')}-${safeLoc}`;

      await ref.child(id).set({ ...event, id });
      count++;
    }

    console.log(`Imported ${count} events.`);
    return { success: true, message: 'Importation réussie !', count };
  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return {
      success: false,
      message: 'Erreur lors du traitement du PDF: ' + (error.message || String(error)),
    };
  }
}

function parsePdfText(text: string): CalendarEvent[] {
  const lines = text.split('\n');
  const events: CalendarEvent[] = [];

  // Regex to match the start of a line with a date
  // Matches: "Samedi3 janvier 2026" or "Samedi 3 janvier 2026"
  const dateRegex =
    /^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s*(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(20\d{2})(.*)$/i;

  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const dayName = match[1];
      const dayNum = match[2].padStart(2, '0');
      const monthName = match[3].toLowerCase();
      const year = match[4];
      const rest = match[5];

      const monthNum = MONTHS[monthName];
      const isoDate = `${year}-${monthNum}-${dayNum}`;

      // Analyze the 'rest' of the string to extract other fields
      // Expected approximate structure: [Event&Location][Distances][Time][Address/Remarks]

      // Heuristic 1: Find cleanup "Club" which is often glued to Year or Location
      // In PDF dump: "2026ClubBlanmont" -> match[5] starts with "ClubBlanmont..."

      let workString = rest.trim();

      let location = '';
      let eventName = ''; // Not a separate field in CalendarEvent, usually implicitly "Sortie Club" or derived from Location
      let distances = '';
      let departure = '';
      let address = '';
      let remarks = '';

      // Extract Distances: Look for pattern like "70-90" or "85-120-155"
      // They are often glued like "Blanmont70-9013h"
      const distMatch = workString.match(/(\d{2,3}(?:-\d{2,3})+)/);
      let distIndex = -1;

      if (distMatch) {
        distances = distMatch[1];
        distIndex = workString.indexOf(distances);
      }

      // Everything before distance is typically Event + Location
      if (distIndex > 0) {
        const prefix = workString.substring(0, distIndex);

        // "ClubBlanmont" or "Circuit hesbignonMeux"
        // Try to separate Logic
        if (prefix.startsWith('Club')) {
          location = 'Blanmont'; // Default for Club
          // If prefix is "ClubBlanmont", remove "Club"
          const plain = prefix.replace(/^Club/, '').trim();
          if (plain) location = plain;
        } else {
          // Heuristic: Split by Capital letter if likely glued?
          // "Vers l'Ardenne NamuroiseNamur" -> Last word starting with Cap is likely Location
          // This is hard. Let's take the whole prefix as location/description for now.
          location = prefix.trim();
        }

        // Everything after distance
        let suffix = workString.substring(distIndex + distances.length);

        // Extract Time: look for "8h", "8h30", "13h"
        // "13hFECHERE" or "8h30Salle..."
        const timeMatch = suffix.match(/(\d{1,2}h(?:\d{2})?)/);
        if (timeMatch) {
          departure = timeMatch[1];
          // Address/Remarks is what follows
          const timeIndex = suffix.indexOf(departure);
          address = suffix.substring(timeIndex + departure.length).trim();

          // Cleanup Address: "FECHERE" is often glued
          if (address.startsWith('FECHERE')) {
            address = 'Place de Féchère'; // Expand common shortcut
          }
          if (address.includes('FECHERE')) {
            // "FECHERE - 9h" often appears at end (Group C?)
            // Let's just keep the raw string for now
          }
        } else {
          // No time found immediately
          address = suffix;
        }
      } else {
        // No distance pattern found?
        // Fallback
        location = workString;
      }

      // Cleanup
      // Add spaces where CamelCase join happened?
      // location = location.replace(/([a-z])([A-Z])/g, '$1 $2');

      events.push({
        id: '', // set in db loop
        isoDate,
        location: location || 'Blanmont',
        distances: distances || '70-90', // fallback default?
        departure: departure || '9h00',
        address: address || 'Place de Féchère',
        remarks: remarks,
        alternative: '',
        group: '', // Not parsed explicitly yet
      });
    }
  }

  return events;
}
