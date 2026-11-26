import React from 'react';
import { notFound } from 'next/navigation';
import { getEquipment } from '@/app/lib/firebase/equipment';
import { buildSizeMatrix, getEquipmentCampaign } from '@/app/lib/firebase/equipment-campaigns';
import { getEquipmentOrders } from '@/app/lib/firebase/equipment-orders';
import CampaignDetail from '../components/CampaignDetail';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Commande groupée | Administration CC Blanmont',
};

export default async function AdminCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const { id } = await params;
  const campaign = await getEquipmentCampaign(id);
  if (!campaign) notFound();

  const [orders, equipment] = await Promise.all([getEquipmentOrders(), getEquipment()]);
  const matrix = buildSizeMatrix(campaign, orders);
  const toHandOver = orders.filter(
    (o) => o.campaignId === campaign.id && (o.status === 'paid' || o.status === 'delivered')
  );
  const gobikReferences = Object.fromEntries(
    equipment.map((e) => [e.id, e.gobikReference ?? e.name])
  );

  return (
    <CampaignDetail
      campaign={campaign}
      matrix={matrix}
      toHandOver={toHandOver}
      gobikReferences={gobikReferences}
    />
  );
}
