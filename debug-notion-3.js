const { Client } = require('@notionhq/client');

console.log('Notion Client Prototype Test');
const notion = new Client({ auth: 'secret_test' });

const proto = Object.getPrototypeOf(notion.databases);
console.log('Prototype keys:', Object.getOwnPropertyNames(proto));
console.log('Instance keys:', Object.keys(notion.databases));
