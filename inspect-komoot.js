async function test () {
    const url = 'https://www.komoot.com/fr-fr/tour/969211481';
    console.log('Fetching:', url);
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error('Fetch failed:', res.status, res.statusText);
            return;
        }
        const html = await res.text();
        console.log('Length:', html.length);

        // Look for OG tags
        const ogImage = html.match(/<meta property="og:image"\s+content="([^"]+)"/);
        if (ogImage) {
            console.log('OG Image Found:', ogImage[1]);
        } else {
            console.log('OG Image NOT found');
            // Log first 500 chars to see if we got blocked or redirected
            console.log('Preview:', html.substring(0, 500));
        }

        // Check twitter image as fallback
        const twitterImage = html.match(/<meta name="twitter:image"\s+content="([^"]+)"/);
        if (twitterImage) console.log('Twitter Image:', twitterImage[1]);

    } catch (e) {
        console.error('Error:', e);
    }
}

test();
