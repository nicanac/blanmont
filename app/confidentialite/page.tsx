import React from 'react';
import type { Metadata } from 'next';
import SheetHeader, { SheetLegendRow } from '@/app/components/carte/SheetHeader';
import OpenCookiePreferencesButton from '@/app/components/consent/OpenCookiePreferencesButton';
import {
  ShieldCheckIcon,
  CircleStackIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité & Cookies | Cyclo Club Saint-Martin Blanmont',
  description:
    'Protection des données personnelles, conformité RGPD, gestion des cookies et anonymisation télémétrique au Cyclo Club Saint-Martin Blanmont.',
};

const legendFacts: SheetLegendRow[] = [
  { term: 'Cadre Légal', value: 'RGPD / GDPR', hint: 'Règlement UE 2016/679' },
  { term: 'Rétention Télémétrie', value: '90 Jours', hint: 'Purge automatique' },
  { term: 'Validité Consentement', value: '6 Mois', hint: '180 jours max' },
  { term: 'Cession Commerciale', value: '0 %', hint: 'Aucune revente' },
];

export default function ConfidentialitePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-paper pb-20 dark:bg-night">
      {/* IGN Sheet Header */}
      <SheetHeader
        sheet="Feuille RGPD-1978 · Blanmont"
        title="Politique de Confidentialité"
        description="Engagements de protection de la vie privée, gestion des traceurs et traçabilité cartographique selon les normes IGN & RGPD."
        legend={legendFacts}
        tone="paper"
        actions={<OpenCookiePreferencesButton />}
      />

      {/* Main Content Sections */}
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Section 1: Introduction */}
          <section className="border border-line bg-paper-2 p-6 dark:border-night-line dark:bg-night-2 sm:rounded-sm">
            <div className="flex items-center gap-3 border-b border-line pb-3 dark:border-night-line">
              <ShieldCheckIcon className="size-6 text-brand dark:text-brand-soft" />
              <h2 className="font-wide text-base font-extrabold uppercase tracking-tight text-ink dark:text-snow">
                1. Responsable de Traitement &amp; Engagements
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-2 dark:text-snow-2">
              Le <strong>Cyclo Club Saint-Martin Blanmont</strong> (association sportive cycliste
              fondée en 1978 à Blanmont, Brabant wallon, Belgique) accorde la plus haute importance à
              la protection des données de ses membres et des visiteurs de son site officiel.
              Cette politique expose en toute transparence la manière dont nous traitons vos
              informations lorsque vous naviguez sur notre plateforme ou adhérez à nos sorties.
            </p>
          </section>

          {/* Section 2: Data categories */}
          <section className="border border-line bg-white p-6 dark:border-night-line dark:bg-night-2/70 sm:rounded-sm">
            <div className="flex items-center gap-3 border-b border-line pb-3 dark:border-night-line">
              <CircleStackIcon className="size-6 text-hydro" />
              <h2 className="font-wide text-base font-extrabold uppercase tracking-tight text-ink dark:text-snow">
                2. Données Collectées &amp; Finalités
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="border border-line/70 bg-paper p-4.5 dark:border-night-line/70 dark:bg-night sm:rounded-sm">
                <h3 className="font-narrow text-xs font-bold uppercase tracking-wider text-ink dark:text-snow">
                  A. Visiteurs Publics (Consultation &amp; GPX)
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-2 dark:text-snow-2">
                  <li>
                    <strong>Masquage IP strict :</strong> L&apos;adresse IP de connexion est
                    immédiatement tronquée et anonymisée dès l&apos;ingestion (ex.{' '}
                    <code className="font-mono text-[11px]">192.168.xxx.xxx</code>). Aucune adresse
                    IP complète n&apos;est persistée.
                  </li>
                  <li>
                    <strong>Identifiant de session éphémère :</strong> Généré aléatoirement
                    uniquement avec votre consentement (<code className="font-mono text-[11px]">anon_...</code>),
                    permettant de mesurer le succès d&apos;un parcours ou les téléchargements GPX.
                  </li>
                  <li>
                    <strong>Conditionné au consentement :</strong> Aucune télémétrie ne s&apos;exécute
                    sans votre accord préalable.
                  </li>
                </ul>
              </div>

              <div className="border border-line/70 bg-paper p-4.5 dark:border-night-line/70 dark:bg-night sm:rounded-sm">
                <h3 className="font-narrow text-xs font-bold uppercase tracking-wider text-ink dark:text-snow">
                  B. Membres Authentifiés (Espace Membre)
                </h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-2 dark:text-snow-2">
                  <li>
                    <strong>Identification du profil :</strong> Nom, prénom, adresse email et photo
                    de profil servant à la gestion des pelotons et du classement Carré Vert.
                  </li>
                  <li>
                    <strong>Vie du club :</strong> Votes pour les départs du samedi, réponses aux
                    sondages et avis de sorties cyclistes.
                  </li>
                  <li>
                    <strong>Sécurité :</strong> Mots de passe hashés avec des algorithmes modernes
                    irréversibles et cookies de session sécurisés (HTTP-Only).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Cookies Table */}
          <section className="border border-line bg-paper-2 p-6 dark:border-night-line dark:bg-night-2 sm:rounded-sm">
            <div className="flex items-center gap-3 border-b border-line pb-3 dark:border-night-line">
              <ClockIcon className="size-6 text-ambre" />
              <h2 className="font-wide text-base font-extrabold uppercase tracking-tight text-ink dark:text-snow">
                3. Tableau des Témoins de Connexion (Cookies)
              </h2>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-2 dark:text-snow-2">
              Nous n&apos;utilisons aucun cookie de ciblage publicitaire ni aucun traceur provenant
              de régies commerciales. Le tableau ci-dessous répertorie les témoins susceptibles d&apos;être
              déposés sur votre terminal :
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse border border-line text-left font-sans text-xs dark:border-night-line">
                <thead>
                  <tr className="bg-paper border-b border-line font-narrow uppercase tracking-wider text-ink dark:bg-night dark:border-night-line dark:text-snow">
                    <th className="p-3">Nom du témoin</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Finalité</th>
                    <th className="p-3">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line dark:divide-night-line">
                  <tr className="bg-white/70 dark:bg-night-2/40">
                    <td className="p-3 font-mono font-bold text-ink dark:text-snow">
                      ccb_cookie_consent
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-vert/10 px-2 py-0.5 font-narrow text-[10px] font-bold text-vert border border-vert/20 uppercase">
                        Essentiel
                      </span>
                    </td>
                    <td className="p-3 text-ink-2 dark:text-snow-2">
                      Mémorise vos préférences de consentement aux cookies.
                    </td>
                    <td className="p-3 tabular-nums text-ink-3 dark:text-snow-3">6 mois</td>
                  </tr>
                  <tr className="bg-white/70 dark:bg-night-2/40">
                    <td className="p-3 font-mono font-bold text-ink dark:text-snow">
                      ccb_session / session
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-vert/10 px-2 py-0.5 font-narrow text-[10px] font-bold text-vert border border-vert/20 uppercase">
                        Essentiel
                      </span>
                    </td>
                    <td className="p-3 text-ink-2 dark:text-snow-2">
                      Permet l&apos;authentification et la persistance de session membre.
                    </td>
                    <td className="p-3 text-ink-3 dark:text-snow-3">Session (30 jours)</td>
                  </tr>
                  <tr className="bg-white/70 dark:bg-night-2/40">
                    <td className="p-3 font-mono font-bold text-ink dark:text-snow">
                      ccb_visitor_id
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-ambre/10 px-2 py-0.5 font-narrow text-[10px] font-bold text-ambre border border-ambre/20 uppercase">
                        Analytique (Optionnel)
                      </span>
                    </td>
                    <td className="p-3 text-ink-2 dark:text-snow-2">
                      Mesure anonymisée de l&apos;audience des parcours et téléchargements GPX. Bloqué
                      et purgé immédiatement en cas de refus.
                    </td>
                    <td className="p-3 tabular-nums text-ink-3 dark:text-snow-3">30 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Rights & Action */}
          <section className="border border-line bg-white p-6 dark:border-night-line dark:bg-night-2/70 sm:rounded-sm">
            <div className="flex items-center gap-3 border-b border-line pb-3 dark:border-night-line">
              <UserGroupIcon className="size-6 text-vert" />
              <h2 className="font-wide text-base font-extrabold uppercase tracking-tight text-ink dark:text-snow">
                4. Vos Droits &amp; Gestion de Vos Préférences
              </h2>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-2 dark:text-snow-2">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
              des droits d&apos;accès, de rectification, de limitation et d&apos;effacement de vos données
              personnelles. Pour toute demande relative à vos données, vous pouvez contacter le
              comité du club.
            </p>

            <div className="mt-6 flex flex-col items-start gap-4 border border-line bg-paper p-5 dark:border-night-line dark:bg-night sm:flex-row sm:items-center sm:justify-between sm:rounded-sm">
              <div className="space-y-1">
                <p className="font-narrow text-xs font-bold uppercase tracking-wider text-ink dark:text-snow">
                  Préférences Actuelles de Traceurs
                </p>
                <p className="text-xs text-ink-3 dark:text-snow-3">
                  Vous pouvez révoquer ou accorder votre consentement analytique à tout instant.
                </p>
              </div>

              <OpenCookiePreferencesButton />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
