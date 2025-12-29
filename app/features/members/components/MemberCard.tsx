import { Member } from '../../../types';

interface MemberCardProps {
    member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
    return (
        <li>
            <img
                className="aspect-square w-full rounded-2xl object-cover"
                src={member.photoUrl}
                alt={member.name}
            />
            <h3 className="mt-6 text-lg font-semibold leading-8 tracking-tight text-gray-900">{member.name}</h3>
            <p className="text-base leading-7 text-gray-600">{member.role.join(' · ')}</p>
        </li>
    );
}
