'use client';

import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface DeleteBlogButtonProps {
  postId: string;
  postTitle?: string;
}

export default function DeleteBlogButton({ postId, postTitle: _postTitle }: DeleteBlogButtonProps): React.ReactElement {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async (): Promise<void> => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="rounded-lg px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
      title="Delete"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
