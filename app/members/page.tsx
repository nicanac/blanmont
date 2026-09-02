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
        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Title row */}
          <div className="space-y-3 max-w-3xl pb-8 border-b border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Le Peloton &amp; le <span className="text-[#e03e3e] italic">Comité</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              Découvrez les membres bénévoles, les capitaines de route et le comité qui animent le Club Cyclo Saint-Martin de Blanmont chaque weekend.
            </p>
          </div>

          {/* Stat Strip on Ink (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-6">
            {/* Total Active Team */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0">
                <UsersIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {members.length}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Membres encadrants
                </div>
              </div>
            </div>

            {/* Bureau & Comité */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <ShieldCheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {bureauCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Bureau &amp; comité
                </div>
              </div>
            </div>

            {/* Capitaines de Route */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <SparklesIcon className="h-5 w-5 text-[#3b82f6]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {captainsCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Capitaines de route
                </div>
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
