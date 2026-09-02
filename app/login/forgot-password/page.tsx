'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { requestAccountActivationAction } from '../../actions';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function ForgotPasswordPage(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [directLink, setDirectLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setMessage(null);
    setDirectLink(null);
    setIsSubmitting(true);

    try {
      const result = await requestAccountActivationAction(email.trim());
      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message,
        });
        if (result.directLink) {
          setDirectLink(result.directLink);
        }
      } else {
        setMessage({
          type: 'error',
          text: result.message || 'Impossible de générer le lien.',
        });
      }
    } catch (error: unknown) {
      console.error(error);
      setMessage({
        type: 'error',
        text: 'Une erreur est survenue lors de la création du lien.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#0a0c10] text-white relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.025] leading-none text-center">
        <span className="text-[clamp(8rem,24vw,28rem)] font-extrabold uppercase tracking-tighter text-white whitespace-nowrap">
          BLANMONT
        </span>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Card */}
        <div className="rounded-lg border border-[#262b38] bg-[#161922] p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Activer ou Réinitialiser <span className="text-[#e03e3e] italic">votre mot de passe</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#a7adbb] leading-relaxed">
              Pour une <strong className="text-white font-semibold">première connexion</strong> ou un <strong className="text-white font-semibold">mot de passe oublié</strong> : entrez l&apos;adresse email enregistrée auprès du club pour recevoir votre lien d&apos;activation sécurisé.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {message && (
              <div className="space-y-3">
                <div
                  role="alert"
                  className={`rounded-md p-3.5 flex items-start gap-3 text-xs border ${
                    message.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-[#e03e3e]/40 bg-[#e03e3e]/10 text-red-200'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircleIcon className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <ExclamationCircleIcon className="h-4 w-4 text-[#e03e3e] shrink-0 mt-0.5" />
                  )}
                  <span>{message.text}</span>
                </div>

                {directLink && (
                  <a
                    href={directLink}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-stone-950 px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-lg active:scale-[0.98]"
                  >
                    <span>👉 Définir mon mot de passe maintenant</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="reset-email"
                className="block text-xs font-bold uppercase tracking-wider text-[#a7adbb]"
              >
                Adresse Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.be"
                  className="w-full rounded-md border border-[#262b38] bg-[#101216] pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-wider transition-colors active:scale-[0.98] shadow-lg disabled:opacity-50 min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Création du lien en cours...</span>
                  </>
                ) : (
                  <span>Générer mon lien d&apos;accès</span>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#262b38] text-center">
            <Link
              href="/login"
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#a7adbb] hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Retour à la page de connexion</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
