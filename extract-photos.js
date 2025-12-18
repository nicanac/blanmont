const fs = require('fs');

const html = fs.readFileSync('google-photos.html', 'utf8');
// Broader regex to capture google user content URLs
const regex = /https:\/\/[a-z0-9]+\.googleusercontent\.com\/[^"'\s\\]+/g;
const matches = html.match(regex);

if (matches) {
    const unique = [...new Set(matches)];
    console.log(`Found ${unique.length} unique URLs`);
    // Filter for likely content images (usually longer URLs)
    const likelyImages = unique.filter(url => url.length > 80 && !url.includes('s32-c'));
    console.log(likelyImages.slice(0, 10));
} else {
    console.log('No matches found');
}
