const https = require('https');
const fs = require('fs');

const url = 'https://www.komoot.com/fr-fr/tour/968833009?ref=aso&share_token=a4Kl0Z8T4Y63g7SuKUqdvdPnkpm4apVkBgigXoUc6Iojl7lBYV';

function fetch (url) {
    console.log('Fetching:', url);
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    };

    https.get(url, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            console.log('Redirecting to:', res.headers.location);
            fetch(res.headers.location);
            return;
        }

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log('Data length:', data.length);
            fs.writeFileSync('temp_komoot.html', data);
            console.log('Saved to temp_komoot.html');
        });
    }).on('error', (err) => {
        console.log('Error: ' + err.message);
    });
}

fetch(url);
