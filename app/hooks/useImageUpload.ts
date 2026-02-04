import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '../lib/firebase/client';

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
    return new Promise((resolve, reject) => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const storage = getFirebaseStorage();
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          setError(error.message);
          setIsUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            resolve(downloadURL);
          } catch (err: any) {
            setError(err.message || 'Error getting download URL');
            setIsUploading(false);
            reject(err);
          }
        }
      );
    });
  };

  return { uploadImage, progress, error, isUploading };
}
