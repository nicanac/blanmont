import { Member } from '../../../types';

interface MemberCardProps {
    member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
    return (
        <li className="group">
            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#f2efe9] border border-[#e4e0d8] shadow-2xs group-hover:shadow-md transition-all">
                <img
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-103"
                    src={member.photoUrl}
                    alt={member.name}
                />
            </div>
            <h3 className="mt-4 text-base font-bold tracking-tight text-[#101216] group-hover:text-[#e03e3e] transition-colors">{member.name}</h3>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-[#5c6370]">{member.role.join(' · ')}</p>
        </li>
    );
}
