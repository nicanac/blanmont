import { getMembers } from '../lib/firebase';
import MembersView from './MembersView';
import {
  UsersIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Member } from '../types';

export const revalidate = 60; // ISR every 60 seconds

export default async function MembersPage() {
  const allMembers = await getMembers();

  // Filter to show members with an active role (bureau, capitaines, comité, etc.)
  const members = allMembers.filter((m: Member) => {
    const roles = Array.isArray(m.role) ? m.role : [m.role].filter(Boolean);
    const interestingRoles = roles.filter((r: string) => r !== 'Member' && r !== 'Membre');
    return interestingRoles.length > 0;
  });

  const bureauCount = members.filter((m) => {
    const rolesString = Array.isArray(m.role) ? m.role.join(' ') : String(m.role || '');
    return /président|tresorier|trésorier|secrétaire|secretaire|vice|comité|comite/i.test(rolesString);
  }).length;

  const captainsCount = members.filter((m) => {
    const rolesString = Array.isArray(m.role) ? m.role.join(' ') : String(m.role || '');
    return /capitaine/i.test(rolesString);
  }).length;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        {/* Ambient red glow */}
        <div className="pointer-events-none absolute -top-40 -right-24 h-[500px] w-[500px] rounded-full bg-[#e03e3e]/15 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Title row */}
          <div className="space-y-4 max-w-3xl pb-10 border-b border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#f5f6f8]">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
              Saison 2026 · Encadrement &amp; Bureau
            </div>

            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Le Peloton &amp; le <span className="text-[#e03e3e] italic">Comité</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              Découvrez les membres bénévoles, les capitaines de route et le comité qui animent le Club Cyclo Saint-Martin de Blanmont chaque weekend.
            </p>
          </div>

          {/* Telemetry ribbon on Ink */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {/* Total Active Team */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0 mt-0.5">
                <UsersIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#e03e3e]">
                  Équipe Encadrante
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {members.length} membres actifs
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Bureau, capitaines &amp; animateurs du club
                </p>
              </div>
            </div>

            {/* Bureau & Comité */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Bureau &amp; Comité
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {bureauCount} responsables
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Présidence, secrétariat, trésorerie &amp; logistique
                </p>
              </div>
            </div>

            {/* Capitaines de Route */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <SparklesIcon className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Sécurité &amp; Rythme
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {captainsCount} capitaines de route
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Encadrement des allures A, B, C &amp; VTT
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Members Section (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <MembersView members={members} />
      </section>
    </main>
  );
}
