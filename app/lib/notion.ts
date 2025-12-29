import { Member, Trace, Feedback, SaturdayRide, Vote } from '../types';

// Helper to check if we are in mock mode
const isMockMode = !process.env.NOTION_TOKEN;

const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DB_ID;
const TRACES_DB_ID = process.env.NOTION_TRACES_DB_ID;
const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;
const SATURDAY_RIDE_DB_ID = process.env.NOTION_SATURDAY_RIDE_DB_ID;
const VOTES_DB_ID = process.env.NOTION_VOTES_DB_ID;

const cleanId = (id: string | undefined) => {
  if (!id) return '';
  const match = id.match(/([a-f0-9]{32})/);
  if (match) return match[1];
  return id;
};

// Robust fetch wrapper replacing @notionhq/client
/**
 * A robust wrapper around the standard `fetch` API for making requests to the Notion API.
 * Handles authentication, headers, and standard error parsing.
 * 
 * @param endpoint - The API endpoint (e.g., 'databases/QUERY').
 * @param method - HTTP method ('GET', 'POST', 'PATCH', etc.).
 * @param body - Optional JSON body for the request.
 * @returns The JSON response from the Notion API.
 * @throws Error if the response status is not OK.
 */
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

/**
 * Fetches the list of all active members from the Notion 'Members' database.
 * Falls back to mock data if Notion Token is missing or in mock mode.
 * 
 * @returns A promise resolving to an array of `Member` objects.
 */
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
        phone: props.Phone?.phone_number || props.Mobile?.phone_number || '',
      };
    });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return [];
  }
};
// Helper to validate user credentials
/**
 * Validates user credentials against the Notion Members database.
 * 
 * @param email - The email address to check.
 * @param password - The password to check.
 * @returns A promise resolving to the Member object if valid, or null if invalid.
 */
