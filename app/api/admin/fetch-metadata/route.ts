
import { NextRequest, NextResponse } from 'next/server';
import { FetchMetadataApiSchema, safeValidate } from '@/app/lib/validation';
import { logger } from '@/app/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = safeValidate(FetchMetadataApiSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    // Attempt to fetch with browser-like headers to bypass basic bot protection
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
    });

    if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch URL: ${res.status}` }, { status: res.status });
    }

    const html = await res.text();

    // Basic Regex Extraction (Cheerio would be better but keeping it dependency-free for now)
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    
    // Extract stats from description usually in format "Distance: 50.5 km | Elevation: 600 m" or similar locale dependent
    // Example FR: "Cyclisme sur route à/en Wallonie ... 56,8 km ... 380 m ..."
    // This is fragile but better than nothing.
    
    let name = titleMatch ? titleMatch[1] : '';
    // Clean name: "My Route | Komoot" -> "My Route"
    name = name.split('|')[0].trim();

    const description = descMatch ? descMatch[1] : '';
    const image = imageMatch ? imageMatch[1] : '';

    // Attempt to parse stats
    // Look for numbers followed by "km" and "m"
    // Regex for distance: (\d+[.,]?\d*)\s*km
    // Regex for elevation: (\d+)\s*m
    
    const distMatch = description.match(/(\d+[.,]?\d*)\s*km/);
    const elevMatch = description.match(/(\d+)\s*m/);

    const distance = distMatch ? distMatch[1].replace(',', '.') : '';
    const elevation = elevMatch ? elevMatch[1] : '';

    return NextResponse.json({
        name,
        distance,
        elevation,
        photoLink: image,
        description
    });

  } catch (error: any) {
    logger.error('Metadata fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}