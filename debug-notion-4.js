const { Client } = require('@notionhq/client');

const notion = new Client({ auth: 'secret_test' });
console.log('notion.request exists:', !!notion.request);
