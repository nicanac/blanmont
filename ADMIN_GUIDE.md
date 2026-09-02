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
| **Calendrier & Sorties** | `/admin/events` | Programmation des sorties du weekend, brevets, parcours et traces GPX. |
| **Traces GPS** | `/admin/traces` | Gestion de la bibliothèque GPX, profils altimétriques et liens Komoot. |
| **Boutique Équipements** | `/admin/equipements` | Gestion des maillots, cuissards et équipements officiels. |
| **Challenge Carré Vert** | `/admin/carre-vert` | Pointage des présences et synchronisation du classement annuel. |

---

## 6. Dépannage & Bonnes Pratiques

- **Le membre se connecte mais est redirigé vers `/login` lorsqu'il clique sur `/admin` :**  
  Le membre était déjà connecté avant que le rôle Admin ne lui soit attribué. Il lui suffit de se déconnecter puis de se reconnecter pour rafraîchir son jeton de session `ccb_session`.
- **Erreur "Aucun compte membre n’est associé à cette adresse email" lors de la réinitialisation :**  
  Vérifiez que l'email renseigné dans `/admin/members` correspond exactement à celui saisi.
- **Sécurité des sessions :**  
  Les jetons de session sont chiffrés en HMAC-SHA256 avec une validité de 14 jours.
