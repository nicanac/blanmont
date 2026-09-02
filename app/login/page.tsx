'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import {
  LockClosedIcon,
  EnvelopeIcon,
  KeyIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (username.length > 0 && password.length > 0) {
        const success = await login(username, password);
        if (success) {
          router.push('/');
        } else {
          setError('Email ou mot de passe incorrect.');
        }
      } else {
        setError('Veuillez entrer un email et un mot de passe.');
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#0a0c10] text-white relative overflow-hidden">
      {/* Ambient red glow */}
      <div className="pointer-events-none absolute -top-40 -right-24 h-[500px] w-[500px] rounded-full bg-[#e03e3e]/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-[400px] w-[400px] rounded-full bg-white/5 blur-[120px]" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Auth Card */}
        <div className="rounded-lg border border-[#262b38] bg-[#161922] p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#f5f6f8] mx-auto">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
              Espace Membre
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Connexion au <span className="text-[#e03e3e] italic">Peloton</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#a7adbb] leading-relaxed">
              Connectez-vous pour répondre aux sondages et consulter les traces GPS du club.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md border border-[#e03e3e]/40 bg-[#e03e3e]/10 p-3.5 flex items-start gap-3 text-xs text-red-200">
                <ExclamationCircleIcon className="h-4 w-4 text-[#e03e3e] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
              >
                Adresse Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nom@exemple.be"
                  className="w-full rounded-md border border-[#262b38] bg-[#101216] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
                >
                  Mot de passe
                </label>
                <Link
                  href="/login/forgot-password"
                  className="text-xs text-[#a7adbb] hover:text-white transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-[#262b38] bg-[#101216] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98] shadow-lg disabled:opacity-50"
              >
                <LockClosedIcon className="h-4 w-4" />
                <span>{isLoading ? 'Connexion...' : 'Se connecter'}</span>
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="pt-4 border-t border-[#262b38] text-center space-y-2">
            <p className="text-xs text-[#7d8493]">
              Pas encore de compte membre ?{' '}
              <a
                href="mailto:info@blanmont.be?subject=Demande%20de%20compte%20membre%20CC%20Saint-Martin"
                className="font-semibold text-white hover:text-[#e03e3e] underline transition-colors"
              >
                Demander un accès
              </a>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a7adbb] hover:text-white transition-colors"
          >
            <span>← Retour à l&apos;accueil du club</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
