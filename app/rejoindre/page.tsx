import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import TrialRideForm from './TrialRideForm';
import { SheetHeader } from '../components/carte/SheetHeader';

export const metadata: Metadata = {
  title: "Rejoindre le Club · Sorties d'essai gratuites | CC Saint-Martin Blanmont",
  description:
    "Rejoignez le Cyclo Club Saint-Martin de Blanmont. Profitez de 3 sorties d'essai gratuites et encadrées en Brabant wallon sans engagement.",
};

const FAQS = [
  {
    q: 'Faut-il être membre ou payer une cotisation dès la première sortie ?',
    a: "Non, absolument pas ! Le club offre jusqu'à 3 sorties d'essai entièrement gratuites et sans engagement. Vous venez avec votre vélo, vous roulez dans le groupe de votre choix, et vous décidez ensuite en toute liberté si l'ambiance vous plaît.",
  },
  {
    q: "Quelle allure choisir si j'hésite entre deux groupes ?",
    a: "Pour votre première sortie, nous vous recommandons systématiquement de tester le groupe inférieur (par exemple le Groupe C plutôt que le B, ou le B plutôt que le A). Il est toujours plus agréable de terminer sa sortie avec de l'énergie en réserve plutôt que de subir le rythme.",
  },
  {
    q: 'Les vélos à assistance électrique (VAE) sont-ils acceptés ?',
    a: "Oui ! Les vélos de route électriques homologués (25 km/h) sont les bienvenus dans les Groupes B et C, ainsi que les VTT électriques dans le groupe VTT. La seule règle est le respect de l'allure collective : on ne sprinte pas devant le groupe en côte avec le moteur !",
  },
  {
    q: 'Quel équipement matériel est indispensable dès la première sortie ?',
    a: "Le port d'un casque rigide homologué (norme EN 1078) est obligatoire pour tous. Votre vélo doit être en parfait état mécanique (freins vérifiés, transmission lubrifiée). Munissez-vous également de 2 chambres à air adaptées à vos roues, d'une pompe ou cartouche CO2, et d'un bidon d'eau.",
  },
  {
    q: "Comment fonctionne l'assurance pendant les sorties d'essai ?",
    a: "Pendant vos sorties d'essai, vous êtes couvert par votre responsabilité civile familiale / vie privée. Dès votre adhésion officielle au club, vous bénéficiez de l'assurance omnium corporelle et matérielle de la Fédération Francophone Belge du Cyclotourisme (FFBC).",
  },
  {
    q: 'Dois-je acheter la tenue officielle Gobik du club immédiatement ?',
    a: "Non. Pour les sorties d'essai, vous roulez dans votre tenue habituelle. La commande des tenues officielles Gobik est proposée aux membres en début et en cours de saison lors des commandes groupées du club.",
  },
];

const STEPS = [
  {
    title: 'Choisissez votre groupe',
    text: 'Repérez le peloton correspondant à votre niveau : A (> 30 km/h), B (25–28 km/h), C (< 25 km/h) ou VTT. En cas d’hésitation, optez toujours pour le groupe le plus modéré.',
  },
  {
    title: 'Rendez-vous à 8h15',
    text: 'Rendez-vous un samedi matin sur la Place de Blanmont, 15 minutes avant le départ. Présentez-vous aux cyclistes présents : les membres du comité vous accueilleront chaleureusement.',
  },
  {
    title: 'Encadrement capitaine',
    text: 'Un capitaine de route vous parraine pendant la sortie, vous explique les relais, les trajectoires et veille à ce que vous soyez toujours à l’abri du vent dans les roues.',
  },
  {
    title: 'Adhésion & assurance',
    text: 'Après vos 3 sorties d’essai concluantes, vous pouvez officialiser votre affiliation FFBC, commander la tenue Gobik du club et participer au challenge du Carré Vert.',
  },
];

