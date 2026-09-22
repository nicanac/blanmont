'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/app/components/ui/Spinner';

interface ResetPasswordPageProps {
  params: Promise<{ id: string }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps): React.ReactElement {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/members/${id}`);
        if (response.ok) {
          const data = await response.json();
          setMemberName(data.name);
        }
      } catch (error) {
        console.error('Error fetching member:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/members/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('Mot de passe réinitialisé avec succès !');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Erreur lors de la réinitialisation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/members"
            className="rounded-md p-2 text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors duration-150 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#101216] dark:text-white">Mot de passe réinitialisé</h1>
          </div>
        </div>
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6">
          <p className="text-emerald-800 dark:text-emerald-200">
            Le mot de passe de <strong>{memberName}</strong> a été réinitialisé avec succès.
          </p>
          <Link
            href="/admin/members"
            className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors duration-150 min-h-[44px] inline-flex items-center"
          >
            Retour aux membres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/members"
          className="rounded-md p-2 text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors duration-150 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#101216] dark:text-white">Réinitialiser le mot de passe</h1>
          <p className="text-sm text-[#5c6370] dark:text-[#a7adbb]">Pour {memberName}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
              Nouveau mot de passe *
            </label>
            <input
              type="password"
              id="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white placeholder:text-[#a7adbb] focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              placeholder="Minimum 6 caractères"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/admin/members"
            className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-6 py-2 text-sm font-medium text-[#3a3f4a] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors duration-150 min-h-[44px] inline-flex items-center justify-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#e03e3e] px-6 py-2 text-sm font-medium text-white hover:bg-[#c93434] transition-colors duration-150 disabled:opacity-50 min-h-[44px] inline-flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>
        </div>
      </form>
    </div>
  );
}
