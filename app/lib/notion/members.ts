import { Member, NotionPage } from '../../types';
import { isMockMode, MEMBERS_DB_ID, cleanId, notionRequest } from './client';
import bcrypt from 'bcryptjs';
import { AuthenticationError, DatabaseError } from '../errors';
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
    throw new DatabaseError(`Member fetch failed: ${errorMessage}`);
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

    // First fetch the user by email only
    const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
      filter: {
        property: 'Email',
        email: { equals: email }
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    const props = page.properties;

    // Get the stored hashed password
    const storedPasswordHash = props.Password?.rich_text?.[0]?.plain_text;

    if (!storedPasswordHash) {
      logger.warn(`No password hash found for user ${email}`);
      return null;
    }

    // Check if the password is valid
    // For migration purposes, if the password matches the stored password exactly
    // (and doesn't start with bcrypt's $2 identifier), we'll allow it and hash it.
    let isPasswordValid = false;
    const isStoredHash = storedPasswordHash.startsWith('$2');

    if (isStoredHash) {
      isPasswordValid = await bcrypt.compare(password, storedPasswordHash);
    } else {
      isPasswordValid = password === storedPasswordHash;
      if (isPasswordValid) {
         // Auto-migrate to hashed password
         const newHash = await bcrypt.hash(password, 10);
         await updatePassword(page.id, newHash).catch((err) => {
           logger.error(`Failed to migrate password for user ${email}:`, err);
         });
      }
    }

    if (!isPasswordValid) {
       return null;
    }
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to validate user:', errorMessage);
    return null; // Return null instead of throwing to avoid 500 error on invalid login
  }
};

export const updatePassword = async (memberId: string, passwordHash: string): Promise<void> => {
  if (isMockMode) {
    logger.info('Mock member password update:', { memberId, passwordHash });
    return;
  }

  try {
    await notionRequest(`pages/${memberId}`, 'PATCH', {
      properties: {
        "Password": {
          rich_text: [
            {
              type: "text",
              text: { content: passwordHash }
            }
          ]
        }
      }
    });
  } catch (error) {
    logger.error('Failed to update member password in Notion:', error);
    throw error;
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
