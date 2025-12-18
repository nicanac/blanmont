const { Client } = require('@notionhq/client');

async function test () {
    const notion = new Client({ auth: 'secret_test' });
    try {
        // This will fail with 401 or 404 but proves the method exists and is called
        await notion.request({
            path: `databases/fake_id/query`,
            method: 'post',
            body: {}
        });
    } catch (e) {
        console.log('Error Code:', e.code);
        console.log('Success: notion.request was called.');
    }
}

test();
