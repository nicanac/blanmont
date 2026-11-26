'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardDocumentCheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { generateQrCodeSvg } from '@/app/lib/qrcode';
import { formatPaymentReference } from '@/app/lib/payments/ogm';
import { formatEuro } from './format';

interface PaymentCardProps {
  /** 12-digit structured communication, unformatted. */
  reference: string;
  amountEur: number;
  /** EPC QR text, or null while the club account is not configured. */
  epcPayload: string | null;
  iban?: string;
  beneficiary?: string;
}

/** IBAN in groups of four: BE68 5390 0754 7034. */
function groupIban(iban: string): string {
  return iban.replace(/\s/g, '').replace(/(.{4})(?=.)/g, '$1 ');
}

function CopyRow({ label, value, copyValue }: { label: string; value: string; copyValue: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      toast.success(`${label} copié`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Copie impossible, sélectionnez le texte.');
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line dark:border-night-line pt-3">
      <div className="min-w-0">
        <div className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
          {label}
        </div>
        <div className="break-all font-mono text-sm font-semibold tabular-nums text-ink dark:text-snow">{value}</div>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copier ${label.toLowerCase()}`}
        className="inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-line text-ink-3 hover:border-brand hover:text-brand dark:border-night-line dark:text-snow-3"
      >
        {copied ? (
          <ClipboardDocumentCheckIcon className="h-5 w-5 text-brand" aria-hidden="true" />
        ) : (
          <ClipboardDocumentIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default function PaymentCard({ reference, amountEur, epcPayload, iban, beneficiary }: PaymentCardProps): React.ReactElement {
  const [qrSvg, setQrSvg] = useState('');

  useEffect(() => {
    if (!epcPayload) return;
    let active = true;
    generateQrCodeSvg(epcPayload, { errorCorrectionLevel: 'M' })
      .then((svg) => active && setQrSvg(svg))
      .catch((err) => console.error('QR de paiement impossible', err));
    return () => {
      active = false;
    };
  }, [epcPayload]);

  const formattedReference = formatPaymentReference(reference);

  return (
    <section
      aria-label="Paiement"
      className="space-y-4 rounded-lg border border-line bg-white p-6 dark:border-night-line dark:bg-ink"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink dark:text-white">
          Payer cette commande
        </h3>
        <span className="text-2xl font-extrabold tabular-nums tracking-tight text-brand">{formatEuro(amountEur)}</span>
      </div>

      {epcPayload ? (
        <>
          <div
            role="img"
            aria-label="QR code de paiement SEPA"
            className="mx-auto size-48 rounded-sm border border-line bg-white p-1 [&>svg]:size-full"
            // generateQrCodeSvg output is produced by our own lib from server-built text.
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="text-sm text-ink-2 dark:text-snow-2">
            Scannez avec l&apos;app de votre banque : la communication structurée est déjà remplie. Le paiement est
            reconnu automatiquement.
          </p>
        </>
      ) : (
        <p className="rounded-md border border-line bg-paper-2 p-3 text-sm text-ink dark:border-night-line dark:bg-night-2 dark:text-snow">
          Coordonnées bancaires du club bientôt disponibles — gardez cette référence.
        </p>
      )}

      <CopyRow label="Communication structurée" value={formattedReference} copyValue={formattedReference} />
      {epcPayload && iban && (
        <CopyRow
          label="IBAN"
          value={`${groupIban(iban)}${beneficiary ? ` · ${beneficiary}` : ''}`}
          copyValue={iban.replace(/\s/g, '')}
        />
      )}
    </section>
  );
}
