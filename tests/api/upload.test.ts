import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/route';
import * as sessionModule from '@/app/lib/auth/session';
import { v2 as cloudinary } from 'cloudinary';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: vi.fn(),
    },
  },
}));

describe('Upload API Endpoint (/api/upload)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when request has no active session user', async () => {
    vi.spyOn(sessionModule, 'getSessionUserFromRequest').mockReturnValue(null);

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Non authentifié/);
  });

  it('returns 400 when file or path is missing from formData', async () => {
    vi.spyOn(sessionModule, 'getSessionUserFromRequest').mockReturnValue({
      id: 'mem-1',
      isAdmin: true,
    } as any);

    const formData = new FormData();
    formData.set('path', 'blog/sample.jpg'); // missing file

    const req = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing file or path');
  });

  it('returns 500 when Cloudinary is not configured', async () => {
    const origEnv = { ...process.env };
    delete process.env.CLOUDINARY_CLOUD_NAME;

    try {
      vi.spyOn(sessionModule, 'getSessionUserFromRequest').mockReturnValue({
        id: 'mem-1',
        isAdmin: true,
      } as any);

      const formData = new FormData();
      const fakeFile = new File(['image-bytes'], 'photo.jpg', { type: 'image/jpeg' });
      formData.set('file', fakeFile);
      formData.set('path', 'blog/sample.jpg');

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Cloudinary not configured');
    } finally {
      process.env = origEnv;
    }
  });

  it('uploads file to Cloudinary and returns secure_url and publicId', async () => {
    const origEnv = { ...process.env };
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    try {
      vi.spyOn(sessionModule, 'getSessionUserFromRequest').mockReturnValue({
        id: 'mem-1',
        isAdmin: true,
      } as any);

      vi.mocked(cloudinary.uploader.upload).mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/sample.jpg',
        public_id: 'sample',
      } as any);

      const formData = new FormData();
      const fakeFile = new File(['image-bytes'], 'sample.jpg', { type: 'image/jpeg' });
      formData.set('file', fakeFile);
      formData.set('path', 'blog/sample.jpg');

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.url).toBe('https://res.cloudinary.com/test-cloud/image/upload/sample.jpg');
      expect(data.publicId).toBe('sample');
      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/jpeg;base64,'),
        expect.objectContaining({
          folder: 'blog',
          public_id: 'sample',
        })
      );
    } finally {
      process.env = origEnv;
    }
  });
});
