import { getMembers } from '../lib/firebase';
import MembersView from './MembersView';
import { UsersIcon } from '@heroicons/react/24/outline';
import { ClubCrestIcon, BicycleIcon } from '@/app/components/ui/CyclingIcons';
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
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] transition-colors duration-200">
      {/* ──── Editorial Cover Hero (Adaptive Light / Dark) ──── */}
      <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
          {/* Title row */}
          <div className="space-y-3 max-w-3xl pb-8 border-b border-[#e4e0d8] dark:border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Le Peloton &amp; le <span className="text-[#e03e3e] italic">Comité</span>
            </h1>

            <p className="max-w-2xl text-base text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Découvrez les membres bénévoles, les capitaines de route et le comité qui animent le Club Cyclo Saint-Martin de Blanmont chaque weekend.
            </p>
          </div>

          {/* Stat Strip on Ink (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-6">
            {/* Total Active Team */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <UsersIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  {members.length}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Membres encadrants
                </div>
              </div>
            </div>

            {/* Bureau & Comité */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <ClubCrestIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  {bureauCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Bureau &amp; comité
                </div>
              </div>
            </div>

            {/* Capitaines de Route */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <BicycleIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  {captainsCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
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
