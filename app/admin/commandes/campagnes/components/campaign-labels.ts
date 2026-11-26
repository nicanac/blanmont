import type { CampaignStatus } from '@/app/types/equipment';

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  open: 'Ouverte',
  closed: 'Clôturée',
  ordered: 'Commandée chez Gobik',
  received: 'Reçue',
};
