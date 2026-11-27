import React from 'react';
import Link from 'next/link';
import MaillotsPageHeader from '../components/MaillotsPageHeader';
import Badge from '@/app/components/ui/Badge';
import { getEquipment } from '@/app/lib/firebase/equipment';
import { getEquipmentCampaigns } from '@/app/lib/firebase/equipment-campaigns';
import { getEquipmentOrders } from '@/app/lib/firebase/equipment-orders';
import CampaignForm from './components/CampaignForm';
import { CAMPAIGN_STATUS_LABELS } from './components/campaign-labels';
import { formatDate } from '../components/format';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Commandes groupées | Administration CC Blanmont',
  description: 'Commandes groupées de maillots chez Gobik.',
};

export default async function AdminCampaignsPage(): Promise<React.ReactElement> {
  const [campaigns, orders, equipment] = await Promise.all([
    getEquipmentCampaigns(),
    getEquipmentOrders(),
    getEquipment(),
  ]);

  return (
    <div className="space-y-6">
      <MaillotsPageHeader
        initialTab="setup"
        sheet="Feuille · Commandes groupées"
        title="Commandes groupées"
        badge={{ icon: 'campaigns', label: `${campaigns.length} campagne${campaigns.length > 1 ? 's' : ''}` }}
        description="Ouvrez une commande groupée, suivez les paiements, puis commandez chez Gobik."
        actions={[
          { label: 'Commandes', href: '/admin/commandes', icon: 'orders', variant: 'secondary' },
          { label: 'Banque', href: '/admin/commandes/banque', icon: 'bank', variant: 'secondary' },
        ]}
      />

      {campaigns.length === 0 ? (
        <p className="rounded-md border border-dashed border-line p-8 text-center text-sm text-ink-3 dark:border-night-line dark:text-snow-3">
          Aucune commande groupée. Créez la première ci-dessous.
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white dark:divide-night-line dark:border-night-line dark:bg-night-2">
          {campaigns.map((c) => {
            const own = orders.filter((o) => o.campaignId === c.id && o.status !== 'cancelled');
            const paid = own.filter((o) => o.status === 'paid' || o.status === 'delivered').length;
            return (
              <li key={c.id}>
                <Link
                  href={`/admin/commandes/campagnes/${c.id}`}
                  className="flex min-h-[44px] flex-wrap items-center justify-between gap-3 p-4 hover:bg-paper-2 dark:hover:bg-night-3"
                >
                  <span className="min-w-0">
                    <span className="block font-bold text-ink dark:text-snow">{c.title}</span>
                    <span className="block text-xs tabular-nums text-ink-3 dark:text-snow-3">
                      Clôture {formatDate(c.closesAt)}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-ink dark:text-snow">
                      {paid} / {own.length} payées
                    </span>
                    <Badge variant={c.status === 'open' ? 'success' : c.status === 'received' ? 'paper' : 'warning'} size="sm">
                      {CAMPAIGN_STATUS_LABELS[c.status]}
                    </Badge>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <CampaignForm
        equipment={equipment
          .filter((e) => e.isAvailable)
          .map((e) => ({ id: e.id, name: e.name, sizes: e.sizes }))}
      />
    </div>
  );
}
