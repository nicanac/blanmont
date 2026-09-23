import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { SheetHeader } from '../components/carte/SheetHeader';
import { RoadSwatch } from '../components/carte/RoadSwatch';
import type { CyclingGroup } from '../constants/cycling';

const GROUPS: Array<{
  id: CyclingGroup;
  title: string;
  character: string;
  paceLabel: string;
  pace: string;
  roadClass: string;
  description: string;
  captains: string;
  tag: string;
}> = [
  {
    id: 'A',
    title: 'Le groupe des A',
    character: 'Sportif & rythmé',
    paceLabel: 'Allure',
    pace: '> 30 km/h',
    roadClass: 'Route principale',
    description:
      'Groupe dynamique et sportif. Allure soutenue, sorties rythmées et participation fréquente aux randos et classiques extérieures. Traces GPS envoyées à l’avance via le groupe WhatsApp.',
    captains: 'Lucien & Laurent',
    tag: 'Traces GPS',
  },
  {
    id: 'B',
    title: 'Le groupe des B',
    character: 'Cœur du peloton',
    paceLabel: 'Allure',
    pace: '25 – 28 km/h',
    roadClass: 'Route secondaire',
    description:
      'Le cœur du peloton de Blanmont. Circuits équilibrés et variés évitant les grands axes, départs vent de face pour un retour fluide et groupé. Esprit d’équipe garanti.',
    captains: 'Dany, Philippe & René',
    tag: 'Circuits variés',
  },
  {
    id: 'C',
    title: 'Le groupe des C',
    character: 'Rando & progression',
    paceLabel: 'Allure',
    pace: '< 25 km/h',
    roadClass: 'Route locale',
    description:
      'Allure modérée idéale pour progresser, reprendre le vélo ou rouler sans pression de chrono. Tout le monde s’attend, avec l’objectif de franchir le cap des 100 km en cours de saison.',
    captains: 'Les 2 Joël & Michel',
    tag: 'Accessible à tous',
  },
  {
    id: 'VTT',
    title: 'Le groupe des VTT',
    character: 'Chemins & forêt',
    paceLabel: 'Terrain',
    pace: 'Sentiers & bois',
    roadClass: 'Chemin & sous-bois',
    description:
      'Exploration des chemins de terre, sous-bois et bosses de la région. Regroupement systématique au sommet des côtes et entraide technique sur les passages délicats.',
    captains: 'Nicolas, Pascal & Jean',
    tag: 'Chemins & nature',
  },
];

const PLATES = [
  { src: '/images/home-hero.jpg', alt: 'Peloton sur la route' },
  { src: '/images/IMG_8019.JPG', alt: 'Sortie VTT' },
  { src: '/images/IMG_5777.JPG', alt: 'Groupe de cyclistes' },
  { src: '/images/6efc2d5e-2326-446d-98d8-47889f881454.jpg', alt: 'Ambiance club' },
];

