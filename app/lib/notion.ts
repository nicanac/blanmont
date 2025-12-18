import { Member, Trace, Feedback } from '../types';

// Helper to check if we are in mock mode
const isMockMode = !process.env.NOTION_TOKEN;

const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DB_ID;
const TRACES_DB_ID = process.env.NOTION_TRACES_DB_ID;
const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;

const cleanId = (id: string | undefined) => {
  if (!id) return '';
  const match = id.match(/([a-f0-9]{32})/);
  if (match) return match[1];
  return id;
};

// Robust fetch wrapper replacing @notionhq/client
async function notionRequest(endpoint: string, method: string, body?: any) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('Missing Notion Token');

  const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion API Error ${res.status}: ${text}`);
  }

  return res.json();
}

export const getMembers = async (): Promise<Member[]> => {
  if (isMockMode || !MEMBERS_DB_ID) {
    if (!isMockMode) console.warn('Missing NOTION_MEMBERS_DB_ID, falling back to mock.');
    return [
      { id: '1', name: 'Alice Velo', role: ['President'], bio: 'Love climbing.', photoUrl: 'https://placehold.co/400x400' },
      { id: '2', name: 'Bob Sprinter', role: ['Member'], bio: 'Fast on flats.', photoUrl: 'https://placehold.co/400x400' },
    ];
  }

  try {
    const dbId = cleanId(MEMBERS_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      sorts: [{ property: 'Name', direction: 'ascending' }],
    });

    return response.results.map((page: any) => {
      const props = page.properties;
      const photoFiles = props.Photo?.files || [];
      const photoUrl = photoFiles.length > 0 ? photoFiles[0].file?.url || photoFiles[0].external?.url : '';

      return {
        id: page.id,
        name: props.Name?.title[0]?.plain_text || 'Unknown',
        role: props.Role?.multi_select?.map((r: any) => r.name) || [],
        bio: props.Bio?.rich_text[0]?.plain_text || '',
        photoUrl: photoUrl || 'https://placehold.co/400x400',
      };
    });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return [];
  }
};

// Helper to scrape og:image from Komoot
export async function getKomootImage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const html = await res.text();
    const match = html.match(/<meta property="og:image"\s+content="([^"]+)"/);
    if (!match) return undefined;
    // Decode HTML entities (Komoot returns &amp; in URLs)
    return match[1].replace(/&amp;/g, '&');
  } catch (err) {
    console.error('Failed to scrape Komoot image:', err);
    return undefined;
  }
}

// Helper to map Notion page to Trace object
const mapPageToTrace = async (page: any): Promise<Trace> => {
  const props = page.properties;
  
  // Parse Formula for Distance (km)
  const kmFormula = props.km?.formula;
  const dist = parseFloat(kmFormula?.string || kmFormula?.number || '0');
  
  // Parse Rating
  const ratingSelect = props.Rating?.select;
  const ratingStr = ratingSelect?.name || '';
  const ratingColor = ratingSelect?.color || 'default';
  const quality = ratingStr.replace(/[^⭐]/g, '').length || 3;

  // Parse Photo
  
  // Parse Google Photos Album URL
  const photoAlbumUrl = props.photo?.url || undefined;
  const photoFiles = props.photo?.files || [];
  let photoUrl = photoFiles.length > 0 ? photoFiles[0].file?.url || photoFiles[0].external?.url : undefined;

  // Parse Map Preview (New priority)
  const mapPreviewFiles = props['map-preview']?.files || [];
  if (mapPreviewFiles.length > 0) {
      photoUrl = mapPreviewFiles[0].file?.url || mapPreviewFiles[0].external?.url;
  }
  // If still no Photo, try to scrape Komoot
  else {
      const mapUrl = props.Komoot?.url;
      if (!photoUrl && mapUrl && mapUrl.includes('komoot')) {
         const scrapedImage = await getKomootImage(mapUrl);
         if (scrapedImage) {
             photoUrl = scrapedImage;
         }
      }
  }

  return {
    id: page.id,
    name: props.Name?.title[0]?.plain_text || 'Untitled Trace',
    distance: dist,
    elevation: props.Elevation?.number || props.elevation?.number || props['D+']?.number || undefined, 
    surface: props.road?.select?.name || 'Road',
    quality: quality,
    ratingColor: ratingColor,
    description: props.Note?.rich_text[0]?.plain_text || '',
    mapUrl: props.Komoot?.url || undefined,
    gpxUrl: props.Gpx?.url || undefined,
    photoUrl: photoUrl,
    photoAlbumUrl: photoAlbumUrl,
    start: props.start?.select?.name,
    end: props.end?.select?.name
  };
};

// Helper to scrape Google Photos
async function scrapeGooglePhotos(url: string): Promise<string[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const html = await res.text();
    const regex = /https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9_-]+/g;
    const matches = html.match(regex);
    if (!matches) return [];
    
    return [...new Set(matches)].slice(0, 5).map(u => `${u}=w600-h400-c`);
  } catch (e) {
    console.warn('Failed to scrape photos:', e);
    return [];
  }
}

export const getTrace = async (id: string): Promise<Trace | null> => {
    if (isMockMode) return null;
    try {
        const page = await notionRequest(`pages/${id}`, 'GET');
        const trace = await mapPageToTrace(page);
        
        // Enrich with photo previews if album exists
        if (trace.photoAlbumUrl) {
            trace.photoPreviews = await scrapeGooglePhotos(trace.photoAlbumUrl);
        }
        
        return trace;
    } catch (e) {
        console.error('Failed to fetch trace:', e);
        return null;
    }
};

export const getTraces = async (): Promise<Trace[]> => {
  if (isMockMode || !TRACES_DB_ID) {
    if (!isMockMode) console.warn('Missing NOTION_TRACES_DB_ID, falling back to mock.');
    return [
      { id: '1', name: 'Morning Coffee Loop', distance: 45, elevation: 300, surface: 'Road', quality: 5, description: 'Easy Sunday ride.', mapUrl: 'https://google.com' },
    ];
  }

  try {
    const dbId = cleanId(TRACES_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      sorts: [{ property: 'Name', direction: 'ascending' }],
    });

    // Process traces in parallel to fetch images if needed
    const traces = await Promise.all(response.results.map(mapPageToTrace));

    return traces;
  } catch (error) {
    console.error('Failed to fetch traces:', error);
    return [];
  }
};

export const getFeedbackForTrace = async (traceId: string): Promise<Feedback[]> => {
  if (isMockMode || !FEEDBACK_DB_ID) return [];

  try {
    const dbId = cleanId(FEEDBACK_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      filter: {
        property: 'Trace',
        relation: { contains: traceId }
      },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    });

    return response.results.map((page: any) => {
        const props = page.properties;
        const memberRelation = props.Members?.relation || [];
        return {
          id: page.id,
          traceId: traceId,
          comment: props.Comment?.title?.[0]?.plain_text || '',
          rating: props.Rating?.number || 0,
          memberId: memberRelation.length > 0 ? memberRelation[0].id : undefined,
          createdAt: page.created_time
        } as Feedback;
    });
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return [];
  }
};

export const submitFeedback = async (traceId: string, memberId: string, rating: number, comment: string, feedbackId?: string) => {
   if (isMockMode || !FEEDBACK_DB_ID) {
     console.log('Mock submission:', { traceId, memberId, rating, comment, feedbackId });
     return;
   }
   
   try {
     let targetId = feedbackId;

     // If no ID provided, check if this member already submitted feedback for this trace
     if (!targetId && memberId) {
         const existingFeedback = await getFeedbackForTrace(traceId);
         const match = existingFeedback.find(f => f.memberId === memberId);
         if (match) {
             console.log(`Found existing feedback ${match.id} for member ${memberId}, updating instead of creating.`);
             targetId = match.id;
         }
     }

     // UPDATE existing
     if (targetId) {
         await notionRequest(`pages/${targetId}`, 'PATCH', {
             properties: {
                 Comment: { title: [{ text: { content: comment } }] },
                 Rating: { number: rating }
             }
         });
         return;
     }

     // CREATE new
     const dbId = cleanId(FEEDBACK_DB_ID);
     const properties: any = {
         Comment: {
           title: [
             { text: { content: comment } }
           ]
         },
         Rating: {
           number: rating
         },
         Trace: {
           relation: [
             { id: traceId }
           ]
         }
     };

     if (memberId) {
         properties.Members = {
             relation: [
                 { id: memberId }
             ]
         };
     }

     await notionRequest('pages', 'POST', {
       parent: { database_id: dbId },
       properties: properties
     });
   } catch (error) {
     console.error('Failed to submit feedback:', error);
   }
};
export const submitMapPreview = async (traceId: string, imageUrl: string) => {
    if (isMockMode) {
      console.log('Mock map preview update:', { traceId, imageUrl });
      return;
    }

    try {
      await notionRequest(`pages/${traceId}`, 'PATCH', {
        properties: {
          "map-preview": {
            files: [
              {
                name: "preview.jpg",
                type: "external",
                external: {
                  url: imageUrl
                }
              }
            ]
          }
        }
      });
    } catch (error) {
       console.error('Failed to update map preview in Notion:', error);
       throw error;
    }
};
