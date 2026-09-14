import React from 'react';
import { getMembers } from '@/app/lib/firebase/members';
import MemberPhotosManager from './MemberPhotosManager';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cadrage Photos Membres | Administration CC Saint-Martin',
  description: 'Positionnement et recadrage des photos des membres du club.',
};

export default async function AdminMemberPhotosPage(): Promise<React.ReactElement> {
  const members = await getMembers();

  return <MemberPhotosManager initialMembers={members} />;
}
