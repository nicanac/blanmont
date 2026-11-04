'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ShoppingBagIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';
import { EquipmentOrder, EquipmentOrderStatus } from '@/app/types/equipment';
import { deleteOrderAction, updateOrderStatusAction } from '../actions';

const STATUS_LABELS: Record<EquipmentOrderStatus, string> = {
  pending: 'À traiter',
  confirmed: 'Confirmée',
  delivered: 'Remise',
  cancelled: 'Annulée',
};

const STATUS_STYLES: Record<EquipmentOrderStatus, string> = {
  pending: 'bg-ambre/15 text-ink dark:text-snow border-ambre',
  confirmed: 'bg-brand-tint text-brand-strong dark:text-brand-soft border-brand',
  delivered: 'bg-paper-2 text-ink dark:bg-night-2 dark:text-snow border-line dark:border-night-line',
  cancelled:
    'bg-paper-2 text-ink-3 dark:bg-night-2 dark:text-snow-3 border-line dark:border-night-line',
};

type Filter = EquipmentOrderStatus | 'all';

function formatEuro(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

export default function OrdersTable({
  initialOrders,
}: {
  initialOrders: EquipmentOrder[];
}): React.ReactElement {
  const [orders, setOrders] = useState<EquipmentOrder[]>(initialOrders);
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const openTotal = orders
    .filter((o) => o.status === 'pending' || o.status === 'confirmed')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const handleStatus = async (id: string, status: EquipmentOrderStatus): Promise<void> => {
    setBusyId(id);
    const res = await updateOrderStatusAction(id, status);
    setBusyId(null);
    if (!res.success) {
      toast.error(res.error || 'Mise à jour impossible');
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success('Statut mis à jour');
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

  const handleExport = (): void => {
    const esc = (v: string | number | undefined): string =>
      `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows: (string | number | undefined)[][] = [
      [
        'Date',
        'Nom',
        'Email',
        'Téléphone',
        'Article',
        'Taille',
        'Quantité',
        'Total',
        'Statut',
        'Remarques',
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
          o.notes,
        ])
      ),
    ];
    const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(
      new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'commandes-equipement.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        sheet="Feuille · Commandes"
        title="Commandes équipement"
        badge={{ icon: ShoppingBagIcon, label: `${pendingCount} à traiter` }}
        description={`${orders.length} commande${orders.length > 1 ? 's' : ''} · ${formatEuro(openTotal)} en attente de remise`}
        actions={[
          {
            label: 'Exporter CSV',
            onClick: handleExport,
            icon: ArrowDownTrayIcon,
            variant: 'secondary',
          },
        ]}
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
        {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as Filter[]).map((f) => (
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
          {visible.map((order) => (
            <li key={order.id} className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="min-w-0 space-y-1">
                <p className="font-bold text-ink dark:text-snow">
                  {order.memberName}{' '}
                  <span className="font-narrow text-xs font-semibold tabular-nums text-ink-3 dark:text-snow-3">
                    {new Date(order.createdAt).toLocaleDateString('fr-BE')}
                  </span>
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
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`status-${order.id}`}>
                  Statut de la commande de {order.memberName}
                </label>
                <select
                  id={`status-${order.id}`}
                  value={order.status}
                  disabled={busyId === order.id}
                  onChange={(e) => handleStatus(order.id, e.target.value as EquipmentOrderStatus)}
                  className={`min-h-[44px] rounded-md border px-3 text-sm font-semibold ${STATUS_STYLES[order.status]}`}
                >
                  {(Object.keys(STATUS_LABELS) as EquipmentOrderStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDelete(order)}
                  disabled={busyId === order.id}
                  aria-label={`Supprimer la commande de ${order.memberName}`}
                  className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md border border-line text-ink-3 hover:border-brand hover:text-brand dark:border-night-line"
                >
                  <TrashIcon className="size-5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
