import React from 'react';
import Badge, { type BadgeVariant } from '@/app/components/ui/Badge';
import PaymentCard from '@/app/components/payments/PaymentCard';
import { formatDate, formatEuro } from '@/app/components/payments/format';
import type { EquipmentCampaign, EquipmentOrder, EquipmentOrderStatus } from '@/app/types/equipment';
import { buildTimeline } from './timeline';

const STATUS: Record<EquipmentOrderStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'À payer', variant: 'warning' },
  paid: { label: 'Payée', variant: 'success' },
  confirmed: { label: 'Confirmée', variant: 'brand' },
  delivered: { label: 'Remise', variant: 'neutral' },
  cancelled: { label: 'Annulée', variant: 'paper' },
};

interface OrderCardProps {
  order: EquipmentOrder;
  campaign?: EquipmentCampaign | null;
  /** EPC QR text, null when the club account is not configured. */
  epcPayload: string | null;
  iban?: string;
  beneficiary?: string;
}

export default function OrderCard({ order, campaign, epcPayload, iban, beneficiary }: OrderCardProps): React.ReactElement {
  const status = STATUS[order.status];
  const timeline = buildTimeline(order, campaign);

  return (
    <li className="space-y-4 rounded-lg border border-line bg-white p-6 dark:border-night-line dark:bg-ink">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {order.items.map((item, i) => (
            <p key={i} className="text-sm text-ink dark:text-snow">
              {item.quantity} × {item.equipmentName} · taille {item.size}
            </p>
          ))}
          {order.source === 'campaign' && campaign && (
            <p className="text-xs text-ink-3 dark:text-snow-3">Commande groupée « {campaign.title} »</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold tabular-nums text-ink dark:text-white">{formatEuro(order.totalPrice)}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </div>

      <ol className="grid gap-2 border-t border-line pt-4 dark:border-night-line sm:grid-cols-2 lg:grid-cols-3">
        {timeline.map((step) => (
          <li key={step.label} className="text-sm">
            <span className="block font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
              {step.label}
            </span>
            {step.date ? (
              <span className="tabular-nums text-ink dark:text-snow">{formatDate(step.date)}</span>
            ) : (
              <span className="text-ink-3 dark:text-snow-3">En attente</span>
            )}
          </li>
        ))}
      </ol>

      {order.status === 'pending' && order.paymentReference && (
        <details className="group border-t border-line pt-4 dark:border-night-line">
          <summary className="inline-flex min-h-[44px] cursor-pointer items-center rounded-md bg-brand px-4 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white hover:bg-brand-strong">
            Payer
          </summary>
          <div className="mt-4">
            <PaymentCard
              reference={order.paymentReference}
              amountEur={order.totalPrice}
              epcPayload={epcPayload}
              iban={iban}
              beneficiary={beneficiary}
            />
          </div>
        </details>
      )}
    </li>
  );
}
