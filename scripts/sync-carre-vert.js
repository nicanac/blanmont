
const fetch = require('node-fetch');

// Script to manually trigger the Carré Vert import/sync process
// This requires the Next.js development server to be running on localhost:3000

async function syncCarreVert() {
    console.log('🔄 Starting Carré Vert synchronization...');
    console.log('Ensure that your CSV file is placed at: public/CC Blanmont - sorties 2026 - SORTiES.csv');

    try {
        const response = await fetch('http://localhost:3000/api/admin/import-csv');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
            console.error('❌ Sync failed:', result.error);
        } else {
            console.log('✅ Sync successful!');
            console.log(JSON.stringify(result, null, 2));
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Could not connect to the server. Is "npm run dev" running on port 3000?');
        } else {
            console.error('❌ An unexpected error occurred:', error);
        }
    }
}

syncCarreVert();
