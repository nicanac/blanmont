'use server';

import { CalendarEvent } from '@/app/types';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { requireAdminSession } from '@/app/lib/auth/session';
import { revalidatePath } from 'next/cache';

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

export interface ParsePdfPreviewResult {
  success: boolean;
  message: string;
  events?: CalendarEvent[];
}

/**
 * Step 1: Extracts calendar events from PDF and returns them for admin preview/editing.
 */
export async function parsePdfForPreviewAction(formData: FormData): Promise<ParsePdfPreviewResult> {
  await requireAdminSession();

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, message: 'Aucun fichier fourni.' };
  }

  try {
    const pdfPackage = require('pdf-parse');
    const pdf = pdfPackage.default || pdfPackage;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdf(buffer);
    const text = data.text;

    const events = parsePdfText(text);

    if (events.length === 0) {
      return {
        success: false,
        message: 'Aucun événement détecté dans le PDF. Vérifiez le format du document.',
      };
    }

    return {
      success: true,
      message: `${events.length} événements détectés avec succès.`,
      events,
    };
  } catch (error: unknown) {
    console.error('Error parsing PDF preview:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: 'Erreur lors de l’extraction du PDF: ' + msg,
    };
  }
}

/**
 * Step 2: Saves the confirmed and edited list of events into Firebase Realtime Database.
 */
export async function saveImportedEventsAction(
  events: CalendarEvent[]
): Promise<{ success: boolean; message: string; count?: number }> {
  await requireAdminSession();

  if (!events || events.length === 0) {
    return { success: false, message: 'Aucun événement à enregistrer.' };
  }

  try {
    const db = getAdminDatabase();
    const ref = db.ref('calendar-events');

    let count = 0;
    for (const event of events) {
      if (!event.isoDate || !event.location) continue;

      const safeLoc = event.location.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
      const id = `${event.isoDate.replace(/-/g, '')}-${safeLoc || 'blanmont'}`;

      await ref.child(id).set({
        ...event,
        id,
        createdAt: new Date().toISOString(),
      });
      count++;
    }

    revalidatePath('/calendrier');
    revalidatePath('/admin/events');

    return {
      success: true,
      message: `${count} événements importés et enregistrés avec succès !`,
      count,
    };
  } catch (error: unknown) {
    console.error('Error saving imported events:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: 'Erreur lors de l’enregistrement des événements: ' + msg,
    };
  }
}

/**
 * Legacy direct import method (kept for backward compatibility if needed).
 */
export async function processPdf(formData: FormData) {
  const preview = await parsePdfForPreviewAction(formData);
  if (!preview.success || !preview.events) {
    return preview;
  }
  return await saveImportedEventsAction(preview.events);
}

function parsePdfText(text: string): CalendarEvent[] {
  const lines = text.split('\n');
  const events: CalendarEvent[] = [];

  const dateRegex =
    /^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\s*(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+(20\d{2})(.*)$/i;

  let tempCounter = 1;

  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const dayNum = match[2].padStart(2, '0');
      const monthName = match[3].toLowerCase();
      const year = match[4];
      const rest = match[5];

      const monthNum = MONTHS[monthName];
      const isoDate = `${year}-${monthNum}-${dayNum}`;

      let workString = rest.trim();
      let location = '';
      let distances = '';
      let departure = '';
      let address = '';
      let remarks = '';

      const distMatch = workString.match(/(\d{2,3}(?:-\d{2,3})+)/);
      let distIndex = -1;

      if (distMatch) {
        distances = distMatch[1];
        distIndex = workString.indexOf(distances);
      }

      if (distIndex > 0) {
        const prefix = workString.substring(0, distIndex);
        if (prefix.startsWith('Club')) {
          location = 'Blanmont';
          const plain = prefix.replace(/^Club/, '').trim();
          if (plain) location = plain;
        } else {
          location = prefix.trim();
        }

        let suffix = workString.substring(distIndex + distances.length);
        const timeMatch = suffix.match(/(\d{1,2}h(?:\d{2})?)/);
        if (timeMatch) {
          departure = timeMatch[1];
          const timeIndex = suffix.indexOf(departure);
          address = suffix.substring(timeIndex + departure.length).trim();
          if (address.startsWith('FECHERE')) {
            address = 'Place de Féchère';
          }
        } else {
          address = suffix.trim();
        }
      } else {
        location = workString;
      }

      events.push({
        id: `temp-${tempCounter++}`,
        isoDate,
        location: location || 'Blanmont',
        distances: distances || '70-90',
        departure: departure || '8h30',
        address: address || 'Place de Blanmont',
        remarks: remarks || '',
        alternative: '',
        group: 'Blanmont',
        gpxUrl: '',
      });
    }
  }

  return events;
}
