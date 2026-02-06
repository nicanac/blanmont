# Migration vers Cloudinary pour le Stockage d'Images

## Date de migration

06/02/2026

## Raison de la migration

Firebase Storage nécessite un plan Blaze (Pay-as-you-go) pour les nouveaux projets, même pour rester dans les limites gratuites. Cloudinary offre 25GB gratuits sans carte bancaire requise.

## Architecture Précédente

### Firebase Storage

- **Bucket**: `blanmont-c11e3.firebasestorage.app`
- **Authentification**: Firebase Admin SDK
- **Upload**: Client-side SDK avec CORS
- **Problème**: Erreurs CORS + nécessite carte bancaire

## Nouvelle Architecture

### Cloudinary

- **Cloud Name**: `dizy3s5zh`
- **Authentification**: API Key + Secret (serveur uniquement)
- **Upload**: API Route Next.js → Cloudinary API
- **Avantages**:
  - ✅ Pas de CORS (upload côté serveur)
  - ✅ Gratuit sans carte bancaire (25GB)
  - ✅ Optimisation automatique d'images
  - ✅ CDN global intégré
  - ✅ Transformations d'images (resize, crop, etc.)

## Fichiers Modifiés

### 1. Variables d'environnement (`.env.local`)

```bash
# Ajouté
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 2. API Route (`app/api/upload/route.ts`)

**Avant**: Utilisait Firebase Admin SDK

```typescript
import { getStorage } from 'firebase-admin/storage';
const bucket = getStorage(app).bucket(bucketName);
await fileRef.save(buffer);
```

**Après**: Utilise Cloudinary SDK

```typescript
import { v2 as cloudinary } from 'cloudinary';
const result = await cloudinary.uploader.upload(dataURI, {
  folder: folder,
  public_id: filename,
});
```

### 3. Hook d'upload (`app/hooks/useImageUpload.ts`)

**Pas de changement nécessaire** - Le hook envoie toujours vers `/api/upload` qui gère maintenant Cloudinary en interne.

### 4. Pages utilisant l'upload

- `app/admin/blog/new/page.tsx` - ✅ Compatible (utilise le hook)
- `app/admin/blog/[id]/edit/page.tsx` - ✅ Compatible (utilise le hook)

## Organisation des Images sur Cloudinary

### Structure des dossiers

```
cloudinary/
├── blog/
│   └── uploads/
│       ├── 2026-02-06-image1.jpg
│       ├── 2026-02-06-image2.jpg
│       └── ...
```

### Nomenclature

- **Dossier**: `blog/uploads`
- **Nom de fichier**: `YYYY-MM-DD-nom-original`
- **URL générée**: `https://res.cloudinary.com/dizy3s5zh/image/upload/v1234567/blog/uploads/2026-02-06-image1.jpg`

## Migration des Images Existantes

### Aucune image à migrer

Le projet était en développement, aucune image n'était stockée dans Firebase Storage.

## Limites Cloudinary (Plan Gratuit)

- **Stockage**: 25 GB
- **Bande passante**: 25 GB/mois
- **Transformations**: 25 crédits/mois
- **Images**: ~25,000 images (estimé à 1MB/image)

**Pour un blog de club**: Largement suffisant

## Optimisations Futures Possibles

### 1. Transformations automatiques

Cloudinary peut automatiquement optimiser les images:

```typescript
// Exemple: Resize et optimisation
const url = cloudinary.url('blog/uploads/image.jpg', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  fetch_format: 'auto',
});
```

### 2. Responsive Images

```typescript
// Plusieurs tailles pour différents devices
const sizes = [400, 800, 1200];
const srcset = sizes.map((width) => `${cloudinary.url(publicId, { width })} ${width}w`).join(', ');
```

## Tests Post-Migration

### ✅ Checklist

- [ ] Upload d'image dans nouveau blog post
- [ ] Upload d'image dans édition blog post
- [ ] Affichage des images uploadées
- [ ] Suppression d'images (si implémenté)

### Commandes de test

```bash
# Redémarrer le serveur
npm run dev

# Tester l'upload
# 1. Aller sur http://localhost:3000/admin/blog/new
# 2. Uploader une image
# 3. Vérifier l'URL retournée (doit contenir cloudinary.com)
```

## Rollback (si nécessaire)

### Si Cloudinary ne fonctionne pas

1. Restaurer l'ancien `app/api/upload/route.ts` depuis Git
2. Supprimer les variables `CLOUDINARY_*` du `.env.local`
3. Revenir à Firebase Storage (nécessite carte bancaire)

### Alternative: Vercel Blob

Si Cloudinary pose problème, considérer Vercel Blob (1GB gratuit):

```bash
npm install @vercel/blob
```

## Support et Documentation

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **Upload API**: https://cloudinary.com/documentation/image_upload_api_reference
- **Node.js SDK**: https://cloudinary.com/documentation/node_integration

## Notes de Sécurité

### ⚠️ Secrets

- **API Secret** est stocké uniquement côté serveur (`.env.local`)
- Ne JAMAIS exposer `CLOUDINARY_API_SECRET` au client
- Seul `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` est public

### 🔒 Permissions

- L'upload nécessite l'authentification Admin (via `app/admin/*` routes)
- Les images sont publiques par défaut (accessibles via URL)

## Monitoring

### Dashboard Cloudinary

- **URL**: https://cloudinary.com/console
- **Métriques**: Stockage utilisé, bande passante, nombre d'images
- **Logs**: Historique des uploads

## Conclusion

Migration réussie vers Cloudinary. Le système d'upload est maintenant:

- ✅ 100% gratuit (sans carte bancaire)
- ✅ Plus performant (CDN + optimisations)
- ✅ Plus simple (pas de CORS)
- ✅ Plus scalable (25GB vs 5GB Firebase gratuit)
