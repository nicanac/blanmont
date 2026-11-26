import { NextResponse } from 'next/server';
import { getOpenCampaign } from '@/app/lib/firebase/equipment-campaigns';

export const dynamic = 'force-dynamic';

/** Public: the open group order, reduced to what the catalogue banner needs (no member data). */
export async function GET() {
  try {
    const campaign = await getOpenCampaign();
    return NextResponse.json(
      campaign
        ? { id: campaign.id, title: campaign.title, closesAt: campaign.closesAt, equipmentIds: campaign.equipmentIds }
        : null
    );
  } catch (error) {
    console.error('Error fetching open campaign:', error);
    return NextResponse.json(null);
  }
}
