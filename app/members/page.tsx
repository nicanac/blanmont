import { getMembers } from '../lib/notion';


export const revalidate = 60; // ISR every 60 seconds

export default async function MembersPage() {
    // Filter to show only members with a role other than just "Member" (e.g. President, Secretary, etc.)
    const allMembers = await getMembers();
    const members = allMembers.filter(m => {
        // Assume 'Member' is the default role for everyone.
        // We want to show people who have roles *other* than 'Member' (or 'Membre').
        // If the only role is 'Member', exclude them.
        const interestingRoles = m.role.filter(r => r !== 'Member' && r !== 'Membre');
        return interestingRoles.length > 0;
    });

    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Le Peloton</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Rencontrez les cyclistes qui font vivre Blanmont.
                    </p>
                </div>
                <ul role="list" className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4">
                    {members.map((member) => (
                        <li key={member.id}>
                            <img
                                className="aspect-square w-full rounded-2xl object-cover"
                                src={member.photoUrl}
                                alt={member.name}
                            />
                            <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">{member.name}</h3>
                            <p className="text-base leading-7 text-gray-600">{member.role.join(' · ')}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
