import { getMembers } from '../lib/firebase';
import { PageHero } from '../components/ui/PageHero';
import MemberCard from '../features/members/components/MemberCard';
import { UsersIcon } from '@heroicons/react/24/outline';
import { Member } from '../types';

export const revalidate = 60; // ISR every 60 seconds

export default async function MembersPage() {
    const allMembers = await getMembers();
    // Filter to show only members with a role other than just "Member"
    const members = allMembers.filter((m: Member) => {
        const roles = Array.isArray(m.role) ? m.role : ['Member'];
        const interestingRoles = roles.filter((r: string) => r !== 'Member' && r !== 'Membre');
        return interestingRoles.length > 0;
    });

    return (
        <main className="min-h-screen bg-gray-50">
            <PageHero
                title="Le Peloton"
                description="Rencontrez les cyclistes qui font vivre Blanmont."
                badge="L'Équipe"
                badgeIcon={<UsersIcon className="h-4 w-4" />}
                variant="red"
                size="md"
            />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <ul role="list" className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
                    {members.map((member: Member) => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </ul>
            </div>
        </main>
    );
}
