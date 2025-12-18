require('dotenv').config({ path: '.env.local' });

async function notionRequest (endpoint, body) {
    const token = process.env.NOTION_TOKEN;
    const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body || {})
    });
    return res.json();
}

async function debugState () {
    console.log('--- DEBUGGING STATE ---');

    console.log('\n1. MEMBERS (checking for "President" role):');
    const membersDbId = process.env.NOTION_MEMBERS_DB_ID;
    if (membersDbId) {
        const res = await notionRequest(`databases/${membersDbId}/query`, {
            sorts: [{ property: 'Name', direction: 'ascending' }],
        });

        if (res.results) {
            res.results.forEach(page => {
                const name = page.properties.Name?.title?.[0]?.plain_text || 'Unknown';
                const roles = page.properties.Role?.multi_select?.map(r => r.name) || [];
                if (name.includes('Laurent') || roles.includes('President')) {
                    console.log(`- ${name}: [${roles.join(', ')}]`);
                }
            });
        } else {
            console.log('Error fetching members:', JSON.stringify(res));
        }
    }

    console.log('\n2. SATURDAY RIDES (Checking Status):');
    const ridesDbId = process.env.NOTION_SATURDAY_RIDE_DB_ID;
    if (ridesDbId) {
        const res = await notionRequest(`databases/${ridesDbId}/query`, {
            sorts: [{ property: 'Date', direction: 'descending' }],
        });

        if (res.results) {
            console.log(`Found ${res.results.length} total entries.`);
            res.results.forEach(page => {
                const date = page.properties.Date?.date?.start;
                const status = page.properties.Status?.select?.name;
                const candidates = page.properties.Candidates?.relation?.length || 0;
                console.log(`- ID: ${page.id}, Date: ${date}, Status: "${status}", Candidates: ${candidates}`);
            });
        } else {
            console.log('Error fetching rides:', JSON.stringify(res));
        }
    }
}

debugState();
