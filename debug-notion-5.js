const { Client } = require('@notionhq/client');
const notion = new Client({ auth: 'secret_test' });
console.log('Keys on notion.pages:', Object.keys(notion.pages));