export const validateUser = async (email: string, password: string): Promise<Member | null> => {
  if (!MEMBERS_DB_ID) return null;

  try {
    const dbId = cleanId(MEMBERS_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      filter: {
        and: [
          {
            property: 'Email',
            email: {
              equals: email,
            },
          },
          {
            property: 'Password',
            rich_text: {
              equals: password,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const props = page.properties;
    const photoFiles = props.Photo?.files || [];
    const photoUrl = photoFiles.length > 0 ? photoFiles[0].file?.url || photoFiles[0].external?.url : '';

    return {
      id: page.id,
      name: props.Name?.title[0]?.plain_text || 'Unknown',
      role: props.Role?.multi_select?.map((r: any) => r.name) || [],
      bio: props.Bio?.rich_text[0]?.plain_text || '',
      photoUrl: photoUrl || 'https://placehold.co/400x400',
      email: props.Email?.email || '',
      phone: props.Phone?.phone_number || props.Mobile?.phone_number || props.GSM?.phone_number || '', // Try multiple potential property names
    };
  } catch (error) {
    console.error('Failed to validate user:', error);
    return null;
  }
};
// Helper to scrape og:image from Komoot
/**
 * Attempts to scrape the OpenGraph image from a public Komoot URL.
 * 
 * @param url - The Komoot route URL.
 * @returns The URL of the image, or undefined if scraping failed.
 */
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
    end: props.end?.select?.name,
    direction: props.Direction?.select?.name || props.Direction?.rich_text?.[0]?.plain_text || undefined
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

/**
 * Fetches a single trace by its Notion Page ID.
 * Enriches the trace data with Google Photos previews if an album URL is present.
 * 
 * @param id - The UUID of the trace.
 * @returns A `Trace` object or `null` if not found/error.
 */
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

/**
 * Fetches all available traces from the Notion database.
 * Handles pagination automatically to retrieve the complete dataset.
 * 
 * @returns A promise resolving to an array of `Trace` objects.
 */
export const getTraces = async (): Promise<Trace[]> => {
  if (isMockMode || !TRACES_DB_ID) {
    if (!isMockMode) console.warn('Missing NOTION_TRACES_DB_ID, falling back to mock.');
    return [
      { id: '1', name: 'Morning Coffee Loop', distance: 45, elevation: 300, surface: 'Road', quality: 5, description: 'Easy Sunday ride.', mapUrl: 'https://google.com' },
    ];
  }

  try {
    const dbId = cleanId(TRACES_DB_ID);
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
        const response: any = await notionRequest(`databases/${dbId}/query`, 'POST', {
            sorts: [{ property: 'Name', direction: 'ascending' }],
            page_size: 100,
            start_cursor: startCursor
        });
        
        allResults = [...allResults, ...response.results];
        hasMore = response.has_more;
        startCursor = response.next_cursor;
    }

    // Process traces in parallel to fetch images if needed
    const traces = await Promise.all(allResults.map(mapPageToTrace));

    return traces;
  } catch (error) {
    console.error('Failed to fetch traces:', error);
    return [];
  }
};

/**
 * Retrieves feedback entries for a specific trace.
 * 
 * @param traceId - The UUID of the trace.
 * @returns A promise resolving to an array of `Feedback` objects.
 */
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

/**
 * Submits or updates feedback for a trace.
 * If `feedbackId` is provided, it updates the existing entry.
 * If not, it checks for an existing entry by the same member to prevent duplicates.
 * 
 * @param traceId - The ID of the trace being reviewed.
 * @param memberId - The ID of the member leaving feedback.
 * @param rating - Numeric rating (1-5).
 * @param comment - Text comment.
 * @param feedbackId - Optional ID of an existing feedback entry to update.
 */
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
/**
 * Updates the 'map-preview' file property of a trace page with a new image URL.
 * 
 * @param traceId - The UUID of the trace.
 * @param imageUrl - The public URL of the image to set as the preview.
 */
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

/**
 * Updates the 'Photo' file property of a member page with a new image URL.
 * 
 * @param memberId - The UUID of the member.
 * @param photoUrl - The public URL of the image.
 */
export const updateMemberPhoto = async (memberId: string, photoUrl: string) => {
    if (isMockMode) {
      console.log('Mock member photo update:', { memberId, photoUrl });
      return;
    }

    try {
      await notionRequest(`pages/${memberId}`, 'PATCH', {
        properties: {
          "Photo": {
            files: [
              {
                name: "profile.jpg",
                type: "external",
                external: {
                  url: photoUrl
                }
              }
            ]
          }
        }
      });
    } catch (error) {
       console.error('Failed to update member photo in Notion:', error);
       throw error;
    }
};

/**
 * Fetches all Saturday Ride events that are currently in the 'Voting' status.
 * Used to display active polls to members.
 * 
 * @returns A promise resolving to an array of active `SaturdayRide` objects.
 */
export const getActiveRides = async (): Promise<SaturdayRide[]> => {
    if (isMockMode || !SATURDAY_RIDE_DB_ID) {
        if (isMockMode) return [{ id: 'mock-ride', date: '2024-05-18', candidateTraceIds: ['1'], status: 'Voting' }] as any;
        return [];
    }

    try {
        const dbId = cleanId(SATURDAY_RIDE_DB_ID);
        // Fetch all rides and filter in memory to avoid API validation errors
        const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
             sorts: [{ property: 'Date', direction: 'ascending' }],
        });

        const activeRides = response.results
            .map((page: any) => {
                const props = page.properties;
                const candidates = props.Candidates?.relation?.map((r: any) => r.id) || [];
                const selected = props['Selected Trace']?.relation?.[0]?.id;

                return {
                    id: page.id,
                    date: props.Date?.date?.start || '',
                    candidateTraceIds: candidates,
                    selectedTraceId: selected,
                    status: props.Status?.status?.name || props.Status?.select?.name || 'Draft'
                };
            })
            .filter((ride: SaturdayRide) => ride.status === 'Voting');

        return activeRides;

    } catch (e) {
        console.error('Failed to get active rides:', e);
        return [];
    }
};

/**
 * Creates a new Saturday Ride event in Notion.
 * 
 * @param date - The date of the ride (YYYY-MM-DD).
 * @param traceIds - Array of Trace IDs that are candidates for this ride.
 */
export const createRide = async (date: string, traceIds: string[]) => {
    if (isMockMode || !SATURDAY_RIDE_DB_ID) return;

    try {
        const dbId = cleanId(SATURDAY_RIDE_DB_ID);
        await notionRequest('pages', 'POST', {
            parent: { database_id: dbId },
            properties: {
                Name: { title: [{ text: { content: `Ride ${date}` } }] },
                Date: { date: { start: date } },
                Candidates: { relation: traceIds.map(id => ({ id })) },
                Status: { status: { name: 'Voting' } }
            }
        });
    } catch (e) {
        console.error('Failed to create ride:', e);
        throw e;
    }
};

/**
 * Retrieves all votes cast for a specific ride.
 * 
 * @param rideId - The UUID of the Saturday Ride.
 * @returns A promise resolving to an array of `Vote` objects.
 */
export const getVotes = async (rideId: string): Promise<Vote[]> => {
    if (isMockMode || !VOTES_DB_ID) return [];

    try {
        const dbId = cleanId(VOTES_DB_ID);
        const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
            filter: {
                property: 'Ride',
                relation: { contains: rideId }
            }
        });

        return response.results.map((page: any) => ({
            id: page.id,
            rideId: rideId,
            memberId: page.properties.Member?.relation?.[0]?.id || '',
            traceId: page.properties.Trace?.relation?.[0]?.id || ''
        }));
    } catch (e) {
        console.error('Failed to get votes:', e);
        return [];
    }
};

