# Guide d'Utilisation : Connexion & Administration

> **Cyclo Club Saint-Martin Blanmont**  
> *Guide complet d'onboarding, de gestion des rôles et d'accès à l'espace d'administration.*

---

## 1. Vue d'Ensemble & Architecture de Sécurité

L'accès à l'espace d'administration du Club de Blanmont (`/admin`) repose sur une double vérification sécurisée :

```
┌───────────────────────────┐
│     Firebase Auth         │  ──> Vérification des identifiants (Email + Mot de passe)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Realtime Database / Roles │  ──> Vérification du rôle ('Admin', 'President', 'WebMaster')
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Session HttpOnly Signée   │  ──> Jeton HMAC-SHA256 (Cookie 'ccb_session' avec isAdmin=true)
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│  Accès /admin déverrouillé│  ──> Middleware & API routes autorisés
└───────────────────────────┘
```

---

## 2. Critères d'Éligibilité Administrateur

Un utilisateur est automatiquement reconnu comme administrateur s'il remplit **au moins l'une des deux conditions suivantes** (défini dans [`app/utils/auth.ts`](/app/utils/auth.ts)) :

### A. Rôles autorisés dans la base de données
Dans la table des membres (`members`), la propriété `role` (tableau de chaînes) contient l'un des rôles suivants (insensible à la casse) :
- `Admin` ou `admin`
- `President` ou `president`
- `WebMaster` ou `webmaster`

### B. Adresses emails privilégiées
- `admin@blanmont.be`
- `president@blanmont.be`
- `bruyere.nicolas@gmail.com`

---

## 3. Guide Pas-à-Pas : Créer et Connecter un Nouvel Administrateur

### Étape 1 : Création de la fiche membre avec rôle Admin
1. Un administrateur existant se connecte sur le site et se rend sur **`/admin/members/new`**.
2. Renseignez les informations :
   - **Nom complet** *(ex: Jean Dupont)*
   - **Adresse email** *(ex: jean.dupont@exemple.be)*
   - **Rôles** : Cochez la case **`Admin`** (ou **`President`** / **`WebMaster`**).
3. Cliquez sur **Enregistrer le membre**.

---

### Étape 2 : Définition du mot de passe initial

Il existe 2 méthodes pour configurer le mot de passe du nouvel administrateur :

#### Méthode A — Envoi de lien sécurisé par email *(Recommandé)*
1. Le nouvel utilisateur se rend sur la page **`/login/forgot-password`** (Mot de passe oublié).
2. Il saisit son adresse email enregistrée.
3. Il reçoit un email automatique Firebase contenant un lien unique pour choisir son mot de passe en toute sécurité.

#### Méthode B — Définition directe par l'administrateur
1. Depuis l'administration des membres (`/admin/members`), l'admin clique sur le membre puis sur **Réinitialiser le mot de passe** (`/admin/members/[id]/reset-password`).
2. Il saisit un mot de passe temporaire (minimum 6 caractères) et le transmet au nouvel utilisateur.

---

### Étape 3 : Première Connexion à l'Administration
1. Le nouvel utilisateur se rend sur **`/login`**.
2. Il renseigne son **email** et son **mot de passe**.
3. Lors de la validation :
   - Le serveur génère un cookie de session HttpOnly (`ccb_session`) contenant le flag `isAdmin: true`.
   - Le bouton **Administration** apparaît dans la barre de navigation supérieure et dans le menu utilisateur.
4. L'administrateur peut accéder directement au tableau de bord complet sur **`/admin`**.

---

## 4. Promouvoir un Membre Existant au Rang d'Admin

Si la personne fait déjà partie des membres du club :
1. Rendez-vous sur **`/admin/members`**.
2. Recherchez le membre dans la liste et cliquez sur **Modifier** (`/admin/members/[id]/edit`).
3. Dans la section **Rôles**, cochez **`Admin`**.
4. Cliquez sur **Mettre à jour**.
5. *À sa prochaine connexion (ou après reconnexion s'il était déjà connecté), il aura instantanément accès à `/admin`.*

---

## 5. Modules d'Administration Disponibles

Une fois connecté, le nouvel administrateur a accès à tous les modules de gestion :

| Module | URL | Description & Fonctions |
| :--- | :--- | :--- |
| **Tableau de Bord** | `/admin` | Vue globale, alertes et statistiques en temps réel. |
| **Sondages Weekend** | `/admin/sondages` | Création des sondages hebdomadaires, suivi des allures et présences. |
| **Membres** | `/admin/members` | Gestion des adhérents, attribution des rôles, réinitialisation de mots de passe, import CSV. |
| **Articles & Blog** | `/admin/blog` | Rédaction et publication d'articles avec photos et mise en avant. |
| **Boutique Équipements** | `/admin/equipements` | Gestion des maillots, cuissards et équipements officiels. |
| **Challenge Carré Vert** | `/admin/carre-vert` | Pointage des présences et synchronisation du classement annuel. |
| **Traces GPS** *(interne)* | `/admin/traces` | Gestion de la bibliothèque GPX, profils altimétriques et liens Komoot. |

### Accès délégués par rôle

Les autres rôles du club (Capitaine de Route, Trésorier, Secrétaire, Membre) n'ouvrent que les sections cochées pour leur rôle sur **`/admin/acces`** (page réservée aux administrateurs ; spécification : [admin-rbac.md](admin-rbac.md)). Seul un administrateur peut attribuer des rôles. Les **Paramètres** (`/admin/settings`) sont réservés au propriétaire du site (variable serveur `OWNER_EMAILS`, comparée à l'e-mail de connexion vérifié par Firebase).

