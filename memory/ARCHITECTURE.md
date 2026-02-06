# Architecture de l'Application Blanmont

## Vue d'ensemble

Application web Next.js pour le club de course Blanmont, avec système de blog, gestion de membres, événements et traces GPS.

## Stack Technique

### Frontend

- **Framework**: Next.js 16.0.8 (App Router + Turbopack)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Cartes**: Leaflet + React-Leaflet
- **Éditeur**: Tiptap (WYSIWYG pour blog)

### Backend & Services

#### Base de Données & Auth

- **Firebase Realtime Database**: Données structurées (blog posts, événements)
- **Firebase Authentication**: Authentification utilisateurs (Google OAuth)
- **Firebase Admin SDK**: Opérations serveur, custom claims

#### Stockage d'Images

- **Cloudinary**: Stockage et optimisation d'images
  - Cloud Name: `dizy3s5zh`
  - Plan gratuit: 25GB stockage + CDN
  - Remplace: Firebase Storage (nécessitait carte bancaire)

#### Intégrations Externes

- **Notion API**: Base de données pour membres, feedback, votes, traces
  - Members DB: `2c59555c677980e4a7cbdd87005190af`
  - Feedback DB: `2c59555c67798091b36af021b943e357`
  - Votes DB: `2cd9555c677980949c4cf10d9fde3aab`
  - Traces DB: `1e855e153a2c456283e26c77052d27a3`
- **Strava API**: Import de traces GPS
  - Client Secret: Configuré dans `.env.local`

## Structure du Projet

```
blanmont/
├── app/
│   ├── api/                    # API Routes
│   │   ├── admin/             # Routes admin (blog, membres, etc.)
│   │   ├── auth/              # Authentication callbacks
│   │   ├── feedback/          # Système de feedback
│   │   ├── notion/            # Intégrations Notion
│   │   ├── strava/            # Intégrations Strava
│   │   └── upload/            # ⭐ Upload d'images (Cloudinary)
│   ├── admin/                 # Interface Admin
│   │   ├── blog/             # Gestion du blog
│   │   ├── events/           # Gestion des événements
│   │   ├── members/          # Gestion des membres
│   │   ├── statistics/       # Statistiques
│   │   └── traces/           # 🆕 Gestion des traces GPS
│   ├── components/           # Composants réutilisables
│   │   ├── blog/            # Composants blog
│   │   ├── layout/          # Layout (Navbar, Footer)
│   │   └── ui/              # Composants UI génériques
│   ├── hooks/               # Custom React Hooks
│   │   └── useImageUpload.ts # ⭐ Hook d'upload Cloudinary
│   ├── lib/                 # Utilitaires
│   │   ├── firebase/       # Config Firebase (client + admin)
│   │   └── notion/         # Client Notion
│   ├── blog/               # Pages blog publiques
│   ├── events/             # Pages événements
│   ├── import/             # Pages import (Strava, GPX)
│   ├── profile/            # Profil utilisateur
│   └── traces/             # Pages traces GPS
├── memory/                 # 📚 Documentation du projet
│   ├── CLOUDINARY_MIGRATION.md  # Migration Firebase → Cloudinary
│   └── README.md          # Notes d'architecture (ce fichier)
├── public/                # Assets statiques
├── scripts/               # Scripts utilitaires
│   ├── configure-cors.ts # (Obsolète - Firebase Storage)
│   └── verify-claims.ts  # Vérification des claims Firebase
└── .env.local            # Variables d'environnement (non commité)
```

## Flux de Données

### Authentification

```
User → Google OAuth → Firebase Auth → Custom Claims (Admin/WebMaster)
                                    ↓
                              AdminGuard vérifie le rôle
                                    ↓
                         Accès aux routes /admin/*
```

### Upload d'Images (Blog)

```
User sélectionne image → useImageUpload hook
                              ↓
                    POST /api/upload (FormData)
                              ↓
                    Conversion en Base64
                              ↓
                    Cloudinary Upload API
                              ↓
                    Retour URL publique
                              ↓
                    Affichage dans le blog
```

### Gestion du Blog

```
Admin crée post → Form (title, content, coverImage)
                       ↓
                POST /api/admin/blog
                       ↓
          Firebase Realtime Database
                       ↓
          Affichage public sur /blog
```

