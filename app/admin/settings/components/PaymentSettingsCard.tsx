'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/components/ui/Button';
import { buildEpcPayload, isValidIban } from '@/app/lib/payments/epc';
import { generateQrCodeSvg } from '@/app/lib/qrcode';
import { getPaymentSettingsAction } from '../payment-read-action';
import { savePaymentSettingsAction } from '../payment-actions';

// Valid OGM used only for the 1,00 EUR test QR.
const TEST_REFERENCE = '100000001246';

const FIELD =
  'min-h-[44px] w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-brand focus:outline-hidden dark:border-night-line dark:bg-night dark:text-white';
const LABEL = 'mb-1 block text-xs font-semibold text-ink-3 dark:text-snow-3';

/** "Paiements — compte du club": beneficiary, IBAN, BIC and a test QR to scan once with a banking app. */
export default function PaymentSettingsCard(): React.ReactElement {
  const [beneficiary, setBeneficiary] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [saving, setSaving] = useState(false);
  const [qr, setQr] = useState('');

  useEffect(() => {
    let cancelled = false;
    getPaymentSettingsAction()
      .then((s) => {
        if (cancelled || !s) return;
        setBeneficiary(s.beneficiary);
        setIban(s.iban);
        setBic(s.bic ?? '');
      })
      .catch(() => toast.error('Impossible de charger le compte du club.'));
    return () => {
      cancelled = true;
    };
  }, []);

  const ibanInvalid = iban.trim() !== '' && !isValidIban(iban);

  // The QR follows the form, so the treasurer can check before saving.
  const payload = useMemo(() => {
    if (!beneficiary.trim() || !isValidIban(iban)) return null;
    try {
      return buildEpcPayload({
        beneficiary: beneficiary.trim(),
        iban,
        bic: bic.trim() || undefined,
        amountEur: 1,
        reference: TEST_REFERENCE,
      });
    } catch {
      return null; // e.g. malformed BIC: the save action reports it
    }
  }, [beneficiary, iban, bic]);

  useEffect(() => {
    let cancelled = false;
    if (payload) {
      generateQrCodeSvg(payload, { errorCorrectionLevel: 'M', width: 160 })
        .then((svg) => !cancelled && setQr(svg))
        .catch(() => !cancelled && setQr(''));
    }
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const save = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    const res = await savePaymentSettingsAction({
      beneficiary: beneficiary.trim(),
      iban,
      ...(bic.trim() ? { bic: bic.trim() } : {}),
    });
    setSaving(false);
    if (res.success) toast.success('Compte du club enregistré.');
    else toast.error(res.error || "Impossible d'enregistrer.");
  };

  return (
    <section id="settings-payments-section" aria-labelledby="payments-title" className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
          <BanknotesIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="payments-title" className="text-lg font-bold uppercase tracking-tight text-ink dark:text-white">
            Paiements — compte du club
          </h2>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Compte affiché aux membres et encodé dans le QR code de paiement des maillots.
          </p>
        </div>
      </div>

      <div className="grid gap-6 rounded-xl border border-line bg-white p-6 dark:border-night-line dark:bg-night-2 md:grid-cols-[1fr_auto]">
        <form onSubmit={save} className="space-y-4">
          <div>
            <label htmlFor="pay-beneficiary" className={LABEL}>Bénéficiaire</label>
            <input id="pay-beneficiary" className={FIELD} value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} maxLength={70} required />
          </div>
          <div>
            <label htmlFor="pay-iban" className={LABEL}>IBAN</label>
            <input
              id="pay-iban"
              className={`${FIELD} tabular-nums`}
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              aria-invalid={ibanInvalid}
              aria-describedby="pay-iban-hint"
              autoComplete="off"
              required
            />
            <p id="pay-iban-hint" aria-live="polite" className="mt-1 min-h-4 text-xs font-semibold text-brand-strong">
              {ibanInvalid ? 'IBAN invalide : vérifiez les chiffres.' : ''}
            </p>
          </div>
          <div>
            <label htmlFor="pay-bic" className={LABEL}>BIC (optionnel)</label>
            <input id="pay-bic" className={FIELD} value={bic} onChange={(e) => setBic(e.target.value)} autoComplete="off" />
          </div>
          <Button type="submit" variant="admin-primary" isLoading={saving} disabled={ibanInvalid}>
            Enregistrer
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2 text-center md:w-48">
          {payload && qr ? (
            <div role="img" aria-label="QR code de test pour un paiement de 1,00 €" className="size-40" dangerouslySetInnerHTML={{ __html: qr }} />
          ) : (
            <div className="flex size-40 items-center justify-center rounded-md border border-dashed border-line p-3 text-xs text-ink-3 dark:border-night-line dark:text-snow-3">
              Le QR apparaît quand le compte est valide.
            </div>
          )}
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Test de 1,00 € : scannez-le une fois avec votre application bancaire pour vérifier le compte, sans valider le paiement.
          </p>
        </div>
      </div>
    </section>
  );
}
