import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/app/lib/auth/session';
import { isFeedbackReviewer } from '@/app/lib/feedback/access';
import ReportsBoard from '@/app/components/feedback/reports/ReportsBoard';

export const metadata: Metadata = { title: 'Retours des utilisateurs', robots: { index: false } };
export const dynamic = 'force-dynamic';

/** Same board as /admin/retours, for club officers who cannot enter the admin area. */
export default async function RetoursPage(): Promise<React.ReactElement> {
  const session = await getSessionUser();
  if (!session) redirect('/login?redirect=/retours');

  if (!isFeedbackReviewer(session)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-wide text-2xl font-extrabold uppercase">Accès réservé</h1>
        <p className="mt-3 text-sm text-ink-2 dark:text-snow-2">
          Les retours sont visibles par les responsables du club et les administrateurs.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline">
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-line bg-paper-2 dark:border-night-line dark:bg-night-2">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
            Feuille · Retours
          </p>
          <h1 className="mt-1 font-wide text-3xl font-extrabold uppercase tracking-tight">Retours des utilisateurs</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-2 dark:text-snow-2">
            Captures et remarques envoyées depuis le site. Ouvrez un retour, répondez, puis marquez-le résolu ou
            écartez-le.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ReportsBoard />
      </div>
    </>
  );
}
