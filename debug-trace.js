require('dotenv').config({ path: '.env.local' });

async function debugTrace () {
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

    // Find a trace with photo URL
    const traceWithPhoto = data.results.find(page => {
        const photoUrl = page.properties.photo?.url;
        return photoUrl && photoUrl.length > 0;
    });

    if (traceWithPhoto) {
        console.log('Found trace with photo:');
        console.log('ID:', traceWithPhoto.id);
        console.log('Name:', traceWithPhoto.properties.Name?.title[0]?.plain_text);
        console.log('\nPhoto property:');
        console.log(JSON.stringify(traceWithPhoto.properties.photo, null, 2));
        console.log('\nphoto.url:', traceWithPhoto.properties.photo?.url);
    } else {
        console.log('No traces with photo URLs found');
    }
}

debugTrace().catch(console.error);
