import { test, expect } from '@playwright/test';

test.describe('Public API Endpoints', () => {
  test('GET /api/calendar/subscribe.ics returns valid iCalendar feed', async ({ request }) => {
    const response = await request.get('/api/calendar/subscribe.ics');
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('BEGIN:VCALENDAR');
    expect(text).toContain('END:VCALENDAR');
  });

  test('GET /api/calendar/ics returns calendar data', async ({ request }) => {
    const response = await request.get('/api/calendar/ics');
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('VCALENDAR');
  });

  test('GET /api/equipements returns valid equipment list', async ({ request }) => {
    const response = await request.get('/api/equipements');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('category');
  });

  test('GET /api/traces/[id] returns trace JSON or valid response', async ({ request }) => {
    const response = await request.get('/api/traces/trace_12338a3128914ee4b788916553028046');
    // Either 200 with data or handled response
    expect([200, 404]).toContain(response.status());
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('id');
    }
  });
});