### Gestion des Membres

```
Admin → Notion API → Members Database
                         ↓
              Sync vers Firebase (optionnel)
                         ↓
              Affichage sur le site
```

## Sécurité

### Authentification & Autorisation

- **Routes publiques**: `/`, `/blog`, `/events`, `/traces`
- **Routes protégées**: `/admin/*`, `/profile`
- **Vérification**: `AdminGuard` component
- **Custom Claims**: `admin: true` dans Firebase Auth

### Secrets Management

```
.env.local (JAMAIS commité)
├── FIREBASE_SERVICE_ACCOUNT_KEY    # Admin SDK (serveur only)
├── CLOUDINARY_API_SECRET            # Upload API (serveur only)
├── NOTION_TOKEN                     # Notion API (serveur only)
└── STRAVA_CLIENT_SECRET             # Strava OAuth (serveur only)

Variables publiques (NEXT_PUBLIC_*)
├── NEXT_PUBLIC_FIREBASE_API_KEY     # Client Firebase
├── NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME # Cloudinary public ID
└── NEXT_PUBLIC_FIREBASE_PROJECT_ID   # Firebase config
```

### Upload Security

- Upload limité aux utilisateurs Admin (via `/admin/*` routes)
- Validation côté serveur (taille, type)
- Upload via API route (pas d'exposition des secrets)

## Déploiement

### Environnements

- **Développement**: `http://localhost:3000`
- **Production**: Firebase Hosting (à configurer)

### Build

```bash
npm run build
```

### Variables d'environnement requises (Production)

- Toutes les variables de `.env.local`
- Configurer dans Firebase Hosting ou Vercel

## Gestion des Traces GPS

### Sources

1. **Upload manuel**: Admin → Form → Firebase
2. **Import Strava**: OAuth → Strava API → Firebase
3. **Upload GPX**: Fichier → Parser → Firebase

### Stockage

- **Métadonnées**: Notion Database (`traces_db_id`)
- **Fichiers GPX**: À définir (Cloudinary ou Firebase Storage)
- **Affichage**: Leaflet maps sur `/traces`

## Performance

### Optimisations Images

- **Cloudinary CDN**: Distribution globale
- **Auto-format**: WebP pour navigateurs supportés
- **Responsive**: Plusieurs tailles générées automatiquement
- **Lazy loading**: Images chargées à la demande

### Caching

- Next.js App Router cache automatique
- Firebase SDK cache local
- CDN Cloudinary cache edge

## Monitoring & Logs

### Cloudinary Dashboard

- Stockage utilisé / 25GB
- Bande passante
- Nombre d'uploads

### Firebase Console

- Nombre d'utilisateurs authentifiés
- Lecture/écriture database
- Erreurs Auth

### Analytics (à implémenter)

- Google Analytics ou Vercel Analytics
- Suivi des pages les plus visitées
- Tracking des uploads d'images

## Améliorations Futures

### Court Terme

- [ ] Tests E2E (Playwright)
- [ ] Migration `<img>` → `next/image`
- [ ] Optimisation Cloudinary (transformations auto)
- [ ] Gestion de la suppression d'images

### Moyen Terme

- [ ] Progressive Web App (PWA)
- [ ] Notification push (événements)
- [ ] Mode offline (Service Worker)
- [ ] Export de traces en GPX

### Long Terme

- [ ] Application mobile (React Native)
- [ ] API publique pour les traces
- [ ] Système de commentaires sur le blog
- [ ] Intégration Garmin Connect

## Dépendances Critiques

```json
{
  "next": "16.0.8",
  "react": "^19.0.0",
  "firebase": "^11.2.0",
  "firebase-admin": "^13.0.2",
  "cloudinary": "^2.x",
  "@notionhq/client": "^2.2.15",
  "leaflet": "^1.9.4",
  "@tiptap/react": "^2.10.4"
}
```

## Support

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Notion API](https://developers.notion.com)

### Migration Notes

Voir `memory/CLOUDINARY_MIGRATION.md` pour détails sur:

- Migration Firebase Storage → Cloudinary
- Raisons de la migration
- Fichiers modifiés
- Tests post-migration

---

**Dernière mise à jour**: 06/02/2026
**Mainteneur**: Nicolas (EXU968)
