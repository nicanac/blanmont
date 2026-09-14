import React from 'react';

/**
 * LocalClubJsonLd Component
 * Generates Schema.org SportsClub & SportsActivityLocation structured data
 * for local and GEO SEO targeting Walloon Brabant (Chastre, Blanmont, Ottignies, Gembloux, Wavre).
 */
export default function LocalClubJsonLd(): React.ReactElement {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['SportsClub', 'SportsActivityLocation'],
        '@id': 'https://cc-blanmont.be/#sportsclub',
        name: 'Cyclo Club Saint-Martin Blanmont',
        alternateName: ['CC Saint-Martin Blanmont', 'Cyclo Blanmont'],
        description:
          'Club de cyclisme sur route et VTT basé à Blanmont (Chastre, Brabant Wallon). Sorties hebdomadaires encadrées le samedi et dimanche matin en 3 groupes de niveau (A, B, C). Affilié FFBC.',
        url: 'https://cc-blanmont.be',
        telephone: '+32 470 00 00 00',
        sport: ['Road Cycling', 'Cyclisme sur route', 'VTT', 'Gravel'],
        logo: 'https://cc-blanmont.be/logo.png',
        image: 'https://cc-blanmont.be/images/peloton-hero.jpg',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Place de Blanmont',
          addressLocality: 'Chastre',
          postalCode: '1450',
          addressRegion: 'Brabant Wallon',
          addressCountry: 'BE',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 50.6087,
          longitude: 4.6738,
        },
        areaServed: [
          { '@type': 'AdministrativeArea', name: 'Chastre' },
          { '@type': 'AdministrativeArea', name: 'Blanmont' },
          { '@type': 'AdministrativeArea', name: 'Mont-Saint-Guibert' },
          { '@type': 'AdministrativeArea', name: 'Ottignies-Louvain-la-Neuve' },
          { '@type': 'AdministrativeArea', name: 'Gembloux' },
          { '@type': 'AdministrativeArea', name: 'Walhain' },
          { '@type': 'AdministrativeArea', name: 'Villers-la-Ville' },
          { '@type': 'AdministrativeArea', name: 'Wavre' },
          { '@type': 'AdministrativeArea', name: 'Brabant Wallon' },
        ],
        parentOrganization: {
          '@type': 'SportsOrganization',
          name: 'Fédération Francophone Belge du Cyclotourisme (FFBC)',
          url: 'https://velo-liberte.be',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Adhésions et Sorties CC Blanmont',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Sortie Découverte Gratuite (3 sorties sans engagement)',
              price: '0.00',
              priceCurrency: 'EUR',
              url: 'https://cc-blanmont.be/rejoindre',
            },
            {
              '@type': 'Offer',
              name: 'Cotisation Annuelle Club 2026',
              price: '30.00',
              priceCurrency: 'EUR',
              url: 'https://cc-blanmont.be/rejoindre',
            },
          ],
        },
        potentialAction: {
          '@type': 'JoinAction',
          name: "Faire une sortie d'essai gratuite avec le club",
          target: 'https://cc-blanmont.be/rejoindre',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
