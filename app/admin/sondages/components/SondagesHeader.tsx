'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import SondagesTutorialModal from './SondagesTutorialModal';
import { useAdminTours } from '../../components/tours/adminTours';
import { triggerAutoCreateWeekendPollAction } from '@/app/actions';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';
import Spinner from '@/app/components/ui/Spinner';

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
      <AdminPageHeader
        id="sondages-header-section"
        title="Sondages du Weekend"
        badge={{ icon: ChatBubbleLeftRightIcon, label: 'Rituel Hebdomadaire' }}
        description={
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span>
              {sessionCount} session{sessionCount !== 1 ? 's' : ''} de vote enregistrée
              {sessionCount !== 1 ? 's' : ''}.
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-vert/10 border border-vert/30 px-2.5 py-0.5 text-xs font-semibold text-vert dark:text-vert-light font-mono"
              title="Le sondage est généré automatiquement chaque lundi matin via Vercel Cron"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-vert animate-pulse" />
              <span>Auto chaque lundi 8h</span>
            </span>
          </div>
        }
        onOpenTutorial={() => setModalOpen(true)}
        actions={[
          {
            id: 'sondages-new-btn',
            label: 'Nouveau Sondage',
            href: '/admin/sondages/new',
            icon: PlusIcon,
            variant: 'primary',
          },
        ]}
        rightExtra={
          <button
            id="sondages-auto-generate-btn"
            type="button"
            disabled={isPending}
            onClick={handleAutoGenerate}
            className="inline-flex items-center gap-2 rounded-md border border-brand/30 bg-brand/5 hover:bg-brand/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand transition-colors shrink-0 disabled:opacity-50 min-h-[44px] cursor-pointer"
            title="Déclencher manuellement la création automatique pour le weekend à venir"
          >
            {isPending ? <Spinner size="xs" variant="brand" /> : <SparklesIcon className="h-4 w-4" />}
            <span>{isPending ? 'Génération...' : 'Générer pour ce weekend'}</span>
          </button>
        }
      />

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
