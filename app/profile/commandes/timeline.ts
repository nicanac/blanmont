import type { EquipmentCampaign, EquipmentOrder } from '@/app/types/equipment';

export interface TimelineStep {
  label: string;
  /** ISO date or YYYY-MM-DD; undefined while the step is still to come. */
  date?: string;
}

/**
 * The dates a member sees, all automatic. Stock orders skip the two supplier steps;
 * a cancelled order stops at its cancellation date.
 */
export function buildTimeline(order: EquipmentOrder, campaign?: EquipmentCampaign | null): TimelineStep[] {
  const ordered = { label: 'Commandé le', date: order.createdAt };
  if (order.status === 'cancelled') return [ordered, { label: 'Annulée le', date: order.cancelledAt }];

  const steps: TimelineStep[] = [ordered, { label: 'Payé le', date: order.paidAt }];
  if (order.source === 'campaign') {
    steps.push(
      { label: 'Commandé chez Gobik le', date: campaign?.supplierOrderedAt },
      { label: 'Arrivé au club le', date: campaign?.receivedAt }
    );
  }
  steps.push({ label: 'Remis le', date: order.deliveredAt });
  return steps;
}
