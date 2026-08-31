
# Documentation du Système "Carré Vert" (Présences & Classement)

## 1. Concept Métier & Règles de Calcul

Le **Carré Vert** est le système officiel de suivi des présences et de fidélité du club Cyclo Club Saint-Martin Blanmont.

### Règles fondamentales :
1. **Week-end (Samedi & Dimanche)** :
   - Un participant ne peut marquer qu’**un seul Carré Vert au maximum par week-end**.
   - S’il participe **uniquement le samedi** : il reçoit **1 Carré Vert**.
   - S’il participe **uniquement le dimanche** : sa présence est enregistrée et il reçoit **1 Carré Vert**.
   - S’il participe **le samedi ET le dimanche** : les deux dates sont bien conservées dans son historique de sorties / drawer membre, mais son total de Carrés Verts n’augmente que de **1 point**.
2. **Semaine (Lundi au Vendredi - Jours fériés, ponts & sorties club)** :
   - Chaque participation en semaine (ex: 01/01 Nouvel An, 06/04 Lundi de Pâques, 14/05 Ascension, 25/05 Pentecôte, 21/07 Fête Nationale, 11/11 Armistice) donne droit à **1 Carré Vert supplémentaire**.
3. **Grand Total d'un membre** :
   $$\text{Total Carrés Verts} = (\text{Nombre de week-ends avec au moins 1 participation}) + (\text{Nombre de dates de semaine avec participation})$$
4. **Taux de Fidélité / Présence (%)** :
   $$\text{Fidélité (\%)} = \frac{\text{Carrés Verts du membre}}{\text{Total des Carrés Verts possibles à ce jour}} \times 100$$
   *Total des Carrés Verts possibles* = (Nombre de week-ends ayant eu au moins un événement club à date) + (Nombre de jours de semaine ayant eu un événement club à date).

---

## 2. Provenance des Données (Sources of Truth)

### A. Google Sheets (Feuille officielle des sorties)
- **Export CSV direct** : `https://docs.google.com/spreadsheets/d/1iKk938MCgkKn7CXconmZpjmy0xmSFaEPhYOqf0Nis84/export?format=csv&gid=1551990117`
- **Copie locale de secours** : `public/CC Blanmont - sorties 2026 - SORTiES.csv`
- **Format du CSV** :
  - Ligne 1 (En-tête) : `groupe(s),prénom,Nom,∑,01/01,03/01,04/01,10/01,11/01...`
  - Lignes suivantes : `A,Sébastien,Baeyens,6,,1,,1,,,1,,1,,1,,1...`
  - Valeur `1` = présence enregistrée à cette date.

### B. Panneau d'administration en temps réel
- Accessible aux administrateurs sur `/admin/carre-vert` (`app/admin/carre-vert/page.tsx`).
- Permet de cocher/décocher des présences pour n'importe quel événement passé ou futur.

---

## 3. Stockage dans Firebase Realtime Database

Les données sont structurées en deux nœuds synchronisés :

1. **`attendance/{eventId}`** (Géré par `app/lib/firebase/attendance.ts`) :
   - `isoDate` : Date ISO de l'événement (`YYYY-MM-DD`).
   - `members` : Map de `memberId -> { memberId, name, group, markedAt }`.
   - `updatedAt` : Timestamp ISO de la dernière modification.

2. **`leaderboard/{memberId}`** (Géré par `app/lib/firebase/leaderboard.ts`) :
   - `name` : Nom complet du membre.
   - `group` : Groupe principal (`A`, `A-`, `B`, `C`, `V`).
   - `dates` : Liste des dates complètes de présence (`["03/01/2026", "04/01/2026", ...]`).
   - `rides` : Total recalculé de points Carré Vert (respectant la règle 1 max par week-end).
   - `updatedAt` : Timestamp ISO.

---

## 4. Moteur de Calcul Centralisé (`app/lib/carreVert.ts`)

Pour éviter toute divergence entre les pages et les routes API, toute la logique est factorisée dans `app/lib/carreVert.ts` :

- **`parseDateInfo(dateStr)`** : Analyse les dates en UTC (évite tout décalage horaire/timezone), extrait l'année, le jour de la semaine (`0=Dimanche, 6=Samedi`), indique si c'est un week-end et génère la clé unique du week-end (`weekendKey`, date du samedi correspondant).
- **`calculateMemberCarres(dates, year?)`** : Calcule le nombre exact de Carrés Verts, de sorties physiques réelles, de week-ends uniques et de sorties de semaine uniques.
- **`getPossibleCarresCount(events, year, options?)`** : Calcule le dénominateur de présence pour le taux de fidélité.
- **`calculateLeaderboardFromAttendance(entries, events, allAttendance, year)`** : Reconstruit le classement complet avec support du filtre par année et fallback sur l'historique `dates` si aucune donnée fine d'événement n'existe pour les années passées.

---

## 5. Endpoints & Synchronisation

1. **Importation manuelle / API** :
   - `GET /api/admin/import-csv` : Télécharge le CSV Google Sheets, réinitialise l'année courante dans `attendance`, crée les nouveaux membres et recalcule les `rides` avec la règle du Carré Vert.
2. **Cron Job automatique** :
   - `GET /api/cron/sync-leaderboard` : Même processus d'ingestion automatisable via tâche planifiée (Vercel Cron).
3. **Mise à jour unitaire en direct** :
   - `POST /api/admin/attendance` : Modifie la table `attendance` et synchronise instantanément le tableau `dates` et le score `rides` de l'entrée `leaderboard` du membre.
4. **Script Node local** :
   - `node scripts/sync-carre-vert.js` (nécessite le serveur dev `npm run dev` actif).

---

## 6. Consommateurs dans l'Interface Utilisateur

- **Classement public (`/leaderboard`)** : `app/leaderboard/page.tsx` & `LeaderboardView.tsx` — Affiche le podium, le tableau complet, les points Carré Vert, le pourcentage de fidélité et le drawer détaillant toutes les sorties individuelles du membre.
- **Calendrier public (`/calendrier`)** : `app/calendrier/page.tsx` & `CalendarView.tsx` — Affiche pour chaque sortie la liste des participants.
- **Administration Carré Vert (`/admin/carre-vert`)** : `app/admin/carre-vert/page.tsx`, `CarreVertView.tsx` & `EventAttendancePanel.tsx` — Gestion interactive des présences avec badges `WE` / `Sem`.
- **Statistiques d'administration (`/admin/statistics`)** : `app/admin/statistics/page.tsx` & `StatsCharts.tsx` — Graphiques de distribution des sorties, répartition par groupe et activité hebdomadaire.

