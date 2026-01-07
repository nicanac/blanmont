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
        photoUrl: photoUrl || 'https://placehold.co/400x400',
        phone: props.Phone?.phone_number || props.Mobile?.phone_number || '',
      };
    });
  } catch (error) {
    logger.error('Failed to fetch members:', error);
    return [];
  }
};

/**
 * Validates user credentials.
 */
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
        and: [
          { property: 'Email', email: { equals: email } },
          { property: 'Password', rich_text: { equals: password } },
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
      phone: props.Phone?.phone_number || props.Mobile?.phone_number || props.GSM?.phone_number || '',
    };
  } catch (error) {
    logger.error('Failed to validate user:', error);
    return null;
  }
};

export const updateMemberPhoto = async (memberId: string, photoUrl: string) => {
    if (isMockMode) {
      logger.debug('Mock member photo update:', { memberId, photoUrl });
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
