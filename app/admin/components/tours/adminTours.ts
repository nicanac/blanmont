'use client';

import { useEffect, useCallback } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Custom CSS for Driver.js styled with Editorial Peloton aesthetic
export const DRIVER_PELOTON_STYLES = `
.driver-popover.driverjs-theme {
  background-color: #0a0c10 !important;
  color: #f5f6f8 !important;
  border: 1px solid #262b38 !important;
  border-radius: 10px !important;
  padding: 18px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6) !important;
  max-width: 380px !important;
  font-family: var(--font-poppins), system-ui, -apple-system, sans-serif !important;
  z-index: 10000000 !important;
}

.driver-popover.driverjs-theme .driver-popover-title {
  font-size: 0.9375rem !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: -0.01em !important;
  color: #ffffff !important;
  margin-bottom: 6px !important;
}

.driver-popover.driverjs-theme .driver-popover-description {
  font-size: 0.8125rem !important;
  color: #a7adbb !important;
  line-height: 1.55 !important;
  margin-bottom: 14px !important;
}

.driver-popover.driverjs-theme .driver-popover-footer {
  margin-top: 10px !important;
  padding-top: 10px !important;
  border-top: 1px solid #262b38 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.driver-popover.driverjs-theme .driver-popover-progress-text {
  font-size: 0.6875rem !important;
  font-weight: 700 !important;
  color: #7d8493 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

.driver-popover.driverjs-theme .driver-popover-btn-group {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
}

.driver-popover.driverjs-theme .driver-popover-next-btn {
  background-color: #e03e3e !important;
  color: #ffffff !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 6px 14px !important;
  font-size: 0.6875rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  text-shadow: none !important;
  cursor: pointer !important;
  transition: background-color 150ms ease !important;
}

.driver-popover.driverjs-theme .driver-popover-next-btn:hover {
  background-color: #c93434 !important;
}

.driver-popover.driverjs-theme .driver-popover-prev-btn {
  background-color: transparent !important;
  color: #a7adbb !important;
  border: 1px solid #262b38 !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-size: 0.6875rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  cursor: pointer !important;
  transition: all 150ms ease !important;
}

.driver-popover.driverjs-theme .driver-popover-prev-btn:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

.driver-popover.driverjs-theme .driver-popover-close-btn {
  color: #7d8493 !important;
  top: 12px !important;
  right: 12px !important;
}

.driver-popover.driverjs-theme .driver-popover-close-btn:hover {
  color: #ffffff !important;
}

.driver-popover.driverjs-theme .driver-popover-arrow-side-left {
  border-right-color: #0a0c10 !important;
}
.driver-popover.driverjs-theme .driver-popover-arrow-side-right {
  border-left-color: #0a0c10 !important;
}
.driver-popover.driverjs-theme .driver-popover-arrow-side-top {
  border-bottom-color: #0a0c10 !important;
}
.driver-popover.driverjs-theme .driver-popover-arrow-side-bottom {
  border-top-color: #0a0c10 !important;
}
`;

