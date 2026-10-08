'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheckIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import {
  hasGivenConsent,
  getCookieConsent,
  saveCookieConsent,
  OPEN_CONSENT_MODAL_EVENT,
} from '@/app/lib/consent/cookieConsent';

export default function CookieConsentCartouche(): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getCookieConsent();
    if (!existing) {
      setBannerVisible(true);
      setAnalyticsEnabled(true); // default recommendation for toggle
    } else {
      setAnalyticsEnabled(existing.analytics);
    }

    // Listen for manual triggers from footer or privacy policy page
    const handleOpenModal = () => {
      const current = getCookieConsent();
      setAnalyticsEnabled(current?.analytics ?? true);
      setModalOpen(true);
    };

    window.addEventListener(OPEN_CONSENT_MODAL_EVENT, handleOpenModal);
    return () => window.removeEventListener(OPEN_CONSENT_MODAL_EVENT, handleOpenModal);
  }, []);

  if (!mounted) return null;

  const handleAcceptAll = () => {
    saveCookieConsent(true);
    setBannerVisible(false);
    setModalOpen(false);
  };

  const handleRefuseAll = () => {
    saveCookieConsent(false);
    setBannerVisible(false);
    setModalOpen(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(analyticsEnabled);
    setBannerVisible(false);
    setModalOpen(false);
  };

  return (
    <>
      {/* Floating IGN Cookie Consent Cartouche */}
      {bannerVisible && !modalOpen && (
        <aside
          role="region"
          aria-label="Consentement aux traceurs et cookies"
          className="fixed bottom-4 left-4 right-4 z-40 max-w-xl sm:left-auto sm:right-6 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="relative border border-ink bg-paper p-5 shadow-2xl dark:border-snow-3 dark:bg-night-2 sm:rounded-sm">
            {/* Cartouche Header */}
            <div className="flex items-center justify-between border-b border-line pb-2.5 dark:border-night-line">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-brand dark:text-brand-soft">⊞</span>
                <span className="font-narrow text-xs font-bold uppercase tracking-widest text-ink dark:text-snow">
                  Feuille de Blanmont · Respect de la vie privée
                </span>
              </div>
              <span className="font-narrow text-[10px] font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                RGPD · 1978
              </span>
            </div>

            {/* Body */}
            <p className="mt-3 text-xs leading-relaxed text-ink-2 dark:text-snow-2">
              Le Club utilise des cookies essentiels indispensables à votre connexion et à la
              sécurité du site. Avec votre accord, nous mesurons anonymement la consultation de
              nos parcours GPX et des sorties cyclistes (télémétrie avec masquage IP conforme
              RGPD, rétention 90 jours). Aucune donnée n&apos;est cédée à des tiers.
            </p>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="inline-flex min-h-[38px] items-center justify-center rounded-sm bg-brand px-3.5 py-1.5 font-narrow text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-vif focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Tout accepter
              </button>
              <button
                type="button"
                onClick={handleRefuseAll}
                className="inline-flex min-h-[38px] items-center justify-center rounded-sm border border-line bg-paper-2 px-3.5 py-1.5 font-narrow text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-paper dark:border-night-line dark:bg-night dark:text-snow dark:hover:bg-night-2"
              >
                Refuser
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex min-h-[38px] items-center gap-1.5 px-2 font-narrow text-xs font-bold uppercase tracking-wider text-ink-2 underline-offset-4 hover:text-brand hover:underline dark:text-snow-2 dark:hover:text-brand-soft"
              >
                <AdjustmentsHorizontalIcon className="size-4" aria-hidden="true" />
                Personnaliser
              </button>
            </div>

            {/* Footer link */}
            <div className="mt-3 border-t border-line/60 pt-2 text-[11px] text-ink-3 dark:border-night-line/60 dark:text-snow-3">
              <Link
                href="/confidentialite"
                className="underline underline-offset-2 hover:text-brand dark:hover:text-brand-soft"
              >
                Consulter notre politique de confidentialité
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* Granular Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg border border-line bg-paper p-6 shadow-2xl dark:border-night-line dark:bg-night sm:rounded-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-4 dark:border-night-line">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-sm bg-brand text-white">
                  <ShieldCheckIcon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="cookie-modal-title"
                    className="font-wide text-base font-extrabold uppercase tracking-tight text-ink dark:text-snow"
                  >
                    Paramètres des Cookies
                  </h2>
                  <p className="font-narrow text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Gestion granulaire · Durée de validité : 6 mois
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-sm p-1.5 text-ink-3 hover:bg-black/5 hover:text-ink dark:text-snow-3 dark:hover:bg-white/5 dark:hover:text-snow"
                aria-label="Fermer le panneau"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Granular sections */}
            <div className="space-y-4 py-5 text-xs text-ink-2 dark:text-snow-2">
              {/* Essential cookies */}
              <div className="border border-line bg-paper-2 p-3.5 dark:border-night-line dark:bg-night-2 sm:rounded-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-ink dark:text-snow">
                    <span>Témoins indispensables &amp; Sécurité</span>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-vert/30 bg-vert/10 px-2.5 py-0.5 font-narrow text-[10px] font-bold uppercase tracking-wider text-vert">
                    Toujours actif
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-3 dark:text-snow-3">
                  Nécessaires à l&apos;authentification de l&apos;espace membre, à la protection
                  CSRF, à la sécurité des requêtes et à la sauvegarde de votre choix de consentement.
                </p>
              </div>

              {/* Analytics cookies */}
              <div className="border border-line bg-paper-2 p-3.5 dark:border-night-line dark:bg-night-2 sm:rounded-sm">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="analytics-toggle"
                    className="cursor-pointer font-bold text-ink dark:text-snow"
                  >
                    Mesure d&apos;audience &amp; Téléchargements GPX
                  </label>
                  <input
                    id="analytics-toggle"
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="size-4 cursor-pointer accent-brand rounded-xs"
                  />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-3 dark:text-snow-3">
                  Permet de comptabiliser anonymement les consultations de parcours, les
                  téléchargements de traces GPX et l&apos;affluence des sorties du samedi.
                  L&apos;adresse IP est masquée dès l&apos;ingestion (conformité RGPD) et aucune
                  donnée n&apos;est partagée avec des régies publicitaires.
                </p>
              </div>

              {/* Notice */}
              <p className="border-l-2 border-ambre pl-2.5 font-mono text-[11px] text-ink-3 dark:text-snow-3">
                Votre choix est enregistré pour 6 mois. Vous pouvez le modifier à tout moment
                depuis le pied de page ou sur la page{' '}
                <Link
                  href="/confidentialite"
                  onClick={() => setModalOpen(false)}
                  className="underline hover:text-brand dark:hover:text-brand-soft"
                >
                  Confidentialité
                </Link>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-line pt-4 dark:border-night-line">
              <button
                type="button"
                onClick={handleRefuseAll}
                className="inline-flex min-h-[36px] items-center rounded-sm border border-line bg-transparent px-3 py-1 font-narrow text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-paper-2 dark:border-night-line dark:text-snow dark:hover:bg-night-2"
              >
                Tout refuser
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="inline-flex min-h-[36px] items-center rounded-sm border border-line bg-paper-2 px-3 py-1 font-narrow text-xs font-bold uppercase tracking-wider text-ink transition-colors hover:bg-paper dark:border-night-line dark:bg-night-2 dark:text-snow"
              >
                Tout accepter
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-sm bg-brand px-3.5 py-1 font-narrow text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-vif"
              >
                <CheckIcon className="size-4" aria-hidden="true" />
                Enregistrer mes choix
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
