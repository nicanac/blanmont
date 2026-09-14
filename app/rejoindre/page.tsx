import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import TrialRideForm from './TrialRideForm';

export const metadata: Metadata = {
  title: 'Rejoindre le Club · Sorties d\'essai gratuites | CC Saint-Martin Blanmont',
  description: 'Rejoignez le Cyclo Club Saint-Martin de Blanmont. Profitez de 3 sorties d\'essai gratuites et encadrées en Brabant wallon sans engagement.',
};

const FAQS = [
  {
    q: 'Faut-il être membre ou payer une cotisation dès la première sortie ?',
    a: 'Non, absolument pas ! Le club offre jusqu\'à 3 sorties d\'essai entièrement gratuites et sans engagement. Vous venez avec votre vélo, vous roulez dans le groupe de votre choix, et vous décidez ensuite en toute liberté si l\'ambiance vous plaît.',
  },
  {
    q: 'Quelle allure choisir si j\'hésite entre deux groupes ?',
    a: 'Pour votre première sortie, nous vous recommandons systématiquement de tester le groupe inférieur (par exemple le Groupe C plutôt que le B, ou le B plutôt que le A). Il est toujours plus agréable de terminer sa sortie avec de l\'énergie en réserve plutôt que de subir le rythme.',
  },
  {
    q: 'Les vélos à assistance électrique (VAE) sont-ils acceptés ?',
    a: 'Oui ! Les vélos de route électriques homologués (25 km/h) sont les bienvenus dans les Groupes B et C, ainsi que les VTT électriques dans le groupe VTT. La seule règle est le respect de l\'allure collective : on ne sprinte pas devant le groupe en côte avec le moteur !',
  },
  {
    q: 'Quel équipement matériel est indispensable dès la première sortie ?',
    a: 'Le port d\'un casque rigide homologué (norme EN 1078) est obligatoire pour tous. Votre vélo doit être en parfait état mécanique (freins vérifiés, transmission lubrifiée). Munissez-vous également de 2 chambres à air adaptées à vos roues, d\'une pompe ou cartouche CO2, et d\'un bidon d\'eau.',
  },
  {
    q: 'Comment fonctionne l\'assurance pendant les sorties d\'essai ?',
    a: 'Pendant vos sorties d\'essai, vous êtes couvert par votre responsabilité civile familiale / vie privée. Dès votre adhésion officielle au club, vous bénéficiez de l\'assurance omnium corporelle et matérielle de la Fédération Francophone Belge du Cyclotourisme (FFBC).',
  },
  {
    q: 'Dois-je acheter la tenue officielle Gobik du club immédiatement ?',
    a: 'Non. Pour les sorties d\'essai, vous roulez dans votre tenue habituelle. La commande des tenues officielles Gobik est proposée aux membres en début et en cours de saison lors des commandes groupées du club.',
  },
];

export default function RejoindrePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200">
      {/* ──── Cover Hero ──── */}
      <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
          <div className="space-y-4 max-w-3xl pb-8 border-b border-[#e4e0d8] dark:border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance text-[#101216] dark:text-white">
              Rejoindre le Peloton de <span className="text-[#e03e3e] italic">Blanmont</span>
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Venez rouler avec nous ! Profitez de <strong className="font-semibold text-[#101216] dark:text-white">3 sorties d&apos;essai gratuites et encadrées</strong> sans aucun engagement pour découvrir l&apos;ambiance du club et trouver votre peloton de niveau.
            </p>
          </div>

          {/* Stat Strip on Ink (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-6">
            {/* 3 Free Rides */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                <HeartIcon className="h-5 w-5 text-[#e03e3e]" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  3 sorties
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Essai libre &amp; gratuit
                </div>
              </div>
            </div>

            {/* Meeting Place */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                <MapPinIcon className="h-5 w-5 text-[#e03e3e]" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#101216] dark:text-white tracking-tight">
                  Place de Blanmont
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Samedi 8h15 (départ 8h30)
                </div>
              </div>
            </div>

            {/* 4 Groups */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                <UserGroupIcon className="h-5 w-5 text-[#101216] dark:text-white" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  4 allures
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Groupes A, B, C &amp; VTT
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Main Content Spread ──── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-16">
        {/* 4 Steps Timeline */}
        <div className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#101216] dark:text-white">
              Comment se déroule votre arrivée au club ?
            </h2>
            <p className="text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Une démarche simple et bienveillante en 4 étapes pour vous intégrer en toute sérénité.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[#e03e3e] tabular-nums">01</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]">
                  Choix de l&apos;allure
                </span>
              </div>
              <h3 className="text-base font-bold text-[#101216] dark:text-white">
                Choisissez votre groupe
              </h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Repérez le peloton correspondant à votre niveau : A (&gt;30 km/h), B (25–28 km/h), C (&lt;25 km/h) ou VTT. En cas d&apos;hésitation, optez toujours pour le groupe le plus modéré.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[#e03e3e] tabular-nums">02</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]">
                  Point de départ
                </span>
              </div>
              <h3 className="text-base font-bold text-[#101216] dark:text-white">
                Rendez-vous à 8h15
              </h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Rendez-vous un samedi matin sur la Place de Blanmont, 15 minutes avant le départ. Présentez-vous aux cyclistes présents : les membres du comité vous accueilleront chaleureusement.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[#e03e3e] tabular-nums">03</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]">
                  Parrainage
                </span>
              </div>
              <h3 className="text-base font-bold text-[#101216] dark:text-white">
                Encadrement capitaine
              </h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Un capitaine de route vous parraine pendant la sortie, vous explique les relais, les trajectoires et veille à ce que vous soyez toujours à l&apos;abri du vent dans les roues.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[#e03e3e] tabular-nums">04</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#5c6370] dark:text-[#a7adbb]">
                  Adhésion
                </span>
              </div>
              <h3 className="text-base font-bold text-[#101216] dark:text-white">
                Adhésion &amp; Assurance
              </h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                Après vos 3 sorties d&apos;essai concluantes, vous pouvez officialiser votre affiliation FFBC, commander la tenue Gobik du club et participer au challenge du Carré Vert.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Trial Ride Form Component */}
        <div id="formulaire-essai" className="space-y-6">
          <TrialRideForm />
        </div>

        {/* FAQ Accordion Section */}
        <div className="space-y-8 pt-8 border-t border-[#e4e0d8] dark:border-[#262b38]">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#101216] dark:text-white">
              Questions Fréquentes des Nouveaux Cyclos
            </h2>
            <p className="text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Tout ce que vous devez savoir avant de chausser vos pédales pour votre première sortie à Blanmont.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 space-y-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-[#e03e3e] shrink-0 mt-0.5" />
                  <h3 className="font-bold text-sm text-[#101216] dark:text-white leading-snug">
                    {faq.q}
                  </h3>
                </div>
                <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed pl-8">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-base font-bold text-[#101216] dark:text-white">
                Consultez également nos règles de sécurité
              </h3>
              <p className="text-xs text-[#5c6370] dark:text-[#a7adbb]">
                Code de la route belge (Art. 43bis), relais et signaux manuels pour rouler sereinement en peloton.
              </p>
            </div>
            <Link
              href="/securite"
              className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#101216] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1f242d] transition-colors shrink-0"
            >
              <span>Lire la Charte Sécurité</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
