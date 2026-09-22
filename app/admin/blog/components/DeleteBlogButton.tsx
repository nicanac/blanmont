'use client';

import React from 'react';
import AdminDeleteButton from '@/app/admin/components/AdminDeleteButton';

interface DeleteBlogButtonProps {
  postId: string;
  postTitle?: string;
}

export default function DeleteBlogButton({ postId, postTitle }: DeleteBlogButtonProps): React.ReactElement {
  return (
    <AdminDeleteButton
      endpoint={`/api/admin/blog/${postId}`}
      itemTitle={postTitle}
      successMessage="Article supprimé avec succès."
      errorMessage="Erreur lors de la suppression de l'article"
      ariaLabel="Supprimer l'article"
    />
  );
}
