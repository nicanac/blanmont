require('dotenv').config({ path: '.env.local' });

async function inspectAllTraces () {
    const token = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_TRACES_DB_ID?.match(/([a-f0-9]{32})/)?.[1];

    if (!token || !dbId) {
        console.log('Missing env vars');
        return;
    }

    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page_size: 100 })
    });

    const data = await res.json();

    console.log(`Total traces: ${data.results.length}\n`);

    // Find traces with photo URLs
    const tracesWithPhotos = data.results.filter(page => {
        const photoUrl = page.properties.photo?.url;
        return photoUrl && photoUrl.length > 0;
    });

    console.log(`Traces with photo URLs: ${tracesWithPhotos.length}\n`);

    tracesWithPhotos.slice(0, 5).forEach(page => {
        const name = page.properties.Name?.title[0]?.plain_text || 'Untitled';
        const photoUrl = page.properties.photo?.url;
        console.log(`${name}:`);
        console.log(`  Photo: ${photoUrl}`);
        console.log('');
    });
}

inspectAllTraces().catch(console.error);