### Export et import CSV des membres

Sur `/admin/members` (section `members`) : **Exporter CSV** télécharge les membres affichés (recherche et filtre appliqués) en CSV UTF-8 avec BOM, séparateur **« ; »** (celui d'Excel en français/belge), colonnes fixes `ID ; Nom ; Email ; Téléphone ; Groupe ; Cotisation 2026 ; Cotisation payée le ; Licence FFBC ; Strava ID ; Contact ICE ; Téléphone ICE ; Lien ICE ; Bio`. Ni rôles, ni compte de connexion, ni mots de passe, jetons ou photos. Une cellule qui commence par `= + - @`, tabulation ou retour chariot reçoit une apostrophe (anti-injection de formule), retirée à l'import.

**Importer CSV** (« ; » ou « , », max. 1 000 lignes / 500 Ko) : aperçu puis confirmation ; le serveur refait tout le contrôle à la confirmation (`app/admin/members/actions.ts`, `app/lib/members-csv.ts`). Une ligne met à jour le membre de même ID, sinon de même email (sans tenir compte de la casse), sinon crée un membre simple (`Member`). Colonne absente = champ inchangé ; cellule vide = champ effacé. Les colonnes de rôles ou d'accès sont ignorées ; un rôle délégué subit les mêmes refus qu'à l'édition (compte admin, email d'un responsable). Un export réimporté tel quel ne change rien.

---

## 5b. Retours visuels (capture d'écran + annotation)

Réglage : **Admin → Paramètres → Retours & captures d'écran** (propriétaire du site uniquement).

- **Interrupteur** : active ou coupe l'outil. Coupé, aucun code de retour n'est chargé chez les utilisateurs.
- **Qui voit le bouton** : administrateurs (test), membres connectés, ou tout le monde.
- Les utilisateurs cliquent sur « Donner un avis », annotent la capture (flèche, cadre, crayon, flou) et envoient. Chaque retour devient une **issue GitHub** (label `visual-feedback`) ; la capture est commitée sur la branche `feedback-assets` (aucun déploiement déclenché).
- Le dépôt cible est **public** par défaut : l'utilisateur doit cocher qu'aucune donnée personnelle n'apparaît. Pour un dépôt privé, définir `GITHUB_FEEDBACK_REPO`.
- Jeton GitHub : variable serveur `GITHUB_FEEDBACK_TOKEN` (prioritaire) ou, à défaut, jeton collé dans **Paramètres → Retours → Connexion GitHub** (testé auprès de GitHub, chiffré avec `SESSION_SECRET` avant stockage dans RTDB `/visual-feedback-secret`, jamais renvoyé au navigateur ; changer `SESSION_SECRET` oblige à le recoller). Sans jeton, la carte l'indique et les envois échouent.
- Coupure d'urgence sans code : `NEXT_PUBLIC_FEEDBACK_ENABLED=false` puis redéploiement.
- **Lire et traiter les retours** : page **Retours visuels** (`/admin/retours` pour les admins, `/retours` pour les responsables du club : Président, Trésorier, Secrétaire, Capitaine de Route, Admin ; jamais les simples membres). Onglets À traiter / Résolu / Écarté avec compteurs, recherche, filtres type et priorité, fiche détaillée (capture, contexte, échanges) et flèches ← → pour enchaîner. Le bouton « +1 » de la fiche ajoute ou retire votre vote (un par personne, stocké dans RTDB `/visual-feedback-votes`) ; le nombre de votes s'affiche sur chaque carte et le tri « Plus votés » les classe. « Marquer résolu » / « Écarter » / « Rouvrir » ferment ou rouvrent l'issue GitHub et y signent l'action (prénom + rôle). Les issues restent aussi accessibles via `gh issue list --label visual-feedback`.

## 6. Dépannage & Bonnes Pratiques

- **Le membre se connecte mais est redirigé vers `/login` lorsqu'il clique sur `/admin` :**  
  Le membre était déjà connecté avant que le rôle Admin ne lui soit attribué. Il lui suffit de se déconnecter puis de se reconnecter pour rafraîchir son jeton de session `ccb_session`.
- **Erreur "Aucun compte membre n’est associé à cette adresse email" lors de la réinitialisation :**  
  Vérifiez que l'email renseigné dans `/admin/members` correspond exactement à celui saisi.
- **Sécurité des sessions :**  
  Les jetons de session sont chiffrés en HMAC-SHA256 avec une validité de 14 jours.
