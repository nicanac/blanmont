import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

let isConfigured = false;

/**
 * Ensures Cloudinary is configured with environment variables.
 */
export function getCloudinaryClient(): typeof cloudinary {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
  }
  return cloudinary;
}

/**
 * Checks if all required Cloudinary environment variables are present.
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: Record<string, unknown>[];
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  overwrite?: boolean;
}

/**
 * Uploads a web File or Buffer to Cloudinary with strong typing and error handling.
 */
export async function uploadImageToCloudinary(
  fileOrBuffer: File | { buffer: Buffer; mimeType: string },
  options: UploadOptions = {}
): Promise<UploadApiResponse> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured');
  }

  let dataURI: string;
  if ('arrayBuffer' in fileOrBuffer) {
    const bytes = await fileOrBuffer.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    dataURI = `data:${fileOrBuffer.type};base64,${base64}`;
  } else {
    const base64 = fileOrBuffer.buffer.toString('base64');
    dataURI = `data:${fileOrBuffer.mimeType};base64,${base64}`;
  }

  const client = getCloudinaryClient();
  return await client.uploader.upload(dataURI, {
    folder: options.folder || 'general',
    public_id: options.publicId,
    resource_type: options.resourceType || 'auto',
    overwrite: options.overwrite ?? true,
    transformation: options.transformation,
  });
}
