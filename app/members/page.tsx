import { getMembers } from '../lib/firebase';
import MembersView from './MembersView';
import { Member } from '../types';
import { SheetHeader } from '../components/carte/SheetHeader';

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
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <SheetHeader
        sheet="Membres"
        focus={{ x: 49, y: 53 }}
        title="Le peloton & le comité"
        description="Découvrez les membres bénévoles, les capitaines de route et le comité qui animent le Club Cyclo Saint-Martin de Blanmont chaque weekend."
        legend={[
          { term: 'Membres encadrants', value: `${members.length}` },
          { term: 'Bureau & comité', value: `${bureauCount}` },
          { term: 'Capitaines de route', value: `${captainsCount}` },
        ]}
      />

      {/* ──── Members Section (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <MembersView members={members} />
      </section>
    </main>
  );
}
