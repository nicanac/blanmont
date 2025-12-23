
import { Client } from '@notionhq/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
        name, date, distance, elevation, 
        direction, start, end,
        komootLink, gpxLink, photoLink,
        roadQuality, rating, status, note,
        gpxContent // New field containing raw GPX XML
    } = body;

    // NOTE: Auth should be handled via session/cookie in a real secure app.
    if (!name || !date) {
        return NextResponse.json({ error: 'Name and Date are required' }, { status: 400 });
    }

    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const databaseId = process.env.NOTION_TRACES_DB_ID;

    if (!databaseId) {
        return NextResponse.json({ error: 'Database ID not configured' }, { status: 500 });
    }

    // Map properties to Notion schema
    const properties: any = {
      'Name': {
        title: [
          {
            text: { content: name },
          },
        ],
      },
      'last done': { 
        date: { start: date },
      },
      'Status': {
          status: { name: status || 'To Do' }
      }
    };

    if (elevation) properties['Elevation'] = { number: Number(elevation) };
    
    // Selects
    if (direction) properties['Direction'] = { select: { name: direction } };
    if (start) properties['start'] = { select: { name: start } };
    if (end) properties['end'] = { select: { name: end } };
    if (roadQuality) properties['road'] = { select: { name: roadQuality } };
    if (rating) properties['Rating'] = { select: { name: rating } };

    // 1. Create the page first (Metadata only)
    const newPage = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: properties,
    });

    // 2. Append GPX content as blocks (if present)
    if (gpxContent) {
        const blocks: any[] = [];
        
        // Notion Limits:
        // - Rich Text Object text.content limit: 2000 characters
        // - Block children append request size limit (unspecified but strict, 413 often hits >1MB payloads)
        // Strategy: 
        // - Create Code Blocks of approx 10KB each (5 chunks of 2000 chars)
        // - Batch append requests to 30 blocks per request (~300KB payload)
        
        const MAX_CHARS_PER_RICH_TEXT = 2000;
        const RICH_TEXTS_PER_BLOCK = 5; 
        const BLOCK_CHAR_LIMIT = MAX_CHARS_PER_RICH_TEXT * RICH_TEXTS_PER_BLOCK; // 10,000 characters per block

        for (let i = 0; i < gpxContent.length; i += BLOCK_CHAR_LIMIT) {
            const blockContent = gpxContent.substring(i, Math.min(i + BLOCK_CHAR_LIMIT, gpxContent.length));
            
            const richTextChunks = [];
            for (let j = 0; j < blockContent.length; j += MAX_CHARS_PER_RICH_TEXT) {
                richTextChunks.push({
                    type: "text",
                    text: { content: blockContent.substring(j, Math.min(j + MAX_CHARS_PER_RICH_TEXT, blockContent.length)) }
                });
            }

            blocks.push({
                object: 'block',
                type: 'code',
                code: {
                    caption: [{ type: 'text', text: { content: `GPX Data (Part ${Math.floor(i / BLOCK_CHAR_LIMIT) + 1})` } }],
                    rich_text: richTextChunks,
                    language: 'xml'
                }
            });
        }

        // 3. Append blocks in batches
        const BATCH_SIZE = 30; // 30 blocks * 10KB = ~300KB per request (Safe)
        for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
            await notion.blocks.children.append({
                block_id: newPage.id,
                children: blocks.slice(i, i + BATCH_SIZE)
            });
        }
    }

    return NextResponse.json({ success: true, id: newPage.id });
  } catch (error: any) {
    console.error('Error creating trace:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
