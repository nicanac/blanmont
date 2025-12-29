import { CalendarEvent, NotionPage } from '../../types';
import { isMockMode, CALENDAR_DB_ID, cleanId, notionRequest } from './client';

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    if (isMockMode || !CALENDAR_DB_ID) {
       console.warn('Missing NOTION_CALENDAR_DB_ID or mock mode'); 
       return [];
    }
    
    try {
        const dbId = cleanId(CALENDAR_DB_ID);
        let allResults: NotionPage[] = [];
        let hasMore = true;
        let startCursor = undefined;

        while (hasMore) {
             const response: { results: NotionPage[], has_more: boolean, next_cursor: string } = await notionRequest(`databases/${dbId}/query`, 'POST', {
                sorts: [{ property: 'Date', direction: 'ascending' }],
                page_size: 100,
                start_cursor: startCursor
             });
             allResults = [...allResults, ...response.results];
             hasMore = response.has_more;
             startCursor = response.next_cursor;
        }

        return allResults.map((page) => {
            const props = page.properties;
            return {
                id: page.id,
                isoDate: props.Date?.date?.start || '',
                location: props.Lieu?.rich_text?.[0]?.text?.content || '',
                distances: props.Distances?.rich_text?.[0]?.text?.content || '',
                departure: props['Départ']?.rich_text?.[0]?.text?.content || '',
                address: props.Adresse?.rich_text?.[0]?.text?.content || '',
                remarks: props.Remarques?.rich_text?.[0]?.text?.content || '',
                alternative: props.Alternative?.rich_text?.[0]?.text?.content || '',
                group: props.Groupe?.rich_text?.[0]?.text?.content || ''
            };
        });

    } catch (e) {
        console.error('Failed to fetch calendar events:', e);
        return [];
    }
};
