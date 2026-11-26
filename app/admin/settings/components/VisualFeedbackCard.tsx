'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import type { FeedbackAudience, VisualFeedbackSettings } from '@/app/lib/feedback/settings';

interface AdminFeedbackResponse {
  settings: VisualFeedbackSettings;
  githubConfigured: boolean;
  repo: string;
  killed: boolean;
}

const AUDIENCES: { value: FeedbackAudience; label: string; hint: string }[] = [
  { value: 'admins', label: 'Administrateurs', hint: 'Phase de test : vous seul·e voyez le bouton.' },
  { value: 'members', label: 'Membres connectés', hint: 'Tout membre avec un compte.' },
  { value: 'everyone', label: 'Tout le monde', hint: 'Visiteurs anonymes inclus.' },
];

/** Admin switch for the in-app visual feedback tool (screenshot + annotation -> GitHub issue). */
export default function VisualFeedbackCard(): React.ReactElement {
  const [data, setData] = useState<AdminFeedbackResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/feedback-settings', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: AdminFeedbackResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (patch: Partial<Pick<VisualFeedbackSettings, 'enabled' | 'audience'>>) => {
    if (!data) return;
    const next = { enabled: data.settings.enabled, audience: data.settings.audience, ...patch };
    setSaving(true);
    try {
      const res = await fetch('/api/admin/feedback-settings', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { settings: VisualFeedbackSettings };
      setData({ ...data, settings: json.settings });
      toast.success(json.settings.enabled ? 'Retours activés.' : 'Retours désactivés.');
    } catch {
      toast.error("Impossible d'enregistrer le réglage.");
    } finally {
      setSaving(false);
    }
  };

  const enabled = data?.settings.enabled ?? false;

  return (
    <section id="settings-feedback-section" className="space-y-6 pt-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand border border-brand/20">
          <ChatBubbleBottomCenterTextIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink dark:text-white uppercase tracking-tight">
            Retours &amp; captures d’écran
          </h2>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Un bouton « Donner un avis » permet de capturer la page, l’annoter et créer une issue GitHub.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs space-y-6">
        {loadError && (
          <p role="alert" className="text-sm font-semibold text-brand">
            Impossible de charger le réglage.
          </p>
        )}

        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-sm font-bold text-ink dark:text-white">Activer les retours visuels</span>
            <span className="block text-xs text-ink-3 dark:text-snow-3">
              Désactivé : aucun code de retour n’est chargé chez les utilisateurs.
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            aria-label="Activer les retours visuels"
            checked={enabled}
            disabled={!data || saving || data.killed}
            onChange={(e) => save({ enabled: e.target.checked })}
            className="h-5 w-10 shrink-0 cursor-pointer accent-brand"
          />
        </label>

        <fieldset disabled={!data || saving} className="space-y-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-ink-3">Qui voit le bouton ?</legend>
          {AUDIENCES.map((a) => (
            <label key={a.value} className="flex items-start gap-2 text-sm text-ink dark:text-snow">
              <input
                type="radio"
                name="feedback-audience"
                value={a.value}
                checked={data?.settings.audience === a.value}
                onChange={() => save({ audience: a.value })}
                className="mt-1 accent-brand"
              />
              <span>
                <span className="font-semibold">{a.label}</span>
                <span className="block text-xs text-ink-3 dark:text-snow-3">{a.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <p className="text-xs text-ink-3 dark:text-snow-3">
          Les retours reçus sont lisibles par les administrateurs et les responsables du club (pas par les simples membres) :{' '}
          <a href="/admin/retours" className="font-semibold text-brand underline-offset-4 hover:underline">
            ouvrir les retours
          </a>
          .
        </p>

        {data && (
          <div className="space-y-1 border-t border-line dark:border-night-line pt-4 text-xs text-ink-3 dark:text-snow-3">
            <p>
              Dépôt cible : <span className="font-mono font-bold text-ink dark:text-white">{data.repo}</span>
            </p>
            {!data.githubConfigured && (
              <p role="alert" className="font-semibold text-brand">
                GITHUB_FEEDBACK_TOKEN est absent côté serveur : les envois échoueront tant qu’il n’est pas défini.
              </p>
            )}
            {data.killed && (
              <p role="alert" className="font-semibold text-brand">
                NEXT_PUBLIC_FEEDBACK_ENABLED=false : l’outil est coupé globalement.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
