import { useState } from 'react';

interface UseImageUploadResult {
  uploadImage: (file: File, path: string) => Promise<string>;
  progress: number;
  error: string | null;
  isUploading: boolean;
}

export function useImageUpload(): UseImageUploadResult {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File, path: string): Promise<string> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);

      // Simulate progress (since we can't track real progress with fetch easily)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setProgress(100);
      setIsUploading(false);
      
      return data.url;
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setIsUploading(false);
      throw err;
    }
  };

  return {
    uploadImage,
    progress,
    error,
    isUploading,
  };
}
