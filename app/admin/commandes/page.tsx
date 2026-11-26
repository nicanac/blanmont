import React from 'react';
import {
  canTransitionOrder,
  getEquipmentOrders,
  ORDER_STATUSES,
} from '@/app/lib/firebase/equipment-orders';
import OrdersTable, { type OrderTransitions } from './components/OrdersTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Commandes équipement | Administration CC Blanmont',
  description: 'Suivi des commandes de tenues et équipements du club.',
};

export default async function AdminOrdersPage(): Promise<React.ReactElement> {
  const orders = await getEquipmentOrders();
  // canTransitionOrder lives in the server data layer: ship its table to the client component.
  const transitions = Object.fromEntries(
    ORDER_STATUSES.map((from) => [from, ORDER_STATUSES.filter((to) => canTransitionOrder(from, to))])
  ) as OrderTransitions;
  return <OrdersTable initialOrders={orders} transitions={transitions} />;
}
