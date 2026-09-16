'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  AcademicCapIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import SondagesTutorialModal from './SondagesTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';
import { triggerAutoCreateWeekendPollAction } from '@/app/actions';

interface SondagesHeaderProps {
  sessionCount: number;
}

export default function SondagesHeader({
  sessionCount,
}: SondagesHeaderProps): React.ReactElement {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { startSondagesTour } = useAdminTours();

  const handleAutoGenerate = (): void => {
    startTransition(async () => {
      try {
        const res = await triggerAutoCreateWeekendPollAction();
        if (res.created) {
          toast.success(res.message);
          router.refresh();
        } else if (res.alreadyExisted) {
          toast.info(res.message);
        } else {
          toast.error(res.message);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erreur : ${msg}`);
      }
    });
  };

  return (
    <>
      <div id="sondages-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
              Sondages du Weekend
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#101216] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
              <span>Rituel Hebdomadaire</span>
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800"
              title="Le sondage est généré automatiquement chaque lundi matin via Vercel Cron"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Auto chaque lundi 8h</span>
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {sessionCount} session{sessionCount !== 1 ? 's' : ''} de vote enregistrée{sessionCount !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs min-h-[44px]"
            title="Ouvrir le guide des sondages du weekend"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          <button
            id="sondages-auto-generate-btn"
            type="button"
            disabled={isPending}
            onClick={handleAutoGenerate}
            className="inline-flex items-center gap-2 rounded-md border border-[#e03e3e]/30 bg-[#e03e3e]/5 hover:bg-[#e03e3e]/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#e03e3e] transition-colors shadow-xs shrink-0 disabled:opacity-50 min-h-[44px]"
            title="Déclencher manuellement la création automatique pour le weekend à venir"
          >
            {isPending ? (
              <div className="h-4 w-4 rounded-full border-2 border-[#e03e3e] border-t-transparent animate-spin" />
            ) : (
              <SparklesIcon className="h-4 w-4" />
            )}
            <span>{isPending ? 'Génération...' : 'Générer pour ce weekend'}</span>
          </button>

          <Link
            id="sondages-new-btn"
            href="/admin/sondages/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs shrink-0 min-h-[44px]"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouveau Sondage</span>
          </Link>
        </div>
      </div>

      <SondagesTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startSondagesTour();
          }, 200);
        }}
      />
    </>
  );
}
