# Guide de Test - Migration Cloudinary

## ✅ Test de l'Upload d'Images

### Prérequis

- Serveur Next.js démarré: `npm run dev`
- Connecté en tant qu'admin sur http://localhost:3000

### Test 1: Nouveau Blog Post

1. **Accéder à la page de création**

   ```
   http://localhost:3000/admin/blog/new
   ```

2. **Remplir le formulaire**
   - Titre: "Test Upload Cloudinary"
   - Catégorie: "Trail"
   - Excerpt: "Test de la migration vers Cloudinary"

3. **Uploader une image de couverture**
   - Cliquer sur "Choose File"
   - Sélectionner une image (JPG, PNG, WebP)
   - Taille recommandée: < 5MB

4. **Vérifications**
   - ✅ La barre de progression s'affiche (0% → 100%)
   - ✅ L'aperçu de l'image apparaît
   - ✅ L'URL de l'image contient `cloudinary.com`
   - ✅ Format attendu: `https://res.cloudinary.com/dizy3s5zh/image/upload/v.../blog/uploads/2026-02-06-...`

5. **Publier le post**
   - Remplir le contenu
   - Cliquer "Publish Post"
   - Vérifier que le post s'affiche avec l'image

### Test 2: Édition Blog Post

1. **Accéder à un post existant**

   ```
   http://localhost:3000/admin/blog
   ```

   - Cliquer sur "Edit" sur n'importe quel post

2. **Changer l'image de couverture**
   - Cliquer sur "Choose File"
   - Sélectionner une nouvelle image
   - Vérifier que l'ancienne image est remplacée

3. **Vérifications**
   - ✅ L'upload fonctionne
   - ✅ La nouvelle URL Cloudinary est affichée
   - ✅ Pas d'erreur CORS dans la console

### Test 3: Console Cloudinary

1. **Accéder au dashboard**

   ```
   https://cloudinary.com/console
   ```

2. **Vérifier le dossier**
   - Aller dans "Media Library"
   - Chercher le dossier `blog/uploads`
   - Vérifier que les images uploadées sont présentes

3. **Vérifications**
   - ✅ Images présentes dans `blog/uploads/`
   - ✅ Nomenclature: `YYYY-MM-DD-nom-original`
   - ✅ Stockage utilisé augmente

## 🐛 Problèmes Courants

### Erreur: "Cloudinary not configured"

**Solution**: Vérifier que `.env.local` contient:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Puis redémarrer le serveur: `npm run dev`

### Erreur: "Upload failed"

**Causes possibles**:

1. Fichier trop volumineux (> 10MB)
2. Format non supporté
3. Problème de connexion internet

**Solution**: Vérifier la console du navigateur (F12) et les logs du serveur

### Erreur: "Invalid API key"

**Solution**: Vérifier que les credentials Cloudinary sont corrects dans `.env.local`

### Image ne s'affiche pas

**Causes possibles**:

1. URL malformée
2. Image supprimée de Cloudinary
3. Problème de CORS (peu probable avec Cloudinary)

**Solution**: Copier l'URL de l'image et l'ouvrir dans un nouvel onglet pour vérifier

## 📊 Métriques à Surveiller

### Cloudinary Dashboard

- **Stockage**: Doit augmenter après chaque upload
- **Transformations**: Normalement 0 (pas de transformations activées)
- **Bandwidth**: Augmente quand les images sont consultées

### Performance

- **Temps d'upload**: ~2-5 secondes pour une image de 2MB
- **Temps de chargement**: Images doivent charger instantanément (CDN)

## 🎯 Critères de Succès

La migration est réussie si:

- ✅ Upload d'images fonctionne sans erreur
- ✅ Les URLs contiennent `cloudinary.com`
- ✅ Les images s'affichent correctement sur le blog
- ✅ Pas d'erreur CORS dans la console
- ✅ Les images apparaissent dans le dashboard Cloudinary

## 📝 Rapport de Test

### Date: \***\*\_\_\_\*\***

### Testeur: \***\*\_\_\_\*\***

| Test                 | Statut            | Notes |
| -------------------- | ----------------- | ----- |
| Upload nouveau post  | ⬜ Pass / ⬜ Fail |       |
| Upload édition post  | ⬜ Pass / ⬜ Fail |       |
| Affichage images     | ⬜ Pass / ⬜ Fail |       |
| Dashboard Cloudinary | ⬜ Pass / ⬜ Fail |       |

### Problèmes rencontrés:

```
(Laisser vide si aucun problème)
```

### Screenshots:

- [ ] Upload en cours (barre de progression)
- [ ] Image uploadée (aperçu)
- [ ] Dashboard Cloudinary (dossier blog/uploads)
- [ ] Blog avec image affichée

## 🔄 Rollback si Nécessaire

Si la migration échoue complètement:

1. **Restaurer l'ancien code**

   ```bash
   git checkout HEAD -- app/api/upload/route.ts
   ```

2. **Supprimer Cloudinary**

   ```bash
   npm uninstall cloudinary
   ```

3. **Nettoyer .env.local**
   - Supprimer les lignes `CLOUDINARY_*`

4. **Redémarrer**
   ```bash
   npm run dev
   ```

**Note**: Vous reviendrez alors au problème initial (CORS Firebase)

## 📞 Support

En cas de problème:

1. Vérifier `memory/CLOUDINARY_MIGRATION.md`
2. Consulter logs du serveur
3. Consulter documentation Cloudinary: https://cloudinary.com/documentation
