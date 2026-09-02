'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { requestAccountActivationAction } from '../../actions';
import {
  getFirebaseAuth,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
} from '../../lib/firebase/client';
import {
  LockClosedIcon,
  KeyIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

type ActionStatus = 'verifying' | 'ready' | 'expired' | 'success' | 'email_verified' | 'error';

function AuthActionHandler(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const mode = searchParams.get('mode') || 'resetPassword';
  const oobCode = searchParams.get('oobCode') || '';

  const [status, setStatus] = useState<ActionStatus>('verifying');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Recovery form state for expired links
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState('');
  const [newDirectLink, setNewDirectLink] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyCode() {
      if (!oobCode) {
        setStatus('expired');
        return;
      }

      try {
        const auth = getFirebaseAuth();

        if (mode === 'resetPassword' || mode === 'signIn') {
          const verifiedEmail = await verifyPasswordResetCode(auth, oobCode);
          if (isMounted) {
            setEmail(verifiedEmail);
            setRecoveryEmail(verifiedEmail);
            setStatus('ready');
          }
        } else if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          if (isMounted) {
            setStatus('email_verified');
          }
        } else {
          if (isMounted) {
            setStatus('ready');
          }
        }
      } catch (err: unknown) {
        console.warn('Action code verification failed:', err);
        if (isMounted) {
          setStatus('expired');
        }
      }
    }

    verifyCode();

    return () => {
      isMounted = false;
    };
  }, [mode, oobCode]);

  // Handle password submission
  const handlePasswordSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 6) {
      setErrorMessage('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);

      setStatus('success');

      // Attempt automatic sign-in if email is known
      if (email) {
        try {
          const loggedIn = await login(email, newPassword);
          if (loggedIn) {
            setTimeout(() => {
              router.push('/');
            }, 1800);
            return;
          }
        } catch (loginErr) {
          console.warn('Auto login after reset failed, user can login manually:', loginErr);
        }
      }

      setTimeout(() => {
        router.push('/login');
      }, 2200);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      setErrorMessage(err?.message || 'Une erreur est survenue lors de l\'enregistrement du mot de passe.');
      setIsSubmitting(false);
    }
  };

  // Handle recovery link generation if link expired
  const handleRecoverySubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setErrorMessage('');
    setRecoverySuccess('');
    setNewDirectLink(null);
    setRecoveryLoading(true);

    try {
      if (!recoveryEmail.trim()) {
        setErrorMessage('Veuillez renseigner votre adresse email.');
        setRecoveryLoading(false);
        return;
      }

      const result = await requestAccountActivationAction(recoveryEmail.trim());
      if (result.success) {
        setRecoverySuccess('Un nouveau lien sécurisé a été généré avec succès !');
        if (result.directLink) {
          setNewDirectLink(result.directLink);
        }
      } else {
        setErrorMessage(result.message || 'Impossible de générer le nouveau lien.');
      }
    } catch {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10 space-y-6">
      {/* ──── Verification Loader ──── */}
      {status === 'verifying' && (
        <div className="rounded-xl border border-white/10 bg-[#12151d] p-10 shadow-2xl text-center space-y-4">
          <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-[#e03e3e]" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">
              Vérification de la clé de sécurité
            </h2>
            <p className="text-xs text-[#a7adbb]">
              Validation du jeton d&apos;authentification auprès de Blanmont...
            </p>
          </div>
        </div>
      )}

      {/* ──── Ready Form : Define Password ──── */}
      {status === 'ready' && (
        <div className="rounded-xl border border-white/10 bg-[#12151d] p-7 sm:p-9 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e03e3e]/15 border border-[#e03e3e]/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e03e3e]">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              <span>Activation Sécurisée</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Définir votre <span className="text-[#e03e3e] italic">mot de passe</span>
            </h1>
            {email && (
              <p className="text-xs text-[#a7adbb]">
                Compte membre : <strong className="text-white font-semibold">{email}</strong>
              </p>
            )}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-[#e03e3e]/40 bg-[#e03e3e]/10 p-3.5 flex items-start gap-2.5 text-xs text-red-200"
            >
              <ExclamationTriangleIcon className="h-4 w-4 text-[#e03e3e] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="new-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                  maxLength={128}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="w-full rounded-md border border-white/10 bg-[#0a0c10] pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#7d8493] hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <LockClosedIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  className="w-full rounded-md border border-white/10 bg-[#0a0c10] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || newPassword.length < 6 || confirmPassword.length < 6}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors active:scale-[0.98] shadow-lg shadow-[#e03e3e]/20 disabled:opacity-50 min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Enregistrer mon mot de passe</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="text-xs text-[#a7adbb] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>← Retour à la connexion</span>
            </Link>
          </div>
        </div>
      )}

      {/* ──── Expired / Invalid Code State (Replacing the broken Firebase screen) ──── */}
      {status === 'expired' && (
        <div className="rounded-xl border border-white/10 bg-[#12151d] p-7 sm:p-9 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>Lien Expiré</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Lien expiré ou <span className="text-amber-400 italic">déjà utilisé</span>
            </h1>
            <p className="text-xs text-[#d5d9e2] leading-relaxed max-w-sm mx-auto">
              Pour des raisons de sécurité, les liens d&apos;activation sont à usage unique et expirent rapidement.
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-md border border-[#e03e3e]/40 bg-[#e03e3e]/10 p-3.5 flex items-start gap-2.5 text-xs text-red-200"
            >
              <ExclamationTriangleIcon className="h-4 w-4 text-[#e03e3e] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {recoverySuccess && (
            <div className="space-y-3">
              <div
                role="status"
                className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-xs text-emerald-200"
              >
                <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{recoverySuccess}</span>
              </div>

              {newDirectLink && (
                <Link
                  href={newDirectLink}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-stone-950 px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg active:scale-[0.98]"
                >
                  <span>👉 Définir mon mot de passe maintenant</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}

          {!newDirectLink && (
            <form className="space-y-4" onSubmit={handleRecoverySubmit}>
              <div className="space-y-1.5">
                <label
                  htmlFor="recovery-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
                >
                  Votre adresse email
                </label>
                <div className="relative">
                  <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    maxLength={254}
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="nom@exemple.be"
                    className="w-full rounded-md border border-white/10 bg-[#0a0c10] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#5c6370] focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={recoveryLoading || !recoveryEmail.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 hover:bg-amber-400 text-stone-950 px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider transition-colors active:scale-[0.98] shadow-lg disabled:opacity-50 min-h-[44px]"
              >
                {recoveryLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Création du lien en cours...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    <span>Générer un nouveau lien d&apos;accès</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="text-xs text-[#a7adbb] hover:text-white transition-colors"
            >
              ← Retour à la page de connexion
            </Link>
          </div>
        </div>
      )}

      {/* ──── Success State ──── */}
      {status === 'success' && (
        <div className="rounded-xl border border-emerald-500/30 bg-[#12151d] p-8 sm:p-10 shadow-2xl text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircleIcon className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
              Mot de passe enregistré !
            </h2>
            <p className="text-xs text-emerald-300">
              Votre compte est maintenant actif. Connexion automatique en cours...
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
            >
              <span>Accéder au club</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ──── Email Verified State ──── */}
      {status === 'email_verified' && (
        <div className="rounded-xl border border-emerald-500/30 bg-[#12151d] p-8 sm:p-10 shadow-2xl text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <CheckCircleIcon className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-white">
              Email vérifié avec succès !
            </h2>
            <p className="text-xs text-emerald-300">
              Votre adresse email a bien été confirmée.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
            >
              <span>Se connecter</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Back to Home */}
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

export default function AuthActionPage(): React.ReactElement {
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
            <span>Vérification de la clé de sécurité...</span>
          </div>
        }
      >
        <AuthActionHandler />
      </Suspense>
    </main>
  );
}
