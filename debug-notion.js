const { Client } = require('@notionhq/client');

console.log('Notion Client Version Test');
const notion = new Client({ auth: 'secret_test' });

console.log('Keys on notion.databases:', Object.keys(notion.databases));
if (notion.databases.query) {
    console.log('notion.databases.query exists');
} else {
    console.log('notion.databases.query DOES NOT exist');
}
