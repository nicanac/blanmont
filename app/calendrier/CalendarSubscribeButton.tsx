'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

export default function CalendarSubscribeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle Escape key and lock background scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const getFeedUrls = () => {
    if (typeof window === 'undefined') {
      return {
        httpsUrl: 'https://blanmont.be/api/calendar/subscribe.ics',
        webcalUrl: 'webcal://blanmont.be/api/calendar/subscribe.ics',
      };
    }
    const host = window.location.host;
    const protocol = window.location.protocol;
    const httpsUrl = `${protocol}//${host}/api/calendar/subscribe.ics`;
    const webcalUrl = `webcal://${host}/api/calendar/subscribe.ics`;
    return { httpsUrl, webcalUrl };
  };

  const { httpsUrl, webcalUrl } = getFeedUrls();

  const googleCalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=Club+de+Blanmont`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white font-semibold uppercase tracking-[0.06em] text-[0.8125rem] px-6 py-3 transition-colors shadow-md active:scale-98"
      >
        <CalendarDaysIcon className="h-4 w-4" />
        <span>S&apos;abonner au calendrier</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="subscribe-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div
            className="relative w-full max-w-lg rounded-lg bg-white p-6 sm:p-8 shadow-2xl border border-[#e4e0d8] space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 id="subscribe-modal-title" className="text-xl font-bold text-[#101216]">
                  Ajouter les sorties à votre agenda
                </h3>
                <p className="text-xs text-[#5c6370] leading-relaxed">
                  Synchronisez en continu le calendrier officiel du club avec votre application d&apos;agenda préférée (mises à jour automatiques).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md p-2 text-[#5c6370] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors shrink-0"
                aria-label="Fermer la fenêtre d'abonnement"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              {/* Apple Calendar / iOS / Mac */}
              <a
                href={webcalUrl}
                className="min-h-[44px] flex items-center justify-between p-3.5 rounded-md border border-[#e4e0d8] hover:border-[#e03e3e]/40 hover:bg-[#faf8f5] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#101216] text-white shrink-0">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.77-7.97-12.23-14.67-6.04-8.99-10.83-19.16-14.38-30.51-3.54-11.35-5.32-22.18-5.32-32.48 0-14.7 3.79-26.68 11.37-35.94 7.58-9.27 17-13.98 28.25-14.15 4.6 0 10.02 1.34 16.27 4.02 6.24 2.68 10.07 4.07 11.47 4.19 1.12-.12 5.09-1.57 11.9-4.35 6.81-2.79 12.19-4.04 16.14-3.77 12.06.84 21.72 5.68 28.98 14.53-10.5 6.35-15.64 15.22-15.42 26.61.22 8.99 3.69 16.59 10.4 22.8 6.7 6.21 14.69 9.87 23.97 10.98-2.12 6.36-4.75 12.63-7.89 18.82zm-28.76-107.9c0-6.84 2.51-13.43 7.54-19.78 5.03-6.34 11.43-10.23 19.2-11.66.78 6.72-.94 13.04-5.16 18.96-4.22 5.92-10.15 9.87-17.78 11.85-.9-1.12-1.8-2.61-3.8-9.37z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#101216] group-hover:text-[#e03e3e] transition-colors">
                      Calendrier Apple (iPhone, iPad, Mac)
                    </div>
                    <div className="text-xs text-[#5c6370]">
                      Ouvre l&apos;application Calendrier en 1 clic
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#5c6370] group-hover:text-[#e03e3e] transition-colors" />
              </a>

              {/* Google Calendar */}
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] flex items-center justify-between p-3.5 rounded-md border border-[#e4e0d8] hover:border-[#3b82f6]/40 hover:bg-[#faf8f5] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 border border-blue-200 text-blue-600 font-extrabold text-sm shrink-0">
                    G
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#101216] group-hover:text-blue-600 transition-colors">
                      Google Agenda (Android, Web)
                    </div>
                    <div className="text-xs text-[#5c6370]">
                      Ajout direct via Google Calendar Web
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#5c6370] group-hover:text-blue-600 transition-colors" />
              </a>

              {/* Outlook */}
              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] flex items-center justify-between p-3.5 rounded-md border border-[#e4e0d8] hover:border-sky-300 hover:bg-[#faf8f5] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 border border-sky-200 text-sky-600 font-extrabold text-sm shrink-0">
                    O
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#101216] group-hover:text-sky-600 transition-colors">
                      Microsoft Outlook (Web &amp; App)
                    </div>
                    <div className="text-xs text-[#5c6370]">
                      Abonnement via Outlook en ligne
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#5c6370] group-hover:text-sky-600 transition-colors" />
              </a>
            </div>

            {/* Direct ICS Download & Feed URL copy */}
            <div className="pt-3 border-t border-[#e4e0d8] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#101216]">
                  Lien direct du flux iCal (.ics)
                </span>
                <a
                  href="/api/calendar/subscribe.ics"
                  download="calendrier-cc-blanmont.ics"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  <span>Télécharger .ics</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={httpsUrl}
                  aria-label="URL du flux calendrier iCal"
                  className="flex-1 rounded-md border border-[#e4e0d8] bg-[#f2efe9] px-3 py-2.5 text-xs text-[#3a3f4a] font-mono focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-md bg-[#101216] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#161922] transition-colors shrink-0"
                >
                  {copied ? (
                    <>
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-400" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="h-4 w-4" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer close */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] bg-white px-6 py-2.5 text-xs font-semibold text-[#101216] hover:bg-[#f2efe9] hover:border-[#101216]/30 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
