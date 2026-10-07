'use client';

import { useEffect, useCallback } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Custom CSS for Driver.js styled with La Feuille de Blanmont aesthetic
export const DRIVER_PELOTON_STYLES = `
.driver-popover.driverjs-theme {
  background-color: #0d1013 !important;
  color: #eef1f4 !important;
  border: 1px solid #28303a !important;
  border-radius: 4px !important;
  padding: 18px !important;
  box-shadow: 0 20px 25px -5px #0d1013 !important;
  max-width: min(380px, calc(100vw - 32px)) !important;
  font-family: var(--font-archivo), ui-sans-serif, system-ui, sans-serif !important;
  z-index: 10000000 !important;
}

.driver-popover.driverjs-theme .driver-popover-title {
  font-size: 1rem !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: -0.01em !important;
  color: #ffffff !important;
  margin-bottom: 6px !important;
}

.driver-popover.driverjs-theme .driver-popover-description {
  font-size: 0.75rem !important;
  color: #9aa3ad !important;
  line-height: 1.55 !important;
  margin-bottom: 14px !important;
}

.driver-popover.driverjs-theme .driver-popover-footer {
  margin-top: 10px !important;
  padding-top: 10px !important;
  border-top: 1px solid #28303a !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.driver-popover.driverjs-theme .driver-popover-progress-text {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #5c6069 !important;
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
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  text-shadow: none !important;
  cursor: pointer !important;
  transition: background-color 150ms ease !important;
}

.driver-popover.driverjs-theme .driver-popover-next-btn:hover {
  background-color: #b82b2b !important;
}

.driver-popover.driverjs-theme .driver-popover-prev-btn {
  background-color: transparent !important;
  color: #9aa3ad !important;
  border: 1px solid #28303a !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  cursor: pointer !important;
  transition: all 150ms ease !important;
}

.driver-popover.driverjs-theme .driver-popover-prev-btn:hover {
  background-color: #151a1f !important;
  color: #ffffff !important;
}

.driver-popover.driverjs-theme .driver-popover-close-btn {
  color: #5c6069 !important;
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
  startDashboardTour: () => void;
  startCarreVertTour: () => void;
  startMembersTour: () => void;
  startEventsTour: () => void;
  startEquipementsTour: () => void;
  startStatisticsTour: () => void;
  startTracesTour: () => void;
  startSondagesTour: () => void;
  startPointageExpressTour: () => void;
  startProspectsTour: () => void;
  startGalerieTour: () => void;
  startHeroTour: () => void;
  startSettingsTour: () => void;
  startMemberPhotosTour: () => void;
  startBlogTour: () => void;
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
      // Resilient check: filter out steps whose DOM targets do not exist in the current viewport
      const validSteps = steps.filter((step) => {
        if (!step.element) return true;
        try {
          return typeof document !== 'undefined' && Boolean(document.querySelector(step.element));
        } catch {
          return false;
        }
      });

      return driver({
        showProgress: true,
        animate: true,
        popoverClass: 'driverjs-theme',
        nextBtnText: 'Suivant →',
        prevBtnText: '← Précédent',
        doneBtnText: 'Compris ✓',
        progressText: 'Étape {{current}} sur {{total}}',
        steps: validSteps.length > 0 ? validSteps : steps,
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

  // 8. Dashboard / Quartier Général Tour
  const startDashboardTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#onboarding-guide-heading',
        popover: {
          title: 'Guide de Prise en Main & Rituels',
          description:
            'Bienvenue au Quartier Général ! Ce guide interactif vous aide à vérifier les étapes clés (sondage hebdomadaire, calendrier, annuaire).',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#peloton-command-heading',
        popover: {
          title: 'Poste de Commandement du Peloton',
          description:
            'Retrouvez en direct la sortie du weekend, les inscrits confirmés et la répartition par allure (Groupe A, B, C, VTT).',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#peloton-briefing-btn',
        popover: {
          title: 'Générateur de Briefing WhatsApp',
          description:
            'En 1 clic, générez et copiez dans le presse-papiers le message officiel formaté avec émojis, heure de rassemblement et trace GPX.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#quick-ops-heading',
        popover: {
          title: 'Rituels & Actions Rapides',
          description:
            'Accédez instantanément au Pointage Express départ, au classement Carré Vert, aux équipements Gobik et aux albums photos.',
          side: 'left',
          align: 'start',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 9. Pointage Express Tour
  const startPointageExpressTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#pointage-express-header',
        popover: {
          title: 'Pointage Express Mobile',
          description:
            'L’interface conçue pour les capitaines de route sur le terrain (Place de la Féchère) le samedi et dimanche matin avant le départ.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#express-event-select',
        popover: {
          title: 'Sélection de la Sortie',
          description:
            'Le sélecteur se positionne par défaut sur la sortie du jour. Vous pouvez aussi choisir une sortie à venir ou passée.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#express-member-search',
        popover: {
          title: 'Recherche Rapide & Filtres',
          description:
            'Tapez le nom ou GSM d’un coureur ou filtrez par peloton (Tous, Pointés, Non pointés, A, B, C, VTT).',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#pointage-express-roster',
        popover: {
          title: 'Émargement 1-Tap & Secours ICE',
          description:
            'Touchez la case d’un cycliste pour valider sa présence au départ. En cas d’accident, touchez le bouclier pour afficher sa licence FFBC et contacter son proche.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 10. Prospects / Sorties d'Essai Tour
  const startProspectsTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#prospects-header-section',
        popover: {
          title: 'CRM Candidatures & Sorties d’Essai',
          description:
            'Suivi des demandes d’essai soumises en ligne via /rejoindre par de nouveaux cyclistes souhaitant tester le club.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#prospects-stats-cards',
        popover: {
          title: 'Indicateurs de Recrutement',
          description:
            'Visualisez les nouveaux candidats à contacter d’urgence, les coureurs en phase d’essai (jusqu’à 3 sorties) et les adhésions validées.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#prospects-table-section',
        popover: {
          title: 'Pipeline & Parrainage Capitaine',
          description:
            'Ouvrez un dossier candidat pour lui assigner un capitaine mentor, noter ses retours de sortie et le convertir en membre officiel.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 11. Galerie Photos Tour
  const startGalerieTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#galerie-header-section',
        popover: {
          title: 'Galeries Photos & Chroniques',
          description:
            'Conservez et partagez les photos des sorties du weekend, des brevets, des stages en Ardennes et des événements club.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#galerie-search-filter',
        popover: {
          title: 'Recherche & Tri par Saison',
          description:
            'Filtrez vos albums par mot-clé (lieu, type de sortie) ou sélectionnez une saison spécifique (2024, 2025, 2026).',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#galerie-table-section',
        popover: {
          title: 'Gestion des Albums & Liens HD',
          description:
            'Téléversez une photo de couverture paysage 16:9, reliez un album externe Google Photos/Flickr et mettez un album « à la une » sur l’accueil.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 12. Hero Banner Tour
  const startHeroTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#hero-header-section',
        popover: {
          title: 'Bannière d’Accueil & Diaporama',
          description:
            'Gérez les photos du carrousel de la page d’accueil, l’alignement visuel des visages et les cartouches de données sous l’image.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#hero-preview-section',
        popover: {
          title: 'Aperçu en Direct WYSIWYG',
          description:
            'Observez le rendu temps réel de votre bannière au format panoramique 21:9 cinéma tel qu’il apparaît pour les visiteurs du site.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#hero-slides-section',
        popover: {
          title: 'Slider Photos & Outil de Recadrage',
          description:
            'Ajoutez des photos, callez la position verticale (visages ou vélos) ou recadrez directement au ratio 21:9 avec le module intégré.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#hero-telemetry-section',
        popover: {
          title: 'Cartouches Télémétriques',
          description:
            'Personnalisez les 4 blocs de données clés affichés sous la photo : lieu de départ, dates, groupes d’allure et challenge Carré Vert.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 13. Paramètres Tour
  const startSettingsTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#settings-header-section',
        popover: {
          title: 'Configuration & Charte du Club',
          description:
            'Personnalisez le thème d’affichage et consultez les paramètres officiels d’identité et de sécurité du CC Saint-Martin Blanmont.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#settings-theme-section',
        popover: {
          title: 'Thèmes & Confort Visuel',
          description:
            'Basculez entre le Mode Clair (Day Map Paper) pour les sorties ensoleillées et le Mode Sombre (Feuille Nocturne) pour la gestion du soir.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#settings-club-identity-section',
        popover: {
          title: 'Identité & Spécifications Cartographiques',
          description:
            'Coordonnées géodésiques IGN du club (50°37′23″ N · 4°38′32″ E), typographie Google Archivo et palette des 5 encres cartographiques.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#settings-federation-section',
        popover: {
          title: 'Règles Fédérales & Sécurité Pelotons',
          description:
            'Rappel de la réglementation FFBC et code de la route belge (peloton limité à 15 coureurs, casque obligatoire, fiches secours ICE).',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 14. Portraits & Cadrage Tour
  const startMemberPhotosTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#member-photos-header-section',
        popover: {
          title: 'Trombinoscope & Cadrage Portraits',
          description:
            'Ajustez le positionnement des visages des membres pour un affichage parfait dans les cercles d’avatars et le trombinoscope public.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#member-photos-controls-bar',
        popover: {
          title: 'Recherche & Filtres par Rôle',
          description:
            'Filtrez instantanément les coureurs avec ou sans photo, le Bureau, les Capitaines, ou recherchez un membre par nom.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#member-photos-grid-section',
        popover: {
          title: 'Alignement Vertical & Cadrage Fin',
          description:
            'Ajustez le curseur vertical de chaque portrait (Haut, Centre, Bas) avec prévisualisation en direct dans le médaillon circulaire.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  // 15. Blog & Chroniques Tour
  const startBlogTour = useCallback((): void => {
    const d = createDriver([
      {
        element: '#blog-header-section',
        popover: {
          title: 'Les News & Chroniques du Club',
          description:
            'Bienvenue dans l’espace de rédaction ! C’est ici que vous gérez les articles, annonces officielles et récits de sorties du CC Saint-Martin Blanmont.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#blog-new-btn',
        popover: {
          title: 'Créer un Nouvel Article',
          description:
            'Cliquez ici pour ouvrir l’éditeur et rédiger un article. Vous pourrez ajouter un titre, un extrait, une image de couverture et formater votre texte.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#blog-tutorial-btn',
        popover: {
          title: 'Centre d’Aide & Tutoriel',
          description:
            'Ce bouton ouvre le guide complet avec les bonnes pratiques d’écriture, les catégories recommandées et la syntaxe pour enrichir vos textes.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#blog-table-section',
        popover: {
          title: 'Liste des Articles & Statuts',
          description:
            'Consultez vos articles avec leur date, catégorie et statut (En ligne ou Brouillon). Utilisez les icônes à droite pour prévisualiser, modifier ou supprimer.',
          side: 'top',
          align: 'center',
        },
      },
    ]);
    d.drive();
  }, [createDriver]);

  return {
    startDashboardTour,
    startCarreVertTour,
    startMembersTour,
    startEventsTour,
    startEquipementsTour,
    startStatisticsTour,
    startTracesTour,
    startSondagesTour,
    startPointageExpressTour,
    startProspectsTour,
    startGalerieTour,
    startHeroTour,
    startSettingsTour,
    startMemberPhotosTour,
    startBlogTour,
  };
}