/**
 * Submits a vote for a Saturday Ride.
 * If the member has already voted for this ride, their previous vote is updated.
 * 
 * @param rideId - The ID of the ride event.
 * @param memberId - The ID of the member voting.
 * @param traceId - The ID of the trace selected.
 */
export const submitVote = async (rideId: string, memberId: string, traceId: string) => {
    if (isMockMode || !VOTES_DB_ID) return;

    try {
        // Check if member already voted for this ride
        const votes = await getVotes(rideId);
        const existingVote = votes.find(v => v.memberId === memberId);

        if (existingVote) {
             // Update existing vote
             await notionRequest(`pages/${existingVote.id}`, 'PATCH', {
                 properties: {
                     Trace: { relation: [{ id: traceId }] }
                 }
             });
        } else {
            // Create new vote
            const dbId = cleanId(VOTES_DB_ID);
            await notionRequest('pages', 'POST', {
                parent: { database_id: dbId },
                properties: {
                    Ride: { relation: [{ id: rideId }] },
                    Member: { relation: [{ id: memberId }] },
                    Trace: { relation: [{ id: traceId }] }
                }
            });
        }
    } catch (e) {
        console.error('Failed to submit vote:', e);
        throw e;
    }
};

const CALENDAR_DB_ID = '2d29555c-6779-80b0-a9e3-e07785d2d847'; // Hardcoded valid ID to override incorrect env var

/**
 * Fetches all calendar events from Notion.
 */
import { CalendarEvent } from '../types';

export const createTrace = async (traceData: Partial<Trace> & { photos?: string[] }) => {
    if (isMockMode || !TRACES_DB_ID) {
        console.log('Mock create trace:', traceData);
        return { success: true, id: 'mock-new-id' };
    }

    try {
        const dbId = cleanId(TRACES_DB_ID);
        const properties: any = {
            Name: { title: [{ text: { content: traceData.name || 'Untitled Import' } }] },
            Note: { rich_text: [{ text: { content: traceData.description || 'Imported from Strava' } }] },
            Komoot: { url: traceData.mapUrl || null }, // Using 'Komoot' field for general Map URL
            // Fixed property name from 'D+' to 'Elevation' (Case sensitive common convention)
            Elevation: { number: traceData.elevation || 0 },
        };

        if (traceData.direction) {
            properties.Direction = {
                select: {
                    name: traceData.direction
                }
            };
        }

        // 'photo' property in this DB seems to be a URL, not a File object.
        // We set the first photo as the main photo URL.
        if (traceData.photos && traceData.photos.length > 0) {
            properties.photo = {
                url: traceData.photos[0]
            };
        }

        // Construct page content (Children)
        const children = [];
        
        // Add Description as generic text
        if (traceData.description) {
            children.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ text: { content: traceData.description } }]
                }
            });
        }

        // Add Photos as Image Blocks
        if (traceData.photos) {
            traceData.photos.forEach(url => {
                children.push({
                    object: 'block',
                    type: 'image',
                    image: {
                        type: 'external',
                        external: { url }
                    }
                });
            });
        }
        
        await notionRequest('pages', 'POST', {
            parent: { database_id: dbId },
            properties: properties,
            children: children
        });
        
        return { success: true };
    } catch (e) {
        console.error('Failed to create trace:', e);
        return { success: false, error: String(e) };
    }
};

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
    if (isMockMode || !CALENDAR_DB_ID) {
       console.warn('Missing NOTION_CALENDAR_DB_ID or mock mode'); 
       return [];
    }
    
    try {
        const dbId = cleanId(CALENDAR_DB_ID);
        // Fetch all - likely need pagination if many events, but for now 100 limit is okay or loop
        let allResults: any[] = [];
        let hasMore = true;
        let startCursor = undefined;

        while (hasMore) {
             const response: any = await notionRequest(`databases/${dbId}/query`, 'POST', {
                sorts: [{ property: 'Date', direction: 'ascending' }],
                page_size: 100,
                start_cursor: startCursor
             });
             allResults = [...allResults, ...response.results];
             hasMore = response.has_more;
             startCursor = response.next_cursor;
        }

        return allResults.map((page: any) => {
            const props = page.properties;
            return {
                id: page.id,
                isoDate: props.Date?.date?.start || '',
                location: props.Lieu?.rich_text?.[0]?.text?.content || '',
                distances: props.Distances?.rich_text?.[0]?.text?.content || '',
                departure: props['Départ']?.rich_text?.[0]?.text?.content || '',
                address: props.Adresse?.rich_text?.[0]?.text?.content || '',
                remarks: props.Remarques?.rich_text?.[0]?.text?.content || '',
                alternative: props.Alternative?.rich_text?.[0]?.text?.content || '',
                group: props.Groupe?.rich_text?.[0]?.text?.content || ''
            };
        });

    } catch (e) {
        console.error('Failed to fetch calendar events:', e);
        return [];
    }
};
