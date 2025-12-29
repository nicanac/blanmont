import { Member, Trace, Feedback, SaturdayRide, Vote } from '../../types';

// Helper to check if we are in mock mode
export const isMockMode = !process.env.NOTION_TOKEN;

export const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DB_ID;
export const TRACES_DB_ID = process.env.NOTION_TRACES_DB_ID;
export const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;
export const SATURDAY_RIDE_DB_ID = process.env.NOTION_SATURDAY_RIDE_DB_ID;
export const VOTES_DB_ID = process.env.NOTION_VOTES_DB_ID;
export const CALENDAR_DB_ID = '2d29555c-6779-80b0-a9e3-e07785d2d847';

export const cleanId = (id: string | undefined) => {
  if (!id) return '';
  const match = id.match(/([a-f0-9]{32})/);
  if (match) return match[1];
  return id;
};

// Robust fetch wrapper replacing @notionhq/client
export async function notionRequest<T = any>(endpoint: string, method: string, body?: any): Promise<T> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('Missing Notion Token');

  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API Error ${res.status}: ${text}`);
  }

  return res.json();
}
