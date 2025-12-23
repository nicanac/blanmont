const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const DATABASE_ID = '1e855e15-3a2c-4562-83e2-6c77052d27a3';
const NOTION_VERSION = '2022-06-28';

function notionRequest (path, method, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.notion.com',
            path: '/v1' + path,
            method: method,
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': NOTION_VERSION,
                'Content-Type': 'application/json'
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.end();
    });
}

async function main () {
    console.log('Fetching one trace...');
    const result = await notionRequest(`/databases/${DATABASE_ID}/query`, 'POST', { page_size: 1 });
    if (result.results && result.results.length > 0) {
        const props = result.results[0].properties;
        console.log('Property Names:');
        Object.keys(props).forEach(key => {
            console.log(`- "${key}": type=${props[key].type}, id=${props[key].id}`);
        });
    } else {
        console.log('No traces found.');
    }
}
main();
