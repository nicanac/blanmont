/**
 * @vitest-environment jsdom
 *
 * Regression: /admin/commandes/banque and /admin/commandes/campagnes are server components that
 * render the client component MaillotsPageHeader. Passing heroicon components (functions) in its
 * props made both pages crash with "Functions cannot be passed directly to Client Components".
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MaillotsPageHeader from '@/app/admin/commandes/components/MaillotsPageHeader';

vi.mock('@/app/lib/firebase/bank-transactions', () => ({ listBankTransactions: vi.fn(async () => []) }));
vi.mock('@/app/lib/firebase/equipment-orders', () => ({ getEquipmentOrders: vi.fn(async () => []) }));
vi.mock('@/app/lib/firebase/equipment-campaigns', () => ({ getEquipmentCampaigns: vi.fn(async () => []) }));
vi.mock('@/app/lib/firebase/equipment', () => ({ getEquipment: vi.fn(async () => []) }));
vi.mock('@/app/admin/commandes/banque/components/BankClient', () => ({ default: () => null }));
vi.mock('@/app/admin/settings/components/PaymentSettingsCard', () => ({ default: () => null }));
vi.mock('@/app/admin/commandes/campagnes/components/CampaignForm', () => ({ default: () => null }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

/** Paths of every function found in a props object (what React refuses to serialise). */
function functionPaths(value: unknown, path = 'props', seen = new Set<unknown>()): string[] {
  if (typeof value === 'function') return [path];
  if (!value || typeof value !== 'object' || seen.has(value)) return [];
  seen.add(value);
  if (React.isValidElement(value)) return [];
  return Object.entries(value).flatMap(([k, v]) => functionPaths(v, `${path}.${k}`, seen));
}

/** The MaillotsPageHeader element rendered by a server page. */
function findHeader(node: React.ReactNode): React.ReactElement | null {
  if (!React.isValidElement(node)) return null;
  if (node.type === MaillotsPageHeader) return node;
  const children = (node.props as { children?: React.ReactNode }).children;
  for (const child of React.Children.toArray(children)) {
    const found = findHeader(child);
    if (found) return found;
  }
  return null;
}

describe('maillots server pages', () => {
  it.each([
    ['banque', () => import('@/app/admin/commandes/banque/page')],
    ['campagnes', () => import('@/app/admin/commandes/campagnes/page')],
  ])('%s passes only serialisable props to MaillotsPageHeader', async (_name, load) => {
    const { default: Page } = await load();
    const header = findHeader(await Page());
    expect(header).not.toBeNull();
    const { initialTab: _tab, ...props } = header!.props as Record<string, unknown>;
    expect(functionPaths(props)).toEqual([]);
  });

  it('resolves icon names to icons in the header', () => {
    const { container } = render(
      <MaillotsPageHeader
        initialTab="payments"
        title="Banque du club"
        badge={{ icon: 'bank', label: '2 à traiter' }}
        actions={[{ label: 'Commandes', href: '/admin/commandes', icon: 'orders', variant: 'secondary' }]}
      />
    );
    expect(screen.getByText('2 à traiter')).toBeTruthy();
    expect(screen.getAllByText('Commandes').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);
  });
});
