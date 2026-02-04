'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { processPdf } from './actions';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ImportEventsPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setResult(null);

    try {
      const response = await processPdf(formData);
      setResult(response);
      if (response.success) {
        setTimeout(() => {
          router.push('/admin/events');
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setResult({ success: false, message: 'Une erreur est survenue lors du traitement du fichier: ' + (error instanceof Error ? error.message : String(error)) });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="rounded-full p-2 hover:bg-gray-100">
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Importer des événements (PDF)</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <p className="text-sm text-gray-500">
            Sélectionnez le fichier PDF du calendrier (format tableau attendu).
          </p>
          
          <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center hover:bg-gray-100">
            <span className="mb-2 text-sm text-gray-500">
              {isUploading ? 'Traitement en cours...' : 'Cliquez pour sélectionner un fichier PDF'}
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>

          {result && (
            <div className={`mt-4 rounded-md p-4 bg-gray-50 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.message}
              {result.count && <p className="mt-1 font-semibold">{result.count} événements créés.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
