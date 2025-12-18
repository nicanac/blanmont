require('dotenv').config({ path: '.env.local' });

async function countTraces () {
    const dbId = process.env.NOTION_TRACES_DB_ID;
    const token = process.env.NOTION_TOKEN;

    if (!dbId || !token) {
        console.error('Missing env vars');
        return;
    }

    try {
        console.log(`Querying database ${dbId}...`);
        let hasMore = true;
        let startCursor = undefined;
        let count = 0;

        while (hasMore) {
            const body = {
                page_size: 100
            };
            if (startCursor) body.start_cursor = startCursor;

            const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(JSON.stringify(data));

            count += data.results.length;
            hasMore = data.has_more;
            startCursor = data.next_cursor;
            console.log(`Fetched batch: ${data.results.length}. Total so far: ${count}`);
        }

        console.log(`Total Traces in DB: ${count}`);

    } catch (e) {
        console.error(e);
    }
}

countTraces();
