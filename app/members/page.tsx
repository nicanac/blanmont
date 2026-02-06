import { getMembers } from '../lib/firebase';
import Link from 'next/link';
import MemberCard from '../features/members/components/MemberCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Member } from '../types';


export const revalidate = 60; // ISR every 60 seconds

export default async function MembersPage() {
    // Filter to show only members with a role other than just "Member" (e.g. President, Secretary, etc.)
    const allMembers = await getMembers();
    const members = allMembers.filter((m: Member) => {
        // Assume 'Member' is the default role for everyone.
        // We want to show people who have roles *other* than 'Member' (or 'Membre').
        // If the only role is 'Member', exclude them.
        const roles = Array.isArray(m.role) ? m.role : ['Member'];
        const interestingRoles = roles.filter((r: string) => r !== 'Member' && r !== 'Membre');
        return interestingRoles.length > 0;
    });

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <PageHeader 
                    title="Le Peloton" 
                    description="Rencontrez les cyclistes qui font vivre Blanmont." 
                />
                <ul role="list" className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                    {members.map((member) => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </ul>
            </div>
        </div>
    );
}
