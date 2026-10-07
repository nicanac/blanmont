/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';
import AdminHelpModal from '@/app/admin/components/AdminHelpModal';
import DashboardTutorialModal from '@/app/admin/components/DashboardTutorialModal';
import ProspectsTutorialModal from '@/app/admin/prospects/components/ProspectsTutorialModal';
import GalerieTutorialModal from '@/app/admin/galerie/components/GalerieTutorialModal';
import PointageExpressTutorialModal from '@/app/admin/pointage-express/components/PointageExpressTutorialModal';
import SondagesTutorialModal from '@/app/admin/sondages/components/SondagesTutorialModal';
import HeroTutorialModal from '@/app/admin/hero/components/HeroTutorialModal';
import SettingsTutorialModal from '@/app/admin/settings/components/SettingsTutorialModal';
import MemberPhotosTutorialModal from '@/app/admin/members/photos/components/MemberPhotosTutorialModal';
import CarreVertTutorialModal from '@/app/admin/carre-vert/components/CarreVertTutorialModal';
import MembersTutorialModal from '@/app/admin/members/components/MembersTutorialModal';
import EventsTutorialModal from '@/app/admin/events/components/EventsTutorialModal';
import EquipementsTutorialModal from '@/app/admin/equipements/components/EquipementsTutorialModal';
import BlogTutorialModal from '@/app/admin/blog/components/BlogTutorialModal';
import StatisticsTutorialModal from '@/app/admin/statistics/components/StatisticsTutorialModal';
import TracesTutorialModal from '@/app/admin/traces/components/TracesTutorialModal';
import { renderHook, act } from '@testing-library/react';
import { useAdminTours } from '@/app/admin/components/tours/adminTours';

const mockDrive = vi.fn();
const mockDriver = vi.fn((opts) => ({
  drive: mockDrive,
  opts,
}));

vi.mock('driver.js', () => ({
  driver: (opts: unknown) => mockDriver(opts),
}));

