'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import MaillotsPageHeader from '../../components/MaillotsPageHeader';
import { Button } from '@/app/components/ui/Button';
import type { SizeMatrix } from '@/app/lib/firebase/equipment-campaigns';
import { formatPaymentReference } from '@/app/lib/payments/ogm';
import type { CampaignStatus, EquipmentCampaign, EquipmentOrder } from '@/app/types/equipment';
import { downloadCsv, formatDate, formatEuro } from '../../components/format';
import { markCampaignOrderDeliveredAction, transitionCampaignAction } from '../actions';
import { CAMPAIGN_STATUS_LABELS } from './campaign-labels';

const STEPS: CampaignStatus[] = ['open', 'closed', 'ordered', 'received'];

const NEXT_LABELS: Record<'closed' | 'ordered' | 'received', string> = {
  closed: 'Clôturer la commande',
  ordered: 'Marquer commandée chez Gobik',
  received: 'Marquer reçue',
};

export default function CampaignDetail({
  campaign,
  matrix,
  toHandOver,
  gobikReferences,
}: {
  campaign: EquipmentCampaign;
  matrix: SizeMatrix;
  toHandOver: EquipmentOrder[];
  /** equipmentId -> Gobik reference (falls back to the product name) */
  gobikReferences: Record<string, string>;
}): React.ReactElement {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const current = STEPS.indexOf(campaign.status);
  const next = STEPS[current + 1] as 'closed' | 'ordered' | 'received' | undefined;
  const stepDates: Record<CampaignStatus, string | undefined> = {
    open: campaign.createdAt,
    closed: current >= 1 ? campaign.closesAt : undefined,
    ordered: campaign.supplierOrderedAt,
    received: campaign.receivedAt,
  };
  const totals = matrix.lines.reduce(
    (t, l) => ({ members: t.members + l.members, extra: t.extra + l.extra, total: t.total + l.total }),
    { members: 0, extra: 0, total: 0 }
  );

  const act = async (key: string, call: () => Promise<{ success: boolean; error?: string }>, done: string): Promise<void> => {
    setBusy(key);
    const res = await call();
    setBusy(null);
    if (!res.success) {
      toast.error(res.error || 'Action impossible');
      return;
    }
    toast.success(done);
    router.refresh();
  };

  const advance = async (): Promise<void> => {
    if (!next) return;
    if (
      next === 'received' &&
      !window.confirm('Marquer la commande comme reçue ? Les unités supplémentaires seront ajoutées au stock du club.')
    )
      return;
    await act('step', () => transitionCampaignAction(campaign.id, next), `Statut : ${CAMPAIGN_STATUS_LABELS[next]}`);
  };

  const exportCsv = (): void =>
    downloadCsv(
      `commande-gobik-${campaign.id}.csv`,
      [
        ['Article', 'Référence Gobik', 'Taille', 'Quantité'],
        ...matrix.lines
          .filter((l) => l.total > 0)
          .map((l) => [l.equipmentName, gobikReferences[l.equipmentId] ?? '', l.size, l.total]),
      ]
    );

  return (
    <div className="space-y-6">
      <MaillotsPageHeader
        initialTab="order"
        sheet="Feuille · Commande groupée"
        title={campaign.title}
        badge={{ icon: UserGroupIcon, label: CAMPAIGN_STATUS_LABELS[campaign.status] }}
        description={`Clôture le ${formatDate(campaign.closesAt)}`}
        actions={[{ label: 'Toutes les commandes groupées', href: '/admin/commandes/campagnes', variant: 'secondary' }]}
      />

      <section aria-labelledby="stepper-title" className="space-y-4 rounded-md border border-line bg-white p-5 dark:border-night-line dark:bg-night-2">
        <h2 id="stepper-title" className="sr-only">Avancement</h2>
        <ol className="grid gap-4 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step}
              aria-current={i === current ? 'step' : undefined}
              className={`border-t-2 pt-2 ${i <= current ? 'border-brand' : 'border-line dark:border-night-line'}`}
            >
              <span className={`block font-narrow text-xs font-bold uppercase tracking-[0.08em] ${i <= current ? 'text-ink dark:text-snow' : 'text-ink-3 dark:text-snow-3'}`}>
                {CAMPAIGN_STATUS_LABELS[step]}
              </span>
              <span className="block min-h-4 text-xs tabular-nums text-ink-3 dark:text-snow-3">
                {i <= current ? formatDate(stepDates[step]) : ''}
              </span>
            </li>
          ))}
        </ol>
        {next && (
          <Button variant="admin-primary" isLoading={busy === 'step'} onClick={advance}>
            {NEXT_LABELS[next]}
          </Button>
        )}
      </section>

      {matrix.unpaidOrders.length > 0 && (
        <section role="status" className="space-y-2 rounded-md border border-ambre bg-ambre/15 p-4 text-sm text-ink dark:text-snow">
          <h2 className="flex items-center gap-2 font-bold">
            <ExclamationTriangleIcon className="size-5" aria-hidden="true" />
            {matrix.unpaidOrders.length} commande{matrix.unpaidOrders.length > 1 ? 's' : ''} non payée{matrix.unpaidOrders.length > 1 ? 's' : ''} (non incluse{matrix.unpaidOrders.length > 1 ? 's' : ''} ci-dessous)
          </h2>
          <ul className="space-y-1">
            {matrix.unpaidOrders.map((o) => (
              <li key={o.id} className="tabular-nums">
                {o.memberName} · {formatEuro(o.totalPrice)}
                {o.paymentReference && ` · ${formatPaymentReference(o.paymentReference)}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="matrix-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="matrix-title" className="font-semiwide text-lg font-bold uppercase text-ink dark:text-snow">
            À commander chez Gobik
          </h2>
          <Button variant="admin-secondary" size="sm" leftIcon={ArrowDownTrayIcon} onClick={exportCsv} disabled={matrix.lines.length === 0}>
            Exporter CSV
          </Button>
        </div>
        {matrix.lines.length === 0 ? (
          <p className="rounded-md border border-dashed border-line p-6 text-center text-sm text-ink-3 dark:border-night-line dark:text-snow-3">
            Aucune commande payée pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-line bg-white dark:border-night-line dark:bg-night-2">
            <table className="w-full text-sm">
              <thead className="font-narrow text-xs uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                <tr className="border-b border-line dark:border-night-line">
                  <th scope="col" className="p-3 text-left">Article</th>
                  <th scope="col" className="p-3 text-left">Taille</th>
                  <th scope="col" className="p-3 text-right">Membres</th>
                  <th scope="col" className="p-3 text-right">Stock club</th>
                  <th scope="col" className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="tabular-nums text-ink dark:text-snow">
                {matrix.lines.map((l) => (
                  <tr key={`${l.equipmentId}-${l.size}`} className="border-b border-line last:border-0 dark:border-night-line">
                    <th scope="row" className="p-3 text-left font-semibold">{l.equipmentName}</th>
                    <td className="p-3">{l.size}</td>
                    <td className="p-3 text-right">{l.members}</td>
                    <td className="p-3 text-right">{l.extra}</td>
                    <td className="p-3 text-right font-bold">{l.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-ink font-bold tabular-nums text-ink dark:border-snow dark:text-snow">
                <tr>
                  <th scope="row" colSpan={2} className="p-3 text-left">Total</th>
                  <td className="p-3 text-right">{totals.members}</td>
                  <td className="p-3 text-right">{totals.extra}</td>
                  <td className="p-3 text-right">{totals.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {campaign.status === 'received' && (
        <section aria-labelledby="handover-title" className="space-y-3">
          <h2 id="handover-title" className="font-semiwide text-lg font-bold uppercase text-ink dark:text-snow">
            Remise aux membres
          </h2>
          {toHandOver.length === 0 ? (
            <p className="text-sm text-ink-3 dark:text-snow-3">Aucune commande payée à remettre.</p>
          ) : (
            <ul className="divide-y divide-line rounded-md border border-line bg-white dark:divide-night-line dark:border-night-line dark:bg-night-2">
              {toHandOver.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <span className="min-w-0 text-sm text-ink dark:text-snow">
                    <span className="block font-bold">{o.memberName}</span>
                    {o.items.map((it) => `${it.quantity} × ${it.equipmentName} (${it.size})`).join(', ')}
                  </span>
                  {o.status === 'delivered' ? (
                    <span className="text-xs font-semibold tabular-nums text-vert-strong dark:text-vert-vif">
                      Remis le {formatDate(o.deliveredAt)}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="admin-secondary"
                      isLoading={busy === o.id}
                      aria-label={`Marquer la commande de ${o.memberName} comme remise`}
                      onClick={() => act(o.id, () => markCampaignOrderDeliveredAction(o.id), 'Commande remise')}
                    >
                      Remis
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
