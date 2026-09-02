'use client';

import React, { useState } from 'react';
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
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white font-semibold uppercase tracking-[0.06em] text-[0.8125rem] px-6 py-3 transition-colors shadow-md active:scale-98"
      >
        <CalendarDaysIcon className="h-4 w-4" />
        <span>S&apos;abonner au calendrier</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg rounded-lg bg-white p-6 sm:p-8 shadow-2xl border border-[#efece5] space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[#e03e3e]">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  Synchronisation automatique
                </div>
                <h3 className="text-xl font-bold text-[#101216]">
                  Ajouter les sorties à votre agenda
                </h3>
                <p className="text-xs text-[#3a3f4a]">
                  Synchronisez en continu le calendrier du club avec votre application d&apos;agenda préférée (mises à jour automatiques).
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-[#f2efe9] hover:text-[#3a3f4a] transition-colors"
                aria-label="Fermer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              {/* Apple Calendar / iOS / Mac */}
              <a
                href={webcalUrl}
                className="flex items-center justify-between p-3.5 rounded-md border border-[#e4e0d8] hover:border-red-300 hover:bg-red-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2efe9] group-hover:bg-slate-200 text-[#101216] group-hover:text-[#101216] font-bold text-lg transition-colors">
                    
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#101216] group-hover:text-[#e03e3e] transition-colors">
                      Apple Calendar (iPhone, iPad, Mac)
                    </div>
                    <div className="text-xs text-[#5c6370]">
                      Ouvre l&apos;application Calendrier en 1 clic
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-[#e03e3e] transition-colors" />
              </a>

              {/* Google Calendar */}
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-md border border-[#e4e0d8] hover:border-blue-300 hover:bg-blue-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold text-sm">
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
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </a>

              {/* Outlook */}
              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-md border border-[#e4e0d8] hover:border-sky-300 hover:bg-sky-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 font-bold text-sm">
                    O
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#101216] group-hover:text-sky-600 transition-colors">
                      Microsoft Outlook (Web & App)
                    </div>
                    <div className="text-xs text-[#5c6370]">
                      Abonnement via Outlook en ligne
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
              </a>
            </div>

            {/* Direct ICS Download & Feed URL copy */}
            <div className="pt-2 border-t border-[#efece5] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#3a3f4a]">
                  Lien direct du flux iCal (.ics)
                </span>
                <a
                  href="/api/calendar/subscribe.ics"
                  download="calendrier-cc-blanmont.ics"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#e03e3e] hover:underline"
                >
                  <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                  Télécharger le fichier .ics
                </a>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={httpsUrl}
                  className="flex-1 rounded-xl border border-[#e4e0d8] bg-[#f2efe9] px-3 py-2 text-xs text-[#3a3f4a] font-mono focus:outline-hidden"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
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
                onClick={() => setIsOpen(false)}
                className="rounded-full px-5 py-2 text-xs font-semibold text-[#3a3f4a] hover:bg-[#f2efe9] transition-colors"
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
