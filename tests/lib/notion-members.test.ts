import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMembers, validateUser, updateMemberPhoto } from '@/app/lib/notion/members';
import * as notionClient from '@/app/lib/notion/client';

vi.mock('@/app/lib/notion/client', () => ({
  isMockMode: false,
  MEMBERS_DB_ID: 'test-members-db-id',
  cleanId: vi.fn((id: string) => id.replace(/-/g, '')),
  notionRequest: vi.fn(),
}));

describe('Notion Members Service (app/lib/notion/members.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMembers pagination', () => {
    it('paginates through multiple pages using next_cursor and returns all members', async () => {
      const page1Response = {
        results: [
          {
            id: 'page-1',
            properties: {
              Name: { title: [{ plain_text: 'Adrien Delforge' }] },
              Role: { multi_select: [{ name: 'Member' }] },
              Bio: { rich_text: [{ plain_text: 'Cycliste passionné' }] },
              Photo: { files: [{ file: { url: 'https://example.com/photo1.jpg' } }] },
              Phone: { phone_number: '+32470000001' },
            },
          },
        ],
        has_more: true,
        next_cursor: 'cursor-page-2',
      };

      const page2Response = {
        results: [
          {
            id: 'page-2',
            properties: {
              Name: { title: [{ plain_text: 'Vincent Grandjean' }] },
              Role: { multi_select: [{ name: 'Traceur' }] },
              Bio: { rich_text: [] },
              Photo: { files: [] },
              Phone: { phone_number: '' },
            },
          },
        ],
        has_more: false,
        next_cursor: null,
      };

      const mockRequest = vi
        .spyOn(notionClient, 'notionRequest')
        .mockResolvedValueOnce(page1Response as any)
        .mockResolvedValueOnce(page2Response as any);

      const members = await getMembers();

      expect(mockRequest).toHaveBeenCalledTimes(2);
      expect(mockRequest).toHaveBeenNthCalledWith(
        1,
        'databases/testmembersdbid/query',
        'POST',
        expect.objectContaining({
          page_size: 100,
          start_cursor: undefined,
        })
      );
      expect(mockRequest).toHaveBeenNthCalledWith(
        2,
        'databases/testmembersdbid/query',
        'POST',
        expect.objectContaining({
          page_size: 100,
          start_cursor: 'cursor-page-2',
        })
      );

      expect(members).toHaveLength(2);
      expect(members[0].name).toBe('Adrien Delforge');
      expect(members[0].photoUrl).toBe('https://example.com/photo1.jpg');
      expect(members[1].name).toBe('Vincent Grandjean');
      expect(members[1].photoUrl).toBe('');
    });

    it('returns empty array when API throws an error', async () => {
      vi.spyOn(notionClient, 'notionRequest').mockRejectedValue(new Error('Notion API 500'));

      const members = await getMembers();
      expect(members).toEqual([]);
    });
  });

  describe('validateUser', () => {
    it('returns null when user is not found in Notion', async () => {
      vi.spyOn(notionClient, 'notionRequest').mockResolvedValue({ results: [] } as any);

      const user = await validateUser('unknown@test.com', 'password123');
      expect(user).toBeNull();
    });

    it('returns member when credentials match', async () => {
      vi.spyOn(notionClient, 'notionRequest').mockResolvedValue({
        results: [
          {
            id: 'page-auth',
            properties: {
              Name: { title: [{ plain_text: 'Nicolas Bruyere' }] },
              Role: { multi_select: [{ name: 'Admin' }] },
              Bio: { rich_text: [] },
              Email: { email: 'bruyere.nicolas@gmail.com' },
              Phone: { phone_number: '+32470123456' },
            },
          },
        ],
      } as any);

      const user = await validateUser('bruyere.nicolas@gmail.com', 'secret');
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Nicolas Bruyere');
      expect(user?.email).toBe('bruyere.nicolas@gmail.com');
      expect(user?.role).toEqual(['Admin']);
    });
  });

  describe('updateMemberPhoto', () => {
    it('patches the member page in Notion with photo URL', async () => {
      const mockRequest = vi.spyOn(notionClient, 'notionRequest').mockResolvedValue({} as any);

      await updateMemberPhoto('page-123', 'https://example.com/new-pic.jpg');

      expect(mockRequest).toHaveBeenCalledWith(
        'pages/page-123',
        'PATCH',
        expect.objectContaining({
          properties: {
            Photo: {
              files: [
                {
                  name: 'profile.jpg',
                  type: 'external',
                  external: { url: 'https://example.com/new-pic.jpg' },
                },
              ],
            },
          },
        })
      );
    });
  });
});
