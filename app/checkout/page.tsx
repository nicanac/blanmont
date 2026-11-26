import { redirect } from 'next/navigation';
import { getSessionUser } from '@/app/lib/auth/session';
import { getOpenCampaign } from '@/app/lib/firebase/equipment-campaigns';
import { getPaymentSettings } from '@/app/lib/firebase/payment-settings';
import CheckoutClient from './CheckoutClient';

export const dynamic = 'force-dynamic';

/** Members only: anonymous visitors go to /login and come back with the same query string. */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSessionUser();
  if (!session) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) {
      if (typeof value === 'string') query.set(key, value);
    }
    const target = query.size ? `/checkout?${query}` : '/checkout';
    redirect(`/login?redirect=${encodeURIComponent(target)}`);
  }

  const [campaign, settings] = await Promise.all([getOpenCampaign(), getPaymentSettings()]);

  return (
    <CheckoutClient
      memberName={session.name}
      campaign={
        campaign
          ? { id: campaign.id, title: campaign.title, closesAt: campaign.closesAt, equipmentIds: campaign.equipmentIds }
          : null
      }
      payment={settings ? { iban: settings.iban, beneficiary: settings.beneficiary } : null}
    />
  );
}
