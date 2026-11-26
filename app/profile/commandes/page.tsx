import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SheetHeader } from '@/app/components/carte/SheetHeader';
import { getSessionUser } from '@/app/lib/auth/session';
import { getOrdersByMember } from '@/app/lib/firebase/equipment-orders';
import { getEquipmentCampaigns } from '@/app/lib/firebase/equipment-campaigns';
import { getPaymentSettings } from '@/app/lib/firebase/payment-settings';
import { buildEpcPayload } from '@/app/lib/payments/epc';
import type { EquipmentOrder } from '@/app/types/equipment';
import OrderCard from './OrderCard';
import OrderHowTo from '@/app/components/payments/OrderHowTo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mes commandes | CC Saint-Martin Blanmont',
  description: 'Suivi de vos commandes d’équipement : paiement, commande groupée et remise.',
};

export default async function MemberOrdersPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login?redirect=%2Fprofile%2Fcommandes');

  const [orders, campaigns, settings] = await Promise.all([
    getOrdersByMember(session.id),
    getEquipmentCampaigns(),
    getPaymentSettings(),
  ]);
  const campaignById = new Map(campaigns.map((c) => [c.id, c]));

  const epcFor = (order: EquipmentOrder): string | null => {
    if (!settings || !order.paymentReference) return null;
    try {
      return buildEpcPayload({
        beneficiary: settings.beneficiary,
        iban: settings.iban,
        bic: settings.bic,
        amountEur: order.totalPrice,
        reference: order.paymentReference,
      });
    } catch {
      return null; // invalid club settings: the card falls back to the reference alone
    }
  };

  return (
    <main className="min-h-screen bg-paper transition-colors duration-200 dark:bg-night">
      <SheetHeader
        sheet="Espace Membre"
        focus={{ x: 50, y: 50 }}
        title="Mes commandes"
        description="Suivez le paiement, la commande chez Gobik et la remise de votre équipement."
        legend={[
          { term: 'Membre', value: session.name },
          { term: 'Commandes', value: String(orders.length) },
          { term: 'Club', value: 'CC Saint-Martin Blanmont' },
        ]}
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        {orders.length === 0 ? (
          <p className="rounded-lg border border-line bg-white p-6 text-sm text-ink dark:border-night-line dark:bg-ink dark:text-snow">
            Aucune commande pour l&apos;instant.{' '}
            <Link href="/le-club/equipement" className="font-bold text-brand underline underline-offset-2">
              Voir l&apos;équipement
            </Link>
          </p>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                campaign={order.campaignId ? campaignById.get(order.campaignId) : null}
                epcPayload={epcFor(order)}
                iban={settings?.iban}
                beneficiary={settings?.beneficiary}
              />
            ))}
          </ul>
        )}
        <OrderHowTo showDates />
      </div>
    </main>
  );
}
