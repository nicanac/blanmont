/**
 * Seed script to populate the Firebase database with sample blog posts.
 *
 * Usage:
 *   npx tsx scripts/seed-blog.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { getAdminDatabase } from '../app/lib/firebase/admin';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorAvatar?: string;
  publishedAt: string;
  category: string;
  slug: string;
  isPublished: boolean;
}

const samplePosts: Omit<BlogPost, 'id'>[] = [
  {
    title: 'Les nouveaux maillots sont là !',
    excerpt:
      'Un grand merci à Fabian et Nicolas pour la gestion du projet et le redesign complet de la livrée. Le résultat est à la hauteur de nos ambitions.',
    content: `
# Les nouveaux maillots sont là !

C'est avec une grande fierté que nous vous présentons aujourd'hui les nouveaux maillots du club, prêts pour la saison 2026 !

Le travail de conception a été entièrement revu pour offrir une esthétique moderne et épurée, sans aucun compromis sur le confort thermique et la respirabilité des matériaux techniques.

## Un projet mené de main de maître

Un immense merci à **Fabian** et **Nicolas** pour le temps et l'énergie consacrés au redesign complet de la livrée, ainsi qu'au suivi rigoureux des commandes et des livraisons.

## Caractéristiques de la nouvelle tenue

- **Tissu aéro-respirant** adapté aux sorties estivales comme aux matinées fraîches.
- **Coupe ajustée et confortable** pour toutes les morphologies.
- **Poches arrière renforcées** avec passe-câble et éléments réfléchissants pour la sécurité.

Le résultat est à la hauteur de nos ambitions et nous avons hâte de voir le peloton aux couleurs du club sur toutes les routes de la région !
    `,
    coverImage: 'https://res.cloudinary.com/dizy3s5zh/image/upload/v1770491369/blog/uploads/2026-02-07-hydra.png',
    author: 'Nicolas Bruyere',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2026-02-04T15:55:59.124Z',
    category: 'Actualités',
    slug: 'les-nouveaux-maillots-sont-la',
    isPublished: true,
  },
  {
    title: 'Rassemblement printanier : le club au grand complet sous le soleil',
    excerpt:
      'Retour sur notre grand rassemblement de début de saison : une belle mobilisation de tous les groupes sous un magnifique ciel bleu et les cerisiers en fleurs.',
    content: `
# Rassemblement printanier : le club au grand complet sous le soleil

Le printemps marque le véritable coup d'envoi des sorties de groupe pour le Blanmont Cycling Club. Quel bonheur de retrouver autant de membres réunis au départ pour cette sortie inaugurale !

## Une participation record

Du groupe cyclotourisme aux coureurs les plus affûtés, tout le monde a répondu présent. Les vélos fraîchement préparés, les sourires sur tous les visages et les cerisiers en fleurs offraient un cadre idéal pour lancer cette nouvelle saison.

## Organisation et esprit d'équipe

- **Constitution des groupes de niveau** : Pour que chacun prenne du plaisir à sa propre allure.
- **Rappels des consignes de sécurité** : Respect du code de la route et communication fluide au sein du peloton.
- **Parcours panoramique** : Un tracé équilibré à travers le Brabant wallon avec des panoramas superbes.

Un grand merci à tous les participants pour leur bonne humeur communicative. La saison s'annonce d'ores et déjà exceptionnelle !
    `,
    coverImage: '/images/IMG_7627.JPG',
    author: 'Nicolas Bruyere',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-11-22T09:00:00Z',
    category: 'Événements',
    slug: 'rassemblement-printanier-club-au-grand-complet',
    isPublished: true,
  },
  {
    title: 'Sortie patrimoine : pause photo devant la chapelle brabançonne',
    excerpt:
      'Nos sorties dominicales sont aussi l\'occasion de découvrir les trésors architecturaux et chapelles de campagne qui font le charme de notre belle région.',
    content: `
# Sortie patrimoine : pause photo devant la chapelle brabançonne

Parcourir les routes du Brabant wallon, c'est aussi explorer son riche patrimoine rural et ses nombreux édifices historiques nichés au carrefour des chemins de campagne.

## Une boucle entre histoire et nature

Lors de notre sortie dominicale, le groupe s'est accordé une courte halte devant cette splendide chapelle en briques rouges. L'occasion idéale pour une photo souvenir de groupe sous un ciel d'azur parfait.

## Le cyclisme au cœur du territoire

Ces moments illustrent parfaitement l'esprit de notre club :
- **Découverte locale** : Arpenter des routes calmes et apprécier la diversité de nos paysages.
- **Cohésion et respect** : Partager l'effort et veiller à laisser notre environnement propre et préservé.
- **Convivialité** : Prendre le temps d'échanger et de savourer chaque kilomètre parcouru ensemble.

Retrouvez la trace GPX de cette boucle sur notre page dédiée aux parcours !
    `,
    coverImage: '/images/IMG_5777.JPG',
    author: 'Nicolas Bruyere',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-11-22T10:00:00Z',
    category: 'Récits de sortie',
    slug: 'sortie-patrimoine-pause-chapelle-brabanconne',
    isPublished: true,
  },
  {
    title: 'Conseils d\'entraînement pour réussir vos sorties longue distance',
    excerpt:
      'Gestion de l\'effort, hydratation et préparation mentale : toutes les clés pour franchir le cap des 100 kilomètres avec le sourire et sans coup de pompe.',
    content: `
# Conseils d'entraînement pour réussir vos sorties longue distance

Passer la barre des 100 km (ou préparer une longue cyclo) est un objectif majeur pour beaucoup de cyclistes. Voici nos conseils pratiques pour rouler longtemps tout en gardant le sourire.

## 1. Augmenter le volume avec progressivité

Inutile de doubler votre distance du jour au lendemain. Ajoutez 10 à 15 % de kilométrage par semaine pour permettre à vos articulations et à vos muscles de s'adapter sans risque de blessure.

## 2. La stratégie de ravitaillement

Sur le vélo, l'énergie se gère en amont :
- **Boire par petites gorgées** : Un bidon de 500 ml toutes les 1h à 1h30 (eau et électrolytes).
- **Manger régulièrement** : Dès la 45e minute, consommez 40 à 60g de glucides par heure (barres, bananes, pâtes de fruits).
- **Ne pas attendre la faim** : Quand la faim se fait sentir, la défaillance est déjà proche !

## 3. L'économie d'effort en peloton

Rouler en groupe permet d'économiser jusqu'à 30 % d'énergie :
- Restez bien abrité dans la roue de vos coéquipiers face au vent.
- Pédalez avec souplesse (cadence recommandée : 80 à 90 tr/min).
- Anticipez les relances et lissez vos accélérations.

À très vite sur les routes pour mettre tout cela en pratique !
    `,
    coverImage: '/images/6efc2d5e-2326-446d-98d8-47889f881454.jpg',
    author: 'Nicolas Bruyere',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-10-15T12:00:00Z',
    category: 'Conseils',
    slug: 'conseils-entrainement-sorties-longue-distance',
    isPublished: true,
  },
  {
    title: 'Les bienfaits du cyclisme et la magie du travail en peloton',
    excerpt:
      'Amélioration du cardio, renforcement musculaire et bien-être mental : découvrez pourquoi rouler régulièrement en groupe transforme votre condition physique.',
    content: `
# Les bienfaits du cyclisme et la magie du travail en peloton

Plus qu'un simple sport, le cyclisme sur route pratiqué en club est une activité complète aux effets bénéfiques durables pour le corps et l'esprit.

## Des vertus physiques incomparables

- **Santé cardiovasculaire** : Renforcement du muscle cardiaque, amélioration du souffle et diminution de la fréquence cardiaque au repos.
- **Protection des articulations** : Mouvement fluide et porté, sans choc pour les genoux, chevilles et hanches.
- **Endurance et tonicité** : Développement harmonieux du bas du corps et sollicitation des muscles posturaux (gainage).

## La force du collectif

Rouler au sein d'un peloton uni apporte une dimension unique :
- **Dépassement de soi** : Le rythme du groupe motive à repousser ses limites dans les ascensions.
- **Solidarité** : On s'attend au sommet des côtes, on s'encourage et on s'entraide en cas de pépin mécanique.
- **Déconnexion totale** : Quelques heures sur les petites routes suffisent pour évacuer tout le stress de la semaine.

Rejoignez nos entraînements du week-end pour vivre cette expérience sportive et humaine !
    `,
    coverImage: '/images/43c794a0-380b-46e6-9d9d-bdad069d8fb7.jpg',
    author: 'Nicolas Bruyere',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-11-22T08:00:00Z',
    category: 'Conseils',
    slug: 'bienfaits-cyclisme-travail-en-peloton',
    isPublished: true,
  },
  {
    title: 'La check-list du cycliste : l\'équipement indispensable pour rouler serein',
    excerpt:
      'Casque, éclairages, kit de dépannage et textile adapté : faites le point sur le matériel essentiel pour aborder chaque sortie en toute tranquillité.',
    content: `
# La check-list du cycliste : l'équipement indispensable pour rouler serein

Pour rouler l'esprit tranquille et parer à toutes les situations, voici la liste des éléments incontournables à vérifier avant chaque départ de sortie club.

## 1. Sécurité et visibilité

- **Casque homologué** : Obligatoire pour tous les membres du club. Ajustez correctement la molette et les sangles.
- **Éclairages avant et arrière** : Même par grand soleil, un feu arrière clignotant est un gage indispensable de sécurité.
- **Lunettes de soleil adaptées** : Indispensables contre les UV, le vent, les insectes et les projections de gravillons.

## 2. La sacoche de selle et le dépannage

Ne quittez jamais la maison sans :
- 2 chambres à air aux dimensions de vos pneus (ou kit mèches si tubeless).
- 2 démonte-pneus solides.
- Une mini-pompe efficace ou 2 cartouches de CO2 avec percuteur.
- Un multi-tool avec dérive-chaîne et maillon rapide compatible.

## 3. Hydratation et textile

- Deux bidons propres (eau et boisson isotonique).
- Un coupe-vent compact dans la poche centrale du maillot.
- Téléphone chargé, un moyen de paiement et votre carte d'identité.

Avec ce kit de base, vous êtes prêt pour des heures de pur plaisir sur votre monture !
    `,
    coverImage: '/images/IMG_8019.JPG',
    author: 'Nicolas Bruyere',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2023-05-18T14:00:00Z',
    category: 'Conseils',
    slug: 'checklist-cycliste-equipement-indispensable',
    isPublished: true,
  },
  {
    title: 'Après l\'effort, la convivialité : nos plus beaux circuits en Brabant wallon',
    excerpt:
      'Découvrez notre sélection de parcours à travers monts et vallées brabançonnes, et l\'ambiance chaleureuse d\'après-sortie qui fait l\'âme de notre club.',
    content: `
# Après l'effort, la convivialité : nos plus beaux circuits en Brabant wallon

Le cyclisme ne s'arrête pas au coup de pédale final ! Au Blanmont Cycling Club, la convivialité après la sortie est tout aussi sacrée que l'entraînement sur le vélo.

## Les parcours phares de notre région

Le Brabant wallon offre un relief varié idéal pour s'amuser et progresser :
- **La boucle de la Méhaigne (65 km - 650 m D+)** : Roulante au départ avec de superbes raidillons à mi-parcours.
- **Le circuit des Abbayes (45 km - 400 m D+)** : Parfait pour une récupération active ou une reprise progressive.
- **Le tour des Plateaux et Vallons (85 km - 900 m D+)** : Un tracé exigeant pour travailler le rythme et la puissance.

## Le moment de partage au local du club

Une fois les vélos rangés, rien ne remplace le plaisir de se retrouver ensemble pour :
- Refaire la sortie et commenter les anecdotes du jour.
- Planifier les prochaines sorties du calendrier et les grands événements de l'année.
- Partager un verre rafraîchissant dans une atmosphère amicale et détendue.

Toutes nos traces GPS sont disponibles en téléchargement libre sur notre site. Bonne route et à samedi prochain !
    `,
    coverImage: '/images/05ca4f92-29d6-43e0-9c6c-ee69d86ecd29.jpg',
    author: 'Nicolas Bruyere',
    authorAvatar: '/images/home-hero.jpg',
    publishedAt: '2024-09-20T10:00:00Z',
    category: 'Récits de sortie',
    slug: 'apres-effort-convivialite-plus-beaux-circuits-brabant-wallon',
    isPublished: true,
  },
];

async function seedBlogPosts() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
    console.error('Firebase configuration is missing. Please set environment variables.');
    process.exit(1);
  }

  try {
    const db = getAdminDatabase();
    console.log('Using Firebase Admin SDK.');

    console.log('Seeding / updating blog posts in Firebase...\n');

    const blogRef = db.ref('blog');

    // Overwrite the blog collection with the updated sample posts
    const postsMap: Record<string, BlogPost> = {};
    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i];
      const newPostRef = blogRef.push();
      const id = newPostRef.key!;
      postsMap[id] = {
        ...post,
        id,
      };
    }

    await blogRef.set(postsMap);

    console.log(`\n✅ Successfully seeded ${samplePosts.length} blog posts in French!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    process.exit(1);
  }
}

seedBlogPosts();
