// Native fetch in Node 18+

const albumUrl = "https://photos.google.com/share/AF1QipOs-ZDGSR28cCdrDkG55IFA7IMMLOynx6SYQM2eSB3Sd44wtilJGEZXhd45-Bu-KQ?pli=1&key=MEI0U1F1bXl5SXJCVXNvWFNXWlNQZzhXUFFmU1l3";

async function testScraping () {
    console.log("Fetching album...");
    const res = await fetch(albumUrl);
    const html = await res.text();

    // The regex used in the app
    const regex = /https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9_-]+/g;
    const matches = html.match(regex);

    if (!matches) {
        console.log("No matches found with regex.");
        return;
    }

    console.log(`Found ${matches.length} matches.`);
    const unique = [...new Set(matches)];

    const firstMatch = unique[0];
    const testUrl = `${firstMatch}=w600-h400-c`; // Appending size params

    console.log("\nTesting URL:", testUrl);

    try {
        const imgRes = await fetch(testUrl);
        console.log("Status:", imgRes.status);
        console.log("Content-Type:", imgRes.headers.get('content-type'));
        console.log("Content-Length:", imgRes.headers.get('content-length'));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testScraping();
