'use client';

import React from 'react';
import { ChatBubbleBottomCenterTextIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import AdminPageHeader from '../components/AdminPageHeader';
import ReportsBoard from '@/app/components/feedback/reports/ReportsBoard';

export default function AdminRetoursPage(): React.ReactElement {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        id="retours-header-section"
        title="Retours des utilisateurs"
        sheet="Feuille · Retours"
        badge={{ icon: ChatBubbleBottomCenterTextIcon, label: 'Retours visuels' }}
        description="Captures et remarques envoyées depuis le site. Ouvrez un retour, répondez, puis marquez-le résolu ou écartez-le. Les responsables du club y ont aussi accès."
        actions={[
          {
            label: 'Réglages',
            href: '/admin/settings#settings-feedback-section',
            icon: Cog6ToothIcon,
            variant: 'secondary',
            tooltip: 'Activer ou couper l’outil, choisir qui voit le bouton',
          },
        ]}
      />
      <ReportsBoard />
    </div>
  );
}
