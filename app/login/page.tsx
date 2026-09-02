'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { requestAccountActivationAction } from '../actions';
import Link from 'next/link';
import {
  LockClosedIcon,
  EnvelopeIcon,
  KeyIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

type AuthMode = 'login' | 'activate';

function LoginForm(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [directActivationLink, setDirectActivationLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode with URL query if present (e.g. /login?mode=activate)
  useEffect(() => {
    const initialMode = searchParams.get('mode');
    if (initialMode === 'activate' || initialMode === 'reset') {
      setMode('activate');
    }
  }, [searchParams]);

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setDirectActivationLink(null);
    setIsLoading(true);

    try {
      if (!email.trim() || !password) {
        setError('Veuillez renseigner votre email et mot de passe.');
        setIsLoading(false);
        return;
      }

      const success = await login(email.trim(), password);
      if (success) {
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      } else {
        setError('Identifiants incorrects. S\'il s\'agit de votre première visite, activez votre compte ci-dessus.');
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle First-Time Activation / Password Reset Submission
  const handleActivation = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setDirectActivationLink(null);
    setIsLoading(true);

    try {
      if (!email.trim()) {
        setError('Veuillez renseigner votre adresse email.');
        setIsLoading(false);
        return;
      }

      const result = await requestAccountActivationAction(email.trim());
      if (result.success) {
        setSuccessMessage(result.message);
        if (result.directLink) {
          setDirectActivationLink(result.directLink);
        }
      } else {
        setError(result.message || 'Impossible d\'envoyer le lien d\'activation.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Une erreur inattendue est survenue lors de la création du lien.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 space-y-6">
      {/* Main Distilled Card */}
      <div className="rounded-xl border border-white/10 bg-[#12151d] p-7 sm:p-9 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
            Espace <span className="text-[#e03e3e] italic">Peloton</span>
          </h1>
          <p className="text-xs text-[#a7adbb]">
            Club de Blanmont · Membres &amp; Administration
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#0a0c10] p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMessage('');
            }}
            className={`rounded-md py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              mode === 'login'
                ? 'bg-[#1e232f] text-white shadow-sm border border-white/10'
                : 'text-[#7d8493] hover:text-white'
            }`}
          >
            Connexion
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('activate');
              setError('');
              setSuccessMessage('');
            }}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              mode === 'activate'
                ? 'bg-[#1e232f] text-amber-300 shadow-sm border border-amber-500/30'
                : 'text-[#7d8493] hover:text-white'
            }`}
          >
            <SparklesIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>1ère Connexion</span>
          </button>
        </div>

        {/* Status Notifications */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-[#e03e3e]/40 bg-[#e03e3e]/10 p-3.5 flex items-start gap-2.5 text-xs text-red-200"
          >
            <ExclamationCircleIcon className="h-4 w-4 text-[#e03e3e] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="space-y-3">
            <div
              role="status"
              className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-xs text-emerald-200"
            >
              <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>

            {directActivationLink && (
              <a
                href={directActivationLink}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-stone-950 px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg active:scale-[0.98]"
              >
                <span>Définir mon mot de passe maintenant</span>
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* ──── Tab 1 : Standard Login ──── */}
        {mode === 'login' ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
              >
                Adresse Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.be"
                  className="w-full rounded-md border border-white/10 bg-[#0a0c10] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('activate');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-[#a7adbb] hover:text-[#e03e3e] transition-colors"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative">
                <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  maxLength={128}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-white/10 bg-[#0a0c10] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors active:scale-[0.98] shadow-lg shadow-[#e03e3e]/20 disabled:opacity-50 min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <LockClosedIcon className="h-4 w-4" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ──── Tab 2 : First-Time Activation / Reset ──── */
          <form className="space-y-4" onSubmit={handleActivation}>
            <p className="text-xs text-[#d5d9e2] leading-relaxed">
              Entrez l&apos;adresse email enregistrée auprès du club pour recevoir un lien d&apos;activation et choisir votre mot de passe.
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="activate-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
              >
                Adresse Email du Membre
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="activate-email"
                  name="email"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.be"
                  className="w-full rounded-md border border-white/10 bg-[#0a0c10] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#5c6370] focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 hover:bg-amber-400 text-stone-950 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider transition-colors active:scale-[0.98] shadow-lg disabled:opacity-50 min-h-[44px]"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Envoi du lien en cours...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    <span>Recevoir mon lien d&apos;accès</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer Assistance */}
        <div className="pt-4 border-t border-white/10 text-center">
          {mode === 'login' ? (
            <button
              type="button"
              onClick={() => {
                setMode('activate');
                setError('');
                setSuccessMessage('');
              }}
              className="text-xs text-[#a7adbb] hover:text-white transition-colors"
            >
              Nouveau membre ? <strong className="text-amber-300 font-semibold underline">Activez votre accès ici</strong>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className="text-xs text-[#a7adbb] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Vous avez déjà un mot de passe ? <strong>Se connecter</strong></span>
            </button>
          )}
        </div>
      </div>

      {/* Home Link */}
      <div className="text-center">
        <Link
          href="/"
          className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#7d8493] hover:text-white transition-colors"
        >
          <span>← Retour à l&apos;accueil du club</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Root page with Suspense wrapper for Next.js App Router static optimization.
 */
export default function LoginPage(): React.ReactElement {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#0a0c10] text-white relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.025] leading-none text-center">
        <span className="text-[clamp(8rem,24vw,28rem)] font-extrabold uppercase tracking-tighter text-white whitespace-nowrap">
          BLANMONT
        </span>
      </div>

      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12151d] p-8 text-center text-xs text-[#7d8493]">
            <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto mb-2 text-[#e03e3e]" />
            <span>Chargement de l&apos;espace membre...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
