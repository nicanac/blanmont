'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  ShoppingBagIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';
import Badge, { type BadgeVariant } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { formatPaymentReference } from '@/app/lib/payments/ogm';
import { EquipmentOrder, EquipmentOrderStatus } from '@/app/types/equipment';
import {
  cancelOrderAction,
  deleteOrderAction,
  markOrderDeliveredAction,
  markOrderPaidAction,
} from '../actions';
import { downloadCsv, formatDate, formatEuro, STATUS_LABELS } from './format';

const STATUS_VARIANTS: Record<EquipmentOrderStatus, BadgeVariant> = {
  pending: 'warning',
  paid: 'success',
  confirmed: 'brand',
  delivered: 'paper',
  cancelled: 'outline',
};

type Filter = EquipmentOrderStatus | 'all';

/** Allowed next statuses per status, computed on the server from canTransitionOrder. */
export type OrderTransitions = Record<EquipmentOrderStatus, EquipmentOrderStatus[]>;

const todayInBrussels = (): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Brussels' }).format(new Date());

export default function OrdersTable({
  initialOrders,
  transitions,
}: {
  initialOrders: EquipmentOrder[];
  transitions: OrderTransitions;
}): React.ReactElement {
  const [orders, setOrders] = useState<EquipmentOrder[]>(initialOrders);
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );
  const pending = orders.filter((o) => o.status === 'pending');
  const pendingTotal = pending.reduce((sum, o) => sum + o.totalPrice, 0);
  const filters: Filter[] = ['all', 'pending', 'paid', 'delivered', 'cancelled'];
  if (orders.some((o) => o.status === 'confirmed')) filters.splice(3, 0, 'confirmed');

  const run = async (
    order: EquipmentOrder,
    action: (id: string) => Promise<{ success: boolean; error?: string }>,
    patch: Partial<EquipmentOrder>,
    done: string
  ): Promise<void> => {
    setBusyId(order.id);
    const res = await action(order.id);
    setBusyId(null);
    if (!res.success) {
      toast.error(res.error || 'Mise à jour impossible');
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...patch } : o)));
    toast.success(done);
  };

  const handlePaid = (o: EquipmentOrder): Promise<void> =>
    run(o, markOrderPaidAction, { status: 'paid', paidAt: todayInBrussels() }, 'Commande marquée payée');

  const handleDelivered = (o: EquipmentOrder): Promise<void> =>
    run(o, markOrderDeliveredAction, { status: 'delivered', deliveredAt: new Date().toISOString() }, 'Commande remise');

  const handleCancel = async (o: EquipmentOrder): Promise<void> => {
    const refund =
      o.status === 'paid' || o.status === 'confirmed'
        ? ' Cette commande est déjà payée : remboursement à faire hors application.'
        : '';
    if (!window.confirm(`Annuler la commande de ${o.memberName} ?${refund}`)) return;
    await run(o, cancelOrderAction, { status: 'cancelled', cancelledAt: new Date().toISOString() }, 'Commande annulée');
  };

  const handleDelete = async (order: EquipmentOrder): Promise<void> => {
    if (!window.confirm(`Supprimer définitivement la commande de ${order.memberName} ?`)) return;
    setBusyId(order.id);
    const res = await deleteOrderAction(order.id);
    setBusyId(null);
    if (!res.success) {
      toast.error(res.error || 'Suppression impossible');
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    toast.success('Commande supprimée');
  };

  const handleExport = (): void =>
    downloadCsv('commandes-equipement.csv', [
      [
        'Date', 'Nom', 'Email', 'Téléphone', 'Article', 'Taille', 'Quantité', 'Total',
        'Statut', 'Référence', 'Payé le', 'Remis le', 'Remarques',
      ],
      ...orders.flatMap((o) =>
        o.items.map((it) => [
          o.createdAt.slice(0, 10),
          o.memberName,
          o.memberEmail,
          o.memberPhone,
          it.equipmentName,
          it.size,
          it.quantity,
          o.totalPrice,
          STATUS_LABELS[o.status],
          o.paymentReference ? formatPaymentReference(o.paymentReference) : '',
          o.paidAt,
          o.deliveredAt?.slice(0, 10),
          o.notes,
        ])
      ),
    ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        sheet="Feuille · Commandes"
        title="Commandes équipement"
        badge={{ icon: ShoppingBagIcon, label: `${pending.length} à payer` }}
        description={`${orders.length} commande${orders.length > 1 ? 's' : ''} · ${formatEuro(pendingTotal)} en attente de paiement`}
        actions={[
          { label: 'Commandes groupées', href: '/admin/commandes/campagnes', icon: UserGroupIcon, variant: 'secondary' },
          { label: 'Banque', href: '/admin/commandes/banque', icon: BuildingLibraryIcon, variant: 'secondary' },
          { label: 'Exporter CSV', onClick: handleExport, icon: ArrowDownTrayIcon, variant: 'secondary' },
        ]}
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`min-h-[44px] cursor-pointer rounded-md border px-4 font-narrow text-xs font-bold uppercase tracking-[0.08em] transition-colors ${
              filter === f
                ? 'border-ink bg-ink text-white dark:border-snow dark:bg-snow dark:text-night'
                : 'border-line bg-white text-ink-2 hover:border-ink/40 dark:border-night-line dark:bg-night-2 dark:text-snow-2'
            }`}
          >
            {f === 'all' ? 'Toutes' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-line p-8 text-center text-sm text-ink-3 dark:border-night-line dark:text-snow-3">
          Aucune commande{filter === 'all' ? ' pour le moment' : ' dans ce statut'}.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white dark:divide-night-line dark:border-night-line dark:bg-night-2">
          {visible.map((order) => {
            const next = transitions[order.status] ?? [];
            const busy = busyId === order.id;
            return (
              <li key={order.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div className="min-w-0 space-y-1">
                  <p className="flex flex-wrap items-center gap-2 font-bold text-ink dark:text-snow">
                    {order.memberName}
                    <Badge variant={STATUS_VARIANTS[order.status]} size="sm">
                      {STATUS_LABELS[order.status]}
                    </Badge>
                    {order.source && (
                      <Badge variant="paper" size="sm">
                        {order.source === 'campaign' ? 'Commande groupée' : 'Stock'}
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-ink-2 dark:text-snow-2">
                    <a className="underline underline-offset-2" href={`mailto:${order.memberEmail}`}>
                      {order.memberEmail}
                    </a>
                    {order.memberPhone ? ` · ${order.memberPhone}` : ''}
                  </p>
                  {order.items.map((it, i) => (
                    <p key={i} className="text-sm text-ink dark:text-snow">
                      {it.quantity} × {it.equipmentName} · taille {it.size} ·{' '}
                      <span className="tabular-nums">{formatEuro(it.unitPrice * it.quantity)}</span>
                    </p>
                  ))}
                  {order.notes && (
                    <p className="text-xs text-ink-3 dark:text-snow-3">Remarque : {order.notes}</p>
                  )}
                  <p className="text-sm font-bold tabular-nums text-ink dark:text-snow">
                    Total {formatEuro(order.totalPrice)}
                    {order.paymentReference && (
                      <span className="ml-2 font-narrow text-xs font-semibold text-ink-3 dark:text-snow-3">
                        {formatPaymentReference(order.paymentReference)}
                      </span>
                    )}
                  </p>
                  <p className="text-xs tabular-nums text-ink-3 dark:text-snow-3">
                    Commandé {formatDate(order.createdAt)}
                    {order.paidAt && ` · Payé ${formatDate(order.paidAt)}`}
                    {order.deliveredAt && ` · Remis ${formatDate(order.deliveredAt)}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {next.includes('paid') && (
                    <Button size="sm" variant="admin-primary" disabled={busy} onClick={() => handlePaid(order)}>
                      Marquer payé
                    </Button>
                  )}
                  {next.includes('delivered') && (
                    <Button size="sm" variant="admin-secondary" disabled={busy} onClick={() => handleDelivered(order)}>
                      Remis
                    </Button>
                  )}
                  {next.includes('cancelled') && (
                    <Button size="sm" variant="admin-danger" disabled={busy} onClick={() => handleCancel(order)}>
                      Annuler
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(order)}
                    disabled={busy}
                    aria-label={`Supprimer la commande de ${order.memberName}`}
                    className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-line text-ink-3 hover:border-brand hover:text-brand dark:border-night-line"
                  >
                    <TrashIcon className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