describe('AdminTutorialModal base component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <AdminTutorialModal
        isOpen={false}
        onClose={vi.fn()}
        title="Guide Test"
        icon={AcademicCapIcon}
        tabs={[
          {
            id: 'tab-1',
            label: 'Premier Pas',
            badge: 'Débutant',
            content: <div>Contenu Premier Pas</div>,
          },
        ]}
      />
    );

    expect(screen.queryByText('Guide Test')).not.toBeInTheDocument();
  });

  it('renders modal with tabs, badges, subtitle and handles tab switching and level badge colors', () => {
    const handleClose = vi.fn();
    const handleStartTour = vi.fn();

    render(
      <AdminTutorialModal
        isOpen={true}
        onClose={handleClose}
        title="Guide de Test"
        subtitle="Notice explicative du module"
        icon={AcademicCapIcon}
        tabs={[
          {
            id: 'tab-1',
            label: 'Premiers Pas',
            badge: 'Débutant',
            content: <div>Contenu Débutant 1</div>,
          },
          {
            id: 'tab-2',
            label: 'Fonctions Clés',
            badge: 'Confirmé',
            content: <div>Contenu Confirmé 2</div>,
          },
          {
            id: 'tab-3',
            label: 'Mode Expert',
            badge: 'Avancé',
            content: <div>Contenu Avancé 3</div>,
          },
        ]}
        onStartTour={handleStartTour}
      />
    );

    // Title and subtitle
    expect(screen.getByText('Guide de Test')).toBeInTheDocument();
    expect(screen.getByText('Notice explicative du module')).toBeInTheDocument();

    // Badges
    const badgeDebutant = screen.getByText('Débutant');
    const badgeConfirme = screen.getByText('Confirmé');
    const badgeAvance = screen.getByText('Avancé');
    expect(badgeDebutant).toBeInTheDocument();
    expect(badgeConfirme).toBeInTheDocument();
    expect(badgeAvance).toBeInTheDocument();

    // Verify distinct badge token classes
    expect(badgeDebutant.className).toContain('text-vert');
    expect(badgeConfirme.className).toContain('text-hydro');
    expect(badgeAvance.className).toContain('text-ambre');

    // Initial tab content
    expect(screen.getByText('Contenu Débutant 1')).toBeInTheDocument();
    expect(screen.queryByText('Contenu Confirmé 2')).not.toBeInTheDocument();

    // Switch tab
    const tab2Btn = screen.getByRole('button', { name: /Fonctions Clés/i });
    fireEvent.click(tab2Btn);

    expect(screen.getByText('Contenu Confirmé 2')).toBeInTheDocument();
    expect(screen.queryByText('Contenu Débutant 1')).not.toBeInTheDocument();

    // Trigger interactive tour
    const tourBtn = screen.getByRole('button', { name: /Lancer la visite guidée/i });
    fireEvent.click(tourBtn);
    expect(handleStartTour).toHaveBeenCalledTimes(1);

    // Close button (Compris, fermer)
    const closeBtn = screen.getByRole('button', { name: /Compris, fermer/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('ensures tab navigation does not contain horizontal scroll slider and distributes tabs cleanly', () => {
    const { container } = render(
      <AdminTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        title="Guide Sans Slider"
        icon={AcademicCapIcon}
        tabs={[
          { id: 'tab-1', label: '1. Accueil & 1ère Sortie', badge: 'Débutant', content: <div>T1</div> },
          { id: 'tab-2', label: '2. Pipeline & Parrainage', badge: 'Confirmé', content: <div>T2</div> },
          { id: 'tab-3', label: '3. Conversion & Export CSV', badge: 'Avancé', content: <div>T3</div> },
        ]}
      />
    );

    // Verify modal dialog uses max-w-4xl
    const dialog = container.querySelector('[role="dialog"] > div:last-child');
    expect(dialog?.className).toContain('max-w-4xl');

    // Verify tab bar does NOT have overflow-x-auto (which caused the horizontal slider)
    const tabContainer = container.querySelector('.divide-y');
    expect(tabContainer).toBeInTheDocument();
    expect(tabContainer?.className).not.toContain('overflow-x-auto');

    // Verify each button has flex-1 min-w-0 for clean equal distribution without overflow
    const buttons = screen.getAllByRole('button', { name: /Accueil|Pipeline|Conversion/i });
    expect(buttons).toHaveLength(3);
    buttons.forEach((btn) => {
      expect(btn.className).toContain('flex-1');
      expect(btn.className).toContain('min-w-0');
    });
  });
});

describe('AdminHelpModal', () => {
  it('renders all 4 tabs with flex-1 and no overflow-x-auto horizontal slider', () => {
    const handleClose = vi.fn();
    const handleReset = vi.fn();

    const { container } = render(
      <AdminHelpModal
        isOpen={true}
        onClose={handleClose}
        onResetOnboarding={handleReset}
      />
    );

    expect(screen.getByText(/Centre d'Aide & Rituels Admin/i)).toBeInTheDocument();

    // Verify no overflow-x-auto on tabs container
    const tabContainer = container.querySelector('.divide-y');
    expect(tabContainer).toBeInTheDocument();
    expect(tabContainer?.className).not.toContain('overflow-x-auto');

    // Verify all 4 tabs exist and switch properly
    expect(screen.getByRole('button', { name: /Rythme Hebdo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rôles & Droits/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Raccourcis & Outils/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guide Démarrage/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Rôles & Droits/i }));
    expect(screen.getByText(/Gestion Complète & Institutionnelle/i)).toBeInTheDocument();
  });
});

describe('DashboardTutorialModal', () => {
  it('renders dual-level tabs and triggers tour callback', () => {
    const handleStartTour = vi.fn();
    const handleClose = vi.fn();

    render(
      <DashboardTutorialModal
        isOpen={true}
        onClose={handleClose}
        onStartTour={handleStartTour}
      />
    );

    expect(screen.getByText(/Guide du Quartier Général/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quartier Général & Rituels/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Briefing WhatsApp & Commandement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Raccourcis Clavier & Outils/i })).toBeInTheDocument();

    // Verify initial beginner view has key elements
    expect(screen.getByText(/Rythme Hebdomadaire Incontournable/i)).toBeInTheDocument();

    // Switch to WhatsApp tab
    fireEvent.click(screen.getByRole('button', { name: /Briefing WhatsApp & Commandement/i }));
    expect(screen.getByText(/Générateur de Briefing WhatsApp/i)).toBeInTheDocument();

    // Switch to Shortcuts tab
    fireEvent.click(screen.getByRole('button', { name: /Raccourcis Clavier & Outils/i }));
    expect(screen.getByText(/Palette de Commandes/i)).toBeInTheDocument();

    // Trigger tour
    fireEvent.click(screen.getByRole('button', { name: /Lancer la visite interactive/i }));
    expect(handleClose).toHaveBeenCalled();
    expect(handleStartTour).toHaveBeenCalled();
  });
});

describe('HeroTutorialModal', () => {
  it('renders banner diaporama, 21:9 crop, and telemetry tabs', () => {
    const handleStartTour = vi.fn();
    render(
      <HeroTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={handleStartTour}
      />
    );

    expect(screen.getByText(/Guide de la Bannière d'Accueil/i)).toBeInTheDocument();
    expect(screen.getByText(/Aperçu en Direct WYSIWYG/i)).toBeInTheDocument();

    // Switch to Crop tab
    fireEvent.click(screen.getByRole('button', { name: /Recadrage 21:9 & Visages/i }));
    expect(screen.getByText(/Alignement Vertical Rapide/i)).toBeInTheDocument();

    // Switch to Telemetry tab
    fireEvent.click(screen.getByRole('button', { name: /Télémétrie & Ordre/i }));
    expect(screen.getByText(/Vignettes de Données Clés/i)).toBeInTheDocument();

    // Trigger tour
    fireEvent.click(screen.getByRole('button', { name: /Lancer la visite interactive/i }));
    expect(handleStartTour).toHaveBeenCalled();
  });
});

describe('SettingsTutorialModal', () => {
  it('renders theme, club identity, and FFBC security tabs', () => {
    const handleStartTour = vi.fn();
    render(
      <SettingsTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={handleStartTour}
      />
    );

    expect(screen.getByText(/Guide des Paramètres & Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Mode Clair/i)).toBeInTheDocument();
    expect(screen.getByText(/Mode Sombre/i)).toBeInTheDocument();

    // Switch to Identity tab
    fireEvent.click(screen.getByRole('button', { name: /Identité & Charte IGN/i }));
    expect(screen.getByText(/Cartouche Géodésique & Coordonnées/i)).toBeInTheDocument();

    // Switch to Security tab
    fireEvent.click(screen.getByRole('button', { name: /Règles Fédérales & Sécurité/i }));
    expect(screen.getByText(/Règle des 15 Cyclistes/i)).toBeInTheDocument();
  });
});

describe('MemberPhotosTutorialModal', () => {
  it('renders trombinoscope filters, face alignment, and batch save tabs', () => {
    const handleStartTour = vi.fn();
    render(
      <MemberPhotosTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={handleStartTour}
      />
    );

    expect(screen.getByText(/Guide des Portraits & Cadrage/i)).toBeInTheDocument();
    expect(screen.getByText(/Filtres Rapides par Statut/i)).toBeInTheDocument();

    // Switch to Alignment tab
    fireEvent.click(screen.getByRole('button', { name: /Cadrage & Alignement/i }));
    expect(screen.getByText(/Curseur d'Alignement Vertical/i)).toBeInTheDocument();

    // Switch to Batch save tab
    fireEvent.click(screen.getByRole('button', { name: /Téléversement & Sauvegarde/i }));
    expect(screen.getByText(/Sauvegarde Globale en 1 Clic/i)).toBeInTheDocument();
  });
});

describe('ProspectsTutorialModal', () => {
  it('renders CRM workflow guidance with trial ride caps and mentor assignment', () => {
    render(
      <ProspectsTutorialModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide du CRM Candidatures/i)).toBeInTheDocument();
    expect(screen.getByText(/Premier Contact sous 48h/i)).toBeInTheDocument();

    // Switch to Pipeline tab
    fireEvent.click(screen.getByRole('button', { name: /Pipeline & Parrainage/i }));
    expect(screen.getByText(/Désigner un Capitaine Mentor/i)).toBeInTheDocument();

    // Switch to Export tab
    fireEvent.click(screen.getByRole('button', { name: /Conversion & Export CSV/i }));
    expect(screen.getByText(/Export CSV pour le Secrétariat/i)).toBeInTheDocument();
  });
});

describe('GalerieTutorialModal', () => {
  it('renders photo albums guidance for external albums and cover photos', () => {
    render(
      <GalerieTutorialModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide des Galeries Photos/i)).toBeInTheDocument();
    expect(screen.getByText(/Titre Évocateur & Année/i)).toBeInTheDocument();

    // Switch to External links tab
    fireEvent.click(screen.getByRole('button', { name: /Albums Externes & Partage/i }));
    expect(screen.getByText(/Lien Google Photos \/ Flickr/i)).toBeInTheDocument();

    // Switch to Visibility tab
    fireEvent.click(screen.getByRole('button', { name: /Mise en Avant & Accueil/i }));
    expect(screen.getByText(/Option « Album à la une »/i)).toBeInTheDocument();
  });
});

describe('PointageExpressTutorialModal', () => {
  it('renders attendance tracking guidance with 1-tap, QR scan and ICE contacts', () => {
    render(
      <PointageExpressTutorialModal
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide du Pointage Express/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Tap pour Pointer/i)).toBeInTheDocument();

    // Switch to QR scan tab
    fireEvent.click(screen.getByRole('button', { name: /Pass Numérique & QR/i }));
    expect(screen.getByText(/Validation Automatique par Caméra/i)).toBeInTheDocument();

    // Switch to ICE tab
    fireEvent.click(screen.getByRole('button', { name: /Fiches ICE & Carré Vert/i }));
    expect(screen.getByText(/Fiche Médicale & Secours ICE/i)).toBeInTheDocument();
  });
});

describe('SondagesTutorialModal', () => {
  it('renders weekly voting cycle and WhatsApp synthesis guidance', () => {
    render(
      <SondagesTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide des Sondages Hebdomadaires/i)).toBeInTheDocument();
    expect(screen.getByText(/Lundi 08h00 : Création Automatique/i)).toBeInTheDocument();

    // Switch to WhatsApp synthesis tab
    fireEvent.click(screen.getByRole('button', { name: /WhatsApp & Briefing/i }));
    expect(screen.getByText(/Fiche de Synthèse du Sondage/i)).toBeInTheDocument();

    // Switch to Groups & GPX tab
    fireEvent.click(screen.getByRole('button', { name: /Groupes & Traces GPX/i }));
    expect(screen.getByText(/Groupe A · Sportif/i)).toBeInTheDocument();
  });
});

describe('CarreVertTutorialModal', () => {
  it('renders Carré Vert rules, Sheets sync, and multi-season archives', () => {
    render(
      <CarreVertTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide du Carré Vert/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Point par Sortie/i)).toBeInTheDocument();

    // Switch to Sheets Cron tab
    fireEvent.click(screen.getByRole('button', { name: /Synchronisation Sheets & Cron/i }));
    expect(screen.getByText(/La Tâche Cron Automatique/i)).toBeInTheDocument();

    // Switch to Seasons tab
    fireEvent.click(screen.getByRole('button', { name: /Multi-Saisons & Hall of Fame/i }));
    expect(screen.getByText(/Archives 2025, 2026/i)).toBeInTheDocument();
  });
});

describe('MembersTutorialModal', () => {
  it('renders members roster, roles matrix, and security tabs', () => {
    render(
      <MembersTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide de Gestion des Membres/i)).toBeInTheDocument();
    expect(screen.getByText(/Création d'un Nouveau Compte Cycliste/i)).toBeInTheDocument();

    // Switch to Roles tab
    fireEvent.click(screen.getByRole('button', { name: /Rôles & Permissions/i }));
    expect(screen.getByText(/Président \/ Admin/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Capitaine de Route/i).length).toBeGreaterThanOrEqual(1);

    // Switch to Security tab
    fireEvent.click(screen.getByRole('button', { name: /Sécurité, Clés & Portraits/i }));
    expect(screen.getByText(/Bouton Clé \(Réinitialisation de Mot de Passe\)/i)).toBeInTheDocument();
  });
});

describe('EventsTutorialModal', () => {
  it('renders calendar planning, batch PDF import, and iCal feed tabs', () => {
    render(
      <EventsTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide du Calendrier & Sorties/i)).toBeInTheDocument();
    expect(screen.getByText(/Lieu de Départ & Destination/i)).toBeInTheDocument();

    // Switch to PDF Import tab
    fireEvent.click(screen.getByRole('button', { name: /Importation PDF par Lot/i }));
    expect(screen.getByText(/Processus d'importation en 3 étapes/i)).toBeInTheDocument();

    // Switch to Sync tab
    fireEvent.click(screen.getByRole('button', { name: /Synchronisation iCal & GPX/i }));
    expect(screen.getByText(/Synchronisation Mobile/i)).toBeInTheDocument();
  });
});

describe('EquipementsTutorialModal', () => {
  it('renders Gobik catalog, inventory by size, and group orders tabs', () => {
    render(
      <EquipementsTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide du Vestiaire Gobik & Stocks/i)).toBeInTheDocument();
    expect(screen.getByText(/Photos & Spécifications/i)).toBeInTheDocument();

    // Switch to Stock tab
    fireEvent.click(screen.getByRole('button', { name: /Tailles & Inventaire/i }));
    expect(screen.getByText(/Ajustement en 1 Clic/i)).toBeInTheDocument();

    // Switch to Orders tab
    fireEvent.click(screen.getByRole('button', { name: /Commandes Groupées/i }));
    expect(screen.getByText(/Bonne pratique d'intendance/i)).toBeInTheDocument();
  });
});

describe('BlogTutorialModal', () => {
  it('renders 5-step article creation, rich text formatting, and editorial rules tabs', () => {
    render(
      <BlogTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide de Rédaction & Publication/i)).toBeInTheDocument();
    expect(screen.getByText(/Titre & Catégorie/i)).toBeInTheDocument();
    expect(screen.getByText(/Photo de Couverture/i)).toBeInTheDocument();

    // Switch to Formatting tab
    fireEvent.click(screen.getByRole('button', { name: /Mise en Page & Liens/i }));
    expect(screen.getByText(/Titres H2 & H3/i)).toBeInTheDocument();
  });
});

describe('StatisticsTutorialModal', () => {
  it('renders season KPIs, attendance charts, and AG report guidance', () => {
    render(
      <StatisticsTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide des Statistiques & Analyses/i)).toBeInTheDocument();
    expect(screen.getByText(/Membres Actifs & Taux d'Engagement/i)).toBeInTheDocument();

    // Switch to Charts tab
    fireEvent.click(screen.getByRole('button', { name: /Graphiques & Groupes/i }));
    expect(screen.getByText(/Répartition par Groupe \(A, B, C, VTT\)/i)).toBeInTheDocument();
  });
});

describe('TracesTutorialModal', () => {
  it('renders GPX catalog, Strava import, and bike computer sync tabs', () => {
    render(
      <TracesTutorialModal
        isOpen={true}
        onClose={vi.fn()}
        onStartTour={vi.fn()}
      />
    );

    expect(screen.getByText(/Guide des Traces & Parcours GPS/i)).toBeInTheDocument();
    expect(screen.getByText(/Dénivelé D\+ & Profil/i)).toBeInTheDocument();

    // Switch to Import tab
    fireEvent.click(screen.getByRole('button', { name: /Méthodes d’Importation/i }));
    expect(screen.getByText(/Import de fichier \.GPX/i)).toBeInTheDocument();
  });
});

describe('useAdminTours resilient step filtering', () => {
  beforeEach(() => {
    mockDriver.mockClear();
    mockDrive.mockClear();
    document.body.innerHTML = '';
  });

  it('filters out non-existent DOM elements before starting tour', () => {
    // Inject only 1 element into the DOM
    const div = document.createElement('div');
    div.id = 'hero-preview-section';
    document.body.appendChild(div);

    const { result } = renderHook(() => useAdminTours());

    act(() => {
      result.current.startHeroTour();
    });

    expect(mockDriver).toHaveBeenCalled();
    const callArgs = mockDriver.mock.calls[0][0];
    expect(callArgs.steps.length).toBe(1);
    expect(callArgs.steps[0].element).toBe('#hero-preview-section');
    expect(mockDrive).toHaveBeenCalled();
  });

  it('filters out non-existent DOM elements for blog tour when table is absent', () => {
    // Only inject blog header and new button (e.g. empty state where table is absent)
    const header = document.createElement('div');
    header.id = 'blog-header-section';
    const newBtn = document.createElement('button');
    newBtn.id = 'blog-new-btn';
    document.body.appendChild(header);
    document.body.appendChild(newBtn);

    const { result } = renderHook(() => useAdminTours());

    act(() => {
      result.current.startBlogTour();
    });

    expect(mockDriver).toHaveBeenCalled();
    const callArgs = mockDriver.mock.calls[0][0];
    expect(callArgs.steps.length).toBe(2);
    expect(callArgs.steps.map((s: { element: string }) => s.element)).toEqual([
      '#blog-header-section',
      '#blog-new-btn',
    ]);
    expect(mockDrive).toHaveBeenCalled();
  });
});
