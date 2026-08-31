import React from 'react';
import { notFound } from 'next/navigation';
import { getWeekendPollById } from '@/app/lib/firebase';
import EditPollForm from './EditPollForm';

export const dynamic = 'force-dynamic';

interface EditPollPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { id } = await params;
  const poll = await getWeekendPollById(id);

  if (!poll) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <EditPollForm poll={poll} />
    </div>
  );
}
