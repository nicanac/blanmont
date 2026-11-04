import React from 'react';
import { getEquipmentOrders } from '@/app/lib/firebase/equipment-orders';
import OrdersTable from './components/OrdersTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Commandes équipement | Administration CC Blanmont',
  description: 'Suivi des commandes de tenues et équipements du club.',
};

export default async function AdminOrdersPage(): Promise<React.ReactElement> {
  const orders = await getEquipmentOrders();
  return <OrdersTable initialOrders={orders} />;
}