export default function LeClubPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-paper transition-colors duration-200 dark:bg-night">
      <SheetHeader
        sheet="Le club"
        focus={{ x: 47, y: 48 }}
        title="L’esprit du peloton"
        description="« On part ensemble, on rentre ensemble ». Un club cyclo convivial fondé sur le plaisir de rouler en groupe, le respect des allures et l’entraide sur les routes du Brabant wallon."
        legend={[
          { term: 'Quatre allures', value: 'Groupes A, B, C & VTT' },
          { term: 'Rendez-vous', value: 'Place de Blanmont', hint: 'Samedi 8h30 · Dimanche 9h00' },
          { term: 'Essai libre', value: 'Sans engagement' },
        ]}
        actions={
          <Link
            href="/rejoindre"
            className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-md bg-brand px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[inset_0_-2px_0_rgb(0_0_0/0.18)] transition-colors hover:bg-brand-strong"
          >
            Réserver une sortie d&apos;essai
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        }
      />

      <section
        aria-labelledby="legende-title"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="legende-title"
            className="text-balance font-wide text-[clamp(1.9rem,3.8vw,3.25rem)] font-extrabold uppercase leading-[0.95] text-ink lg:col-span-7 dark:text-snow"
          >
            Trouvez le peloton qui correspond à votre rythme
          </h2>
          <p className="max-w-[46ch] text-base leading-relaxed text-ink-2 lg:col-span-5 dark:text-snow-2">
            Chaque groupe est encadré par des capitaines de route expérimentés qui veillent à la
            sécurité, à l&apos;allure et à la bonne humeur générale.
          </p>
        </div>

        <ol className="mt-12 border-t-2 border-ink dark:border-snow-2">
          {GROUPS.map((g) => (
            <li
              key={g.id}
              className="grid gap-x-8 gap-y-4 border-b border-line py-8 md:grid-cols-[6rem_minmax(0,1fr)] lg:grid-cols-[7rem_minmax(0,1.1fr)_minmax(0,1fr)_13rem] dark:border-night-line"
            >
              <div className="flex items-center gap-4 md:block">
                <span className="font-wide text-5xl font-extrabold leading-none text-ink sm:text-6xl dark:text-snow">
                  {g.id}
                </span>
                <RoadSwatch group={g.id} className="w-16 md:mt-4 md:w-20" />
              </div>
              <div>
                <h3 className="font-semiwide text-xl font-extrabold uppercase leading-tight text-ink dark:text-snow">
                  {g.title}
                </h3>
                <p className="mt-1 font-narrow text-xs font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                  {g.character} ·{' '}
                  <span className="italic normal-case tracking-normal">{g.roadClass}</span>
                </p>
                <p className="mt-4 font-narrow text-3xl font-extrabold tabular-nums leading-none text-ink dark:text-snow">
                  <span className="sr-only">{g.paceLabel} : </span>
                  {g.pace}
                </p>
              </div>
              <p className="max-w-[52ch] text-sm leading-relaxed text-ink-2 md:col-start-2 lg:col-start-auto dark:text-snow-2">
                {g.description}
              </p>
              <dl className="grid grid-cols-2 gap-4 text-sm md:col-start-2 lg:col-start-auto lg:block lg:space-y-3">
                <div>
                  <dt className="font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                    Capitaines
                  </dt>
                  <dd className="font-semibold text-ink dark:text-snow">{g.captains}</dd>
                </div>
                <div>
                  <dt className="font-narrow text-[11px] font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                    Profil
                  </dt>
                  <dd className="font-semibold text-ink dark:text-snow">{g.tag}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="images-title"
        className="border-y border-line bg-white py-16 sm:py-20 dark:border-night-line dark:bg-night-2"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2
              id="images-title"
              className="font-wide text-[clamp(1.6rem,3vw,2.5rem)] font-extrabold uppercase leading-none text-ink dark:text-snow"
            >
              La vie du club en images
            </h2>
            <Link
              href="/galerie"
              className="inline-flex min-h-[44px] items-center gap-2 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink underline decoration-ink/30 underline-offset-[0.3em] hover:decoration-brand dark:text-snow dark:decoration-snow/30"
            >
              Toute la galerie
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
            {PLATES.map((plate, i) => (
              <figure
                key={plate.src}
                className={
                  i === 0
                    ? 'lg:col-span-6 lg:row-span-2'
                    : i === 1
                      ? 'lg:col-span-6'
                      : 'lg:col-span-3'
                }
              >
                <div
                  className={`relative overflow-hidden border border-ink bg-paper-2 dark:border-night-line-strong dark:bg-night-3 ${
                    i === 0
                      ? 'aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[28rem]'
                      : 'aspect-[4/3]'
                  }`}
                >
                  <Image
                    src={plate.src}
                    alt={plate.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-2 font-narrow text-xs font-semibold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                  Planche {i + 1} · <span className="normal-case tracking-normal">{plate.alt}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="neatline flex flex-col gap-8 bg-white p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between dark:bg-night-2">
          <div className="max-w-2xl">
            <h2 className="font-wide text-[clamp(1.7rem,3.2vw,2.6rem)] font-extrabold uppercase leading-[0.95] text-ink dark:text-snow">
              Prêt à rouler avec nous&nbsp;?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-2 dark:text-snow-2">
              Venez nous rejoindre un samedi ou un dimanche matin sur la Place de Blanmont. Vous
              pouvez tester 1 ou 2 sorties librement avant toute décision d&apos;adhésion.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <a
              href="mailto:info@blanmont.be?subject=Demande%20d'adh%C3%A9sion%20au%20Club%20de%20Blanmont&body=Bonjour,%0A%0AJe%20souhaite%20rejoindre%20le%20club%20ou%20faire%20une%20sortie%20d'essai.%0A%0ANom%20et%20pr%C3%A9nom%20:%0AT%C3%A9l%C3%A9phone%20:%0AGroupe%20souhait%C3%A9%20(A,%20B,%20C,%20VTT)%20:%0A%0AMerci%20!"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-md bg-brand px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-strong"
            >
              <EnvelopeIcon className="size-4" aria-hidden="true" />
              <span>Contacter le club</span>
            </a>
            <Link
              href="/calendrier"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-md border border-ink px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
            >
              <span>Voir le calendrier</span>
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