export function useAdminTours(): {
  startCarreVertTour: () => void;
  startMembersTour: () => void;
  startEventsTour: () => void;
  startEquipementsTour: () => void;
  startStatisticsTour: () => void;
  startTracesTour: () => void;
  startSondagesTour: () => void;
} {
  useEffect(() => {
    const styleId = 'driver-peloton-custom-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = DRIVER_PELOTON_STYLES;
      document.head.appendChild(styleEl);
    }
  }, []);

  const createDriver = useCallback(
    (steps: Array<{ element: string; popover: { title: string; description: string; side?: 'top' | 'bottom' | 'left' | 'right'; align?: 'start' | 'center' | 'end' } }>): Driver => {
      return driver({
        showProgress: true,
        animate: true,
        popoverClass: 'driverjs-theme',
        nextBtnText: 'Suivant →',
        prevBtnText: '← Précédent',
        doneBtnText: 'Compris ✓',
        progressText: 'Étape {{current}} sur {{total}}',
        steps,
      });
    },
    []
  );

  // 1. Carré Vert Tour
  const startCarreVertTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#carre-vert-header',
        popover: {
          title: 'Le Carré Vert & Challenge d’Assiduité',
          description:
            'Bienvenue sur l’espace de gestion du Carré Vert ! C’est le classement annuel récompensant l’assiduité des cyclistes de Blanmont.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#carre-vert-sync-btn',
        popover: {
          title: 'Synchronisation & Scraping Excel / Google Sheets',
          description:
            'Ce bouton lance le scraping immédiat du tableur officiel du club. Un cron automatique (/api/cron/sync-leaderboard) synchronise également les données en tâche de fond.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#carre-vert-events-list',
        popover: {
          title: 'Sélection des Sorties Officielles',
          description:
            'Cliquez sur une date de sortie pour afficher la liste des membres et pointer les présences du peloton.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#carre-vert-attendance-panel',
        popover: {
          title: 'Pointage des Présences par Groupe',
          description:
            'Cochez les membres présents lors de la sortie. Chaque présence validée incrémente automatiquement d’un point le classement public du Carré Vert.',
          side: 'left',
          align: 'start',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 2. Membres Tour
  const startMembersTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#members-header-section',
        popover: {
          title: 'Annuaire des Membres',
          description:
            'Consultez et administrez la liste de tous les cyclistes inscrits au CC Saint-Martin Blanmont.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#members-search-bar',
        popover: {
          title: 'Recherche Instantanée',
          description:
            'Filtrez en direct les cyclistes par nom, prénom, adresse email ou rôle (Président, Trésorier, Capitaine, etc.).',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#members-new-btn',
        popover: {
          title: 'Ajouter un Membre',
          description:
            'Créez un nouveau compte cycliste avec son nom, adresse email, mot de passe initial et rôles au sein du club.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#members-table-section',
        popover: {
          title: 'Gestion des Profils & Sécurité',
          description:
            'Modifiez les informations du cycliste, réinitialisez son mot de passe en un clic grâce à la clé, ou supprimez son compte si nécessaire.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 3. Événements Tour
  const startEventsTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#events-header-section',
        popover: {
          title: 'Calendrier Officiel des Sorties',
          description:
            'Gérez le programme des sorties hebdomadaires du samedi et dimanche, les brevets régionaux et les événements spéciaux du club.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#events-import-pdf-btn',
        popover: {
          title: 'Importation Automatique PDF',
          description:
            'Ingérez en 1 clic l’intégralité du calendrier annuel officiel via notre extracteur de fichiers PDF intelligent.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#events-new-btn',
        popover: {
          title: 'Création d’une Sortie Manuelle',
          description:
            'Ajoutez ponctuellement une sortie avec date, lieu de rendez-vous, horaire de départ, distances et lien vers la trace GPS.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#events-table-section',
        popover: {
          title: 'Liste des Sorties Programmées',
          description:
            'Consultez vos sorties avec la trace GPS associée. Les membres synchronisent ces sorties directement sur leur calendrier Apple/Google.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 4. Équipements Tour
  const startEquipementsTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#equipements-header-section',
        popover: {
          title: 'Catalogue des Équipements Gobik',
          description:
            'Gérez le vestiaire officiel du CC Saint-Martin Blanmont : maillots été/hiver, cuissards, vestes coupe-vent et accessoires.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#equipements-search-filter',
        popover: {
          title: 'Recherche & Filtrage par Catégorie',
          description:
            'Filtrez facilement les articles par catégorie (Maillots, Cuissards, Vestes, Accessoires) ou par mot-clé.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#equipements-new-btn',
        popover: {
          title: 'Ajouter un Article au Catalogue',
          description:
            'Enregistrez une nouvelle tenue avec photo, prix, description et stocks initiaux par taille (XS à 2XL).',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#equipements-grid-section',
        popover: {
          title: 'Inventaire & État des Stocks',
          description:
            'Visualisez le stock disponible par taille pour chaque vêtement et mettez à jour les quantités en cas de réassort.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 5. Statistiques Tour
  const startStatisticsTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#stats-header-section',
        popover: {
          title: 'Statistiques & Performance du Club',
          description:
            'Visualisez les indicateurs d’activité globale, l’assiduité des pelotons et les bilans kilométriques de la saison.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#stats-cards-section',
        popover: {
          title: 'Indicateurs Clés de la Saison',
          description:
            'Chiffres consolidés : nombre total de sorties organisées, participation cumulée, moyenne de cyclistes par session.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#stats-charts-section',
        popover: {
          title: 'Graphiques d’Évolution & Groupes',
          description:
            'Analysez la répartition de l’affluence selon les groupes de niveau (A, B, C, VTT) et la progression au fil des mois.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 6. Traces GPS Tour
  const startTracesTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#traces-header-section',
        popover: {
          title: 'Bibliothèque des Parcours GPS',
          description:
            'Gérez le patrimoine de traces du club : routes d’entraînement, boucles vallonnées et parcours officiels avec profil altimétrique.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#traces-action-grid',
        popover: {
          title: 'Passerelles d’Importation & Création',
          description:
            'Importez des fichiers .GPX depuis Garmin/Wahoo, synchronisez vos activités Strava, ou créez un itinéraire personnalisé manuellement.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#traces-info-section',
        popover: {
          title: 'Compatibilité GPS & Sondages',
          description:
            'Toutes les traces publiées sont téléchargeables en 1 clic au format GPX par les membres et peuvent être reliées au sondage du weekend.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 7. Sondages Tour
  const startSondagesTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#sondages-header-section',
        popover: {
          title: 'Sondages de Présence du Weekend',
          description:
            'Gérez le rituel hebdomadaire du club : sonder les disponibilités des cyclistes, composer les groupes et désigner les capitaines.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#sondages-new-btn',
        popover: {
          title: 'Lancer le Sondage de la Semaine',
          description:
            'Créez le sondage hebdomadaire (idéalement le mardi). Les membres votent sur /sondage pour le samedi, dimanche ou les deux.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#sondages-overview-cards',
        popover: {
          title: 'Participation en Direct',
          description:
            'Consultez en temps réel le nombre de participants inscrits pour le weekend et le lien vers la vue publique des membres.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#sondages-list-section',
        popover: {
          title: 'Historique des Sondages & Synthèse WhatsApp',
          description:
            'Gérez le cycle de vie (Actif / Clôturé) et ouvrez la fiche de synthèse pour exporter en 1 clic le récapitulatif formaté sur WhatsApp.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  return {
    startCarreVertTour,
    startMembersTour,
    startEventsTour,
    startEquipementsTour,
    startStatisticsTour,
    startTracesTour,
    startSondagesTour,
  };
}
