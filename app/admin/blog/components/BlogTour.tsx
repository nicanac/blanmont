'use client';

import { useEffect, useCallback } from 'react';
import { driver, Driver } from 'driver.js';
import 'driver.js/dist/driver.css';

// Custom CSS for Driver.js styled with Editorial Peloton aesthetic
const TOUR_STYLES = `
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

export function useBlogTour(): {
  startDashboardTour: () => void;
  startEditorTour: () => void;
} {
  useEffect(() => {
    // Inject stylesheet once
    const styleId = 'driver-peloton-custom-styles';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = TOUR_STYLES;
      document.head.appendChild(styleEl);
    }
  }, []);

  const startDashboardTour = useCallback((): void => {
    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'driverjs-theme',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Compris ✓',
      progressText: 'Étape {{current}} sur {{total}}',
      steps: [
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
      ],
    });

    driverObj.drive();
  }, []);

  const startEditorTour = useCallback((): void => {
    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      popoverClass: 'driverjs-theme',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Prêt à rédiger ✓',
      progressText: 'Étape {{current}} sur {{total}}',
      steps: [
        {
          element: '#post-title-field',
          popover: {
            title: '1. Le Titre de l’Article',
            description:
              'Donnez un titre clair et percutant (ex. "Sortie patrimoine en Brabant wallon" ou "Nouveaux équipements club").',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#post-category-field',
          popover: {
            title: '2. La Catégorie',
            description:
              'Classez votre article parmi les thématiques officielles : Actualités, Récits de sortie, Conseils, Événements ou Annonces.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#post-excerpt-field',
          popover: {
            title: '3. L’Extrait (Chapeau)',
            description:
              'Rédigez un court résumé de 1 à 2 phrases. C’est le texte d’accroche visible sur la page d’accueil et les réseaux.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#post-cover-field',
          popover: {
            title: '4. Image de Couverture',
            description:
              'Glissez-déposez une photo de sortie ou collez une URL. Une belle image attire immédiatement l’œil des cyclistes !',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#post-content-field',
          popover: {
            title: '5. Éditeur Riche & Formatage',
            description:
              'Composez votre récit avec la barre d’outils : titres H2/H3, listes à puces, liens hypertextes et photos dans le corps de texte.',
            side: 'top',
            align: 'center',
          },
        },
        {
          element: '#post-status-field',
          popover: {
            title: '6. Statut de Publication',
            description:
              'Cochez "Publier immédiatement" pour mettre en ligne, ou décochez pour enregistrer en tant que brouillon et finaliser plus tard.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#post-submit-button',
          popover: {
            title: '7. Enregistrer & Publier',
            description:
              'Cliquez sur ce bouton pour sauvegarder votre article. Il sera instantanément visible par tous les membres du club !',
            side: 'top',
            align: 'end',
          },
        },
      ],
    });

    driverObj.drive();
  }, []);

  return {
    startDashboardTour,
    startEditorTour,
  };
}
