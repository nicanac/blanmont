'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/Button';
import { INPUT_CLASS, LABEL_CLASS } from '../../components/format';
import { createCampaignAction } from '../actions';

export interface CampaignFormEquipment {
  id: string;
  name: string;
  sizes: string[];
}

export default function CampaignForm({
  equipment,
}: {
  equipment: CampaignFormEquipment[];
}): React.ReactElement {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [closesAt, setClosesAt] = useState('');
  // equipmentId -> size -> units kept as typed (strings), parsed on submit
  const [extra, setExtra] = useState<Record<string, Record<string, string>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: string): void =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!closesAt) {
      setError('Indiquez la date de clôture');
      return;
    }
    const extraStock: Record<string, Record<string, number>> = {};
    for (const id of selected) {
      for (const [size, raw] of Object.entries(extra[id] ?? {})) {
        const qty = parseInt(raw, 10);
        if (qty > 0) (extraStock[id] ??= {})[size] = qty;
      }
    }
    setBusy(true);
    const res = await createCampaignAction({
      title,
      equipmentIds: selected,
      closesAt: new Date(closesAt).toISOString(),
      ...(Object.keys(extraStock).length ? { extraStock } : {}),
    });
    setBusy(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    toast.success('Commande groupée créée');
    router.push(`/admin/commandes/campagnes/${res.campaignId}`);
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-md border border-line bg-white p-5 dark:border-night-line dark:bg-night-2"
    >
      <h2 className="font-semiwide text-lg font-bold uppercase text-ink dark:text-snow">
        Nouvelle commande groupée
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="campaign-title" className={LABEL_CLASS}>Titre</label>
          <input
            id="campaign-title"
            className={INPUT_CLASS}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Commande groupée printemps 2027"
            required
          />
        </div>
        <div>
          <label htmlFor="campaign-closes" className={LABEL_CLASS}>Date de clôture</label>
          <input
            id="campaign-closes"
            type="datetime-local"
            className={INPUT_CLASS}
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            required
          />
        </div>
      </div>

      <fieldset>
        <legend className={LABEL_CLASS}>Articles de la commande</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {equipment.map((item) => (
            <label
              key={item.id}
              className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-line px-3 text-sm text-ink dark:border-night-line dark:text-snow"
            >
              <input
                type="checkbox"
                className="size-4 accent-brand"
                checked={selected.includes(item.id)}
                onChange={() => toggle(item.id)}
              />
              {item.name}
            </label>
          ))}
        </div>
      </fieldset>

      {selected.length > 0 && (
        <details className="rounded-md border border-line p-3 dark:border-night-line">
          <summary className="min-h-[44px] cursor-pointer py-3 text-sm font-semibold text-ink dark:text-snow">
            Unités supplémentaires pour le stock du club (optionnel)
          </summary>
          <div className="space-y-4 pt-2">
            {equipment
              .filter((item) => selected.includes(item.id))
              .map((item) => (
                <fieldset key={item.id}>
                  <legend className="mb-2 text-sm font-bold text-ink dark:text-snow">{item.name}</legend>
                  <div className="flex flex-wrap gap-3">
                    {item.sizes.map((size) => (
                      <div key={size} className="w-20">
                        <label htmlFor={`extra-${item.id}-${size}`} className={LABEL_CLASS}>
                          {size}
                        </label>
                        <input
                          id={`extra-${item.id}-${size}`}
                          type="number"
                          min={0}
                          max={999}
                          inputMode="numeric"
                          className={`${INPUT_CLASS} tabular-nums`}
                          value={extra[item.id]?.[size] ?? ''}
                          onChange={(e) =>
                            setExtra((prev) => ({
                              ...prev,
                              [item.id]: { ...prev[item.id], [size]: e.target.value },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
          </div>
        </details>
      )}

      <p role="alert" className="min-h-5 text-sm font-semibold text-brand-strong">
        {error}
      </p>
      <Button type="submit" variant="admin-primary" isLoading={busy}>
        Créer la commande groupée
      </Button>
    </form>
  );
}
