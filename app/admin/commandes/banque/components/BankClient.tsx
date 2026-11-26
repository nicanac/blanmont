'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Badge from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { formatPaymentReference } from '@/app/lib/payments/ogm';
import type { BankTransaction, BankTransactionReason } from '@/app/types/equipment';
import { formatCents, formatDate, formatEuro, INPUT_CLASS, LABEL_CLASS } from '../../components/format';
import { assignTransactionAction, ignoreTransactionAction, importCodaAction } from '../actions';

const REASON_LABELS: Record<BankTransactionReason, string> = {
  'no-reference': 'Sans référence',
  'unknown-reference': 'Référence inconnue',
  'not-pending': 'Déjà payée ou annulée',
  'amount-mismatch': 'Montant différent',
};

export interface PendingOrderOption {
  id: string;
  memberName: string;
  paymentReference?: string;
  totalPrice: number;
}

interface Summary {
  total: number;
  duplicates: number;
  matched: number;
  unmatched: number;
}

export default function BankClient({
  unmatched,
  matched,
  pendingOrders,
}: {
  unmatched: BankTransaction[];
  matched: (BankTransaction & { memberName?: string })[];
  pendingOrders: PendingOrderOption[];
}): React.ReactElement {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [busyTx, setBusyTx] = useState<string | null>(null);

  const upload = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const form = e.currentTarget;
    setSummary(null);
    setImportError('');
    setImporting(true);
    const res = await importCodaAction(new FormData(form));
    setImporting(false);
    if (!res.success) {
      setImportError(res.error);
      return;
    }
    setSummary(res.summary);
    form.reset();
    router.refresh();
  };

  const resolve = async (
    tx: BankTransaction,
    call: () => Promise<{ success: boolean; error?: string }>,
    done: string
  ): Promise<void> => {
    setBusyTx(tx.id);
    const res = await call();
    setBusyTx(null);
    if (!res.success) {
      toast.error(res.error || 'Action impossible');
      return;
    }
    toast.success(done);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={upload}
        className="space-y-4 rounded-md border border-line bg-white p-5 dark:border-night-line dark:bg-night-2"
      >
        <h2 className="font-semiwide text-lg font-bold uppercase text-ink dark:text-snow">Importer un extrait CODA</h2>
        <div>
          <label htmlFor="coda-file" className={LABEL_CLASS}>Fichier CODA (.cod, .coda, .txt, 2 Mo maximum)</label>
          <input id="coda-file" name="file" type="file" accept=".cod,.coda,.txt" required className={INPUT_CLASS} />
        </div>
        <Button type="submit" variant="admin-primary" isLoading={importing}>
          Importer
        </Button>
        <div aria-live="polite" className="text-sm text-ink dark:text-snow">
          {importError && <p className="font-semibold text-brand-strong">{importError}</p>}
          {summary && (
            <p className="tabular-nums">
              {summary.total} mouvement{summary.total > 1 ? 's' : ''} lu{summary.total > 1 ? 's' : ''} · {summary.duplicates} doublon{summary.duplicates > 1 ? 's' : ''} ignoré{summary.duplicates > 1 ? 's' : ''} ·{' '}
              {summary.matched} rapprochée{summary.matched > 1 ? 's' : ''} · {summary.unmatched} à traiter
            </p>
          )}
        </div>
      </form>

      <section aria-labelledby="unmatched-title" className="space-y-3">
        <h2 id="unmatched-title" className="font-semiwide text-lg font-bold uppercase text-ink dark:text-snow">
          Paiements à traiter
        </h2>
        {unmatched.length === 0 ? (
          <p className="rounded-md border border-dashed border-line p-6 text-center text-sm text-ink-3 dark:border-night-line dark:text-snow-3">
            Aucun paiement en attente de rapprochement.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-md border border-line bg-white dark:divide-night-line dark:border-night-line dark:bg-night-2">
            {unmatched.map((tx) => {
              const busy = busyTx === tx.id;
              const selectId = `assign-${tx.id}`;
              return (
                <li key={tx.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-start">
                  <div className="min-w-0 space-y-1 text-sm text-ink dark:text-snow">
                    <p className="flex flex-wrap items-center gap-2 font-bold tabular-nums">
                      {formatCents(tx.amountCents)}
                      <span className="font-normal text-ink-3 dark:text-snow-3">{formatDate(tx.valueDate)}</span>
                      {tx.reason && (
                        <Badge variant="warning" size="sm">{REASON_LABELS[tx.reason]}</Badge>
                      )}
                    </p>
                    <p>
                      {tx.counterpartyName}
                      <span className="tabular-nums text-ink-3 dark:text-snow-3"> · ****{tx.counterpartyIbanLast4}</span>
                    </p>
                    {tx.communication && <p className="text-xs text-ink-3 dark:text-snow-3">{tx.communication}</p>}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <div>
                      <label htmlFor={selectId} className="sr-only">
                        Commande à associer au paiement de {tx.counterpartyName}
                      </label>
                      <select
                        id={selectId}
                        className={`${INPUT_CLASS} lg:w-72`}
                        value={choice[tx.id] ?? ''}
                        onChange={(e) => setChoice((prev) => ({ ...prev, [tx.id]: e.target.value }))}
                      >
                        <option value="">Choisir une commande…</option>
                        {pendingOrders.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.memberName}
                            {o.paymentReference ? ` · ${formatPaymentReference(o.paymentReference)}` : ''} · {formatEuro(o.totalPrice)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      size="sm"
                      variant="admin-primary"
                      disabled={busy || !choice[tx.id]}
                      onClick={() => resolve(tx, () => assignTransactionAction(tx.id, choice[tx.id]), 'Paiement associé')}
                    >
                      Associer à une commande
                    </Button>
                    <Button
                      size="sm"
                      variant="admin-secondary"
                      disabled={busy}
                      onClick={() => resolve(tx, () => ignoreTransactionAction(tx.id), 'Paiement ignoré')}
                    >
                      Ignorer
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <details className="rounded-md border border-line bg-white dark:border-night-line dark:bg-night-2">
        <summary className="min-h-[44px] cursor-pointer p-4 text-sm font-bold text-ink dark:text-snow">
          Derniers paiements rapprochés ({matched.length})
        </summary>
        <ul className="divide-y divide-line border-t border-line text-sm text-ink dark:divide-night-line dark:border-night-line dark:text-snow">
          {matched.map((tx) => (
            <li key={tx.id} className="flex flex-wrap justify-between gap-2 p-4 tabular-nums">
              <span>
                {formatDate(tx.valueDate)} · {tx.counterpartyName}
                {tx.memberName ? ` → ${tx.memberName}` : ''}
              </span>
              <span className="font-bold">{formatCents(tx.amountCents)}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
