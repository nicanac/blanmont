import React from 'react';
import MaillotsPageHeader from '../components/MaillotsPageHeader';
import { listBankTransactions } from '@/app/lib/firebase/bank-transactions';
import { getEquipmentOrders } from '@/app/lib/firebase/equipment-orders';
import BankClient from './components/BankClient';
import PaymentSettingsCard from '../../settings/components/PaymentSettingsCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Banque | Administration CC Blanmont',
  description: 'Import CODA et rapprochement des paiements.',
};

export default async function AdminBankPage(): Promise<React.ReactElement> {
  const [unmatched, matched, orders] = await Promise.all([
    listBankTransactions('unmatched'),
    listBankTransactions('matched'),
    getEquipmentOrders(),
  ]);
  const names = new Map(orders.map((o) => [o.id, o.memberName]));

  return (
    <div className="space-y-6">
      <MaillotsPageHeader
        initialTab="payments"
        sheet="Feuille · Banque"
        title="Banque du club"
        badge={{ icon: 'bank', label: `${unmatched.length} à traiter` }}
        description="Importez l'extrait CODA de la banque : les paiements reconnus marquent les commandes payées."
        actions={[
          { label: 'Commandes', href: '/admin/commandes', icon: 'orders', variant: 'secondary' },
          { label: 'Commandes groupées', href: '/admin/commandes/campagnes', icon: 'campaigns', variant: 'secondary' },
        ]}
      />
      <BankClient
        unmatched={unmatched}
        matched={matched.slice(0, 10).map((t) => ({ ...t, memberName: t.orderId ? names.get(t.orderId) : undefined }))}
        pendingOrders={orders
          .filter((o) => o.status === 'pending')
          .map((o) => ({
            id: o.id,
            memberName: o.memberName,
            paymentReference: o.paymentReference,
            totalPrice: o.totalPrice,
          }))}
      />
      {/* Club account (IBAN for the payment card and QR): here so the Trésorier does not need Paramètres. */}
      <PaymentSettingsCard />
    </div>
  );
}