export default function RejoindrePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper text-ink transition-colors duration-200 dark:bg-night dark:text-snow">
      <SheetHeader
        sheet="Rejoindre le club"
        focus={{ x: 52, y: 47 }}
        size="lg"
        title="Rejoindre le peloton de Blanmont"
        description={
          <>
            Venez rouler avec nous ! Profitez de{' '}
            <strong className="font-semibold text-ink dark:text-snow">
              3 sorties d&apos;essai gratuites et encadrées
            </strong>{' '}
            sans aucun engagement pour découvrir l&apos;ambiance du club et trouver votre peloton de
            niveau.
          </>
        }
        legend={[
          { term: 'Essai libre & gratuit', value: '3 sorties' },
          { term: 'Rendez-vous', value: 'Place de Blanmont', hint: 'Samedi 8h15 (départ 8h30)' },
          { term: 'Quatre allures', value: 'Groupes A, B, C & VTT' },
        ]}
        actions={
          <a
            href="#formulaire-essai"
            className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-md bg-brand px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-colors hover:bg-brand-strong"
          >
            Réserver ma sortie d&apos;essai
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        }
      />

      <section
        aria-labelledby="arrivee-title"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="arrivee-title"
            className="text-balance font-wide text-[clamp(1.8rem,3.6vw,3rem)] font-extrabold uppercase leading-[0.95] text-ink lg:col-span-7 dark:text-snow"
          >
            Comment se déroule votre arrivée au club&nbsp;?
          </h2>
          <p className="max-w-[46ch] text-base leading-relaxed text-ink-2 lg:col-span-5 dark:text-snow-2">
            Une démarche simple et bienveillante en 4 étapes pour vous intégrer en toute sérénité.
          </p>
        </div>

        <div className="relative mt-12">
          <span
            aria-hidden="true"
            className="absolute left-[15px] top-4 block h-[calc(100%-2rem)] border-l-2 border-dashed border-ink/60 sm:hidden lg:left-4 lg:right-4 lg:top-[15px] lg:block lg:h-0 lg:border-l-0 lg:border-t-2 dark:border-snow-3"
          />
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative pl-12 lg:pl-0 lg:pt-14">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border-2 border-ink bg-paper font-narrow text-sm font-extrabold tabular-nums text-ink dark:border-snow-2 dark:bg-night dark:text-snow"
                >
                  {i + 1}
                </span>
                <h3 className="font-semiwide text-lg font-extrabold uppercase leading-tight text-ink dark:text-snow">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-ink-2 dark:text-snow-2">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="formulaire-essai"
        className="scroll-mt-24 border-y border-line bg-white py-16 sm:py-20 dark:border-night-line dark:bg-night-2"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TrialRideForm />
        </div>
      </section>

      <section
        aria-labelledby="faq-title"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2
              id="faq-title"
              className="text-balance font-wide text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold uppercase leading-[0.95] text-ink dark:text-snow"
            >
              Questions fréquentes des nouveaux cyclos
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-2 dark:text-snow-2">
              Tout ce que vous devez savoir avant de chausser vos pédales pour votre première sortie
              à Blanmont.
            </p>
          </div>

          <div className="border-t-2 border-ink lg:col-span-8 dark:border-snow-2">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group border-b border-line dark:border-night-line">
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-base font-bold text-ink marker:hidden dark:text-snow [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <PlusIcon
                    className="size-5 shrink-0 text-brand transition-transform duration-300 ease-(--ease-plot) group-open:rotate-45 dark:text-brand-soft"
                    aria-hidden="true"
                  />
                </summary>
                <p className="max-w-[68ch] pb-5 text-sm leading-relaxed text-ink-2 dark:text-snow-2">
                  {faq.a}
                </p>
              </details>
            ))}

            <div className="mt-10 flex flex-col items-start justify-between gap-5 border border-ink p-6 sm:flex-row sm:items-center dark:border-snow-3">
              <div>
                <h3 className="text-base font-bold text-ink dark:text-snow">
                  Consultez également nos règles de sécurité
                </h3>
                <p className="mt-1 text-sm text-ink-2 dark:text-snow-2">
                  Code de la route belge (Art. 43bis), relais et signaux manuels pour rouler
                  sereinement en peloton.
                </p>
              </div>
              <Link
                href="/securite"
                className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-md border border-ink px-5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
              >
                Lire la charte sécurité
                <ArrowRightIcon className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
