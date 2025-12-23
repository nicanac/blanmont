const { Client } = require('@notionhq/client');
console.log('Client:', Client);
const notion = new Client({ auth: 'secret' });
console.log('notion keys:', Object.keys(notion));
if (notion.databases) {
    console.log('notion.databases keys:', Object.keys(notion.databases));
} else {
    console.log('notion.databases is undefined');
}
