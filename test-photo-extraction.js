require('dotenv').config({ path: '.env.local' });

async function testGetTrace () {
    const token = process.env.NOTION_TOKEN;
    const traceId = '534cd6e8-b74f-4c9d-9701-31e3d48692de'; // The trace we know has photos

    if (!token) {
        console.log('Missing token');
        return;
    }

    const res = await fetch(`https://api.notion.com/v1/pages/${traceId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        }
    });

    const page = await res.json();
    const props = page.properties;

    console.log('Trace:', props.Name?.title[0]?.plain_text);
    console.log('\nphoto property type:', props.photo?.type);
    console.log('photo.url:', props.photo?.url);
    console.log('photo.files:', props.photo?.files);

    // Simulate the mapping
    const photoAlbumUrl = props.photo?.url || undefined;
    const photoFiles = props.photo?.files || [];
    let photoUrl = photoFiles.length > 0 ? photoFiles[0].file?.url || photoFiles[0].external?.url : undefined;

    console.log('\n--- Extracted Values ---');
    console.log('photoAlbumUrl:', photoAlbumUrl);
    console.log('photoUrl:', photoUrl);
    console.log('photoFiles.length:', photoFiles.length);
}

testGetTrace().catch(console.error);
