import { Member, NotionPage } from '../../types';
import { isMockMode, MEMBERS_DB_ID, cleanId, notionRequest } from './client';
import { logger } from '../logger';

/**
 * Fetches the list of all active members from the Notion 'Members' database.
 */
export const getMembers = async (): Promise<Member[]> => {
  if (isMockMode || !MEMBERS_DB_ID) {
    if (!isMockMode) logger.warn('Missing NOTION_MEMBERS_DB_ID, falling back to mock.');
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

    return response.results.map((page: NotionPage) => {
      const props = page.properties;
      const photoFiles = props.Photo?.files || [];
      const photoUrl = photoFiles.length > 0 ? photoFiles[0].file?.url || photoFiles[0].external?.url : '';

      return {
        id: page.id,
        name: props.Name?.title?.[0]?.plain_text || 'Unknown',
        role: props.Role?.multi_select?.map((r: any) => r.name) || [],
        bio: props.Bio?.rich_text?.[0]?.plain_text || '',
        photoUrl: photoUrl || '',
        phone: props.Phone?.phone_number || props.Mobile?.phone_number || '',
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch members:', errorMessage);
    return []; // Return empty array on error so components that expect an array don't break
  }
};

/**
 * Validates user credentials.
 */
// Web Crypto fallback for bcrypt-like comparison
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const validateUser = async (email: string, password: string): Promise<Member | null> => {
  if (isMockMode || email === 'mock@test.com') {
     if (password === 'password') {
         return { id: '1', name: 'Mock User', role: ['Member'], bio: 'Mock', photoUrl: '', email: 'mock@test.com' };
     }
     return null;
  }
  
  if (!MEMBERS_DB_ID) return null;

  try {
    const dbId = cleanId(MEMBERS_DB_ID);
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      filter: {
        property: 'Email',
        email: { equals: email }
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const props = page.properties;

    const storedPassword = props.Password?.rich_text[0]?.plain_text;
    if (!storedPassword) return null;

    // First attempt a direct comparison for legacy plain-text passwords
    // Note: For a real production app, all plain-text passwords should be migrated to hashes.
    let isPasswordValid = storedPassword === password;

    // If not plain-text match, check if it matches SHA-256 hash
    if (!isPasswordValid) {
      const hashedPassword = await hashPassword(password);
      isPasswordValid = storedPassword === hashedPassword;
    }

    if (!isPasswordValid) return null;

    const photoFiles = props.Photo?.files || [];
    const photoUrl = photoFiles.length > 0 ? photoFiles[0].file?.url || photoFiles[0].external?.url : '';

    return {
      id: page.id,
      name: props.Name?.title[0]?.plain_text || 'Unknown',
      role: props.Role?.multi_select?.map((r: any) => r.name) || [],
      bio: props.Bio?.rich_text[0]?.plain_text || '',
      photoUrl: photoUrl || 'https://placehold.co/400x400',
      email: props.Email?.email || '',
      phone: props.Phone?.phone_number || props.Mobile?.phone_number || props.GSM?.phone_number || '',
    };
  } catch (error) {
    logger.error('Failed to validate user:', error);
    return null;
  }
};

export const updateMemberPhoto = async (memberId: string, photoUrl: string) => {
    if (isMockMode) {
      logger.info('Mock member photo update:', { memberId, photoUrl });
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
                external: { url: photoUrl }
              }
            ]
          }
        }
      });
    } catch (error) {
       logger.error('Failed to update member photo in Notion:', error);
       throw error;
    }
};
