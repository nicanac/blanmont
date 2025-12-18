const { Client } = require('@notionhq/client');

console.log('Notion Client Structure Test');
const notion = new Client({ auth: 'secret_test' });

console.log('Keys on notion:', Object.keys(notion));
