
### Gestion du Carré Vert (Import CSV)

1. **Préparation du fichier CSV**
   - Télécharger le fichier "Carré Vert" (Google Sheets ou Excel).
   - S'assurer que le format respecte : `groupe(s),prénom,Nom,∑,01/01,03/01...`
   - Sauvegarder en CSV sous `public/CC Blanmont - sorties 2026 - SORTiES.csv`.

2. **Synchronisation**
   - **Méthode 1 (Automatique via Script)** :
     - Assurez-vous que le serveur de développement tourne (`npm run dev`).
     - Exécutez la commande : `node scripts/sync-carre-vert.js`
   - **Méthode 2 (Manuelle via API)** :
     - Appeler l'endpoint : `GET http://localhost:3000/api/admin/import-csv`

3. **Fonctionnement**
   - Le script lit le CSV.
   - Il **supprime** toutes les présences existantes pour l'année en cours (ex: 2026).
   - Il crée les membres manquants dans la base de données.
   - Il met à jour le classement (Leaderboard) et les présences (Attendance) pour chaque événement.

4. **Règles de calcul (Fidélité / Présence)**
   - **Week-end** : Une participation le samedi et/ou le dimanche compte pour **1 seul carré** par week-end.
   - **Semaine** : Chaque sortie effectuée en semaine (lundi au vendredi) compte pour **1 carré supplémentaire**.
   - **Calcul** : Le score d'un membre est la somme de ses carrés de week-end et de ses carrés de semaine.
   - **Taux de présence** : Calculé sur le total des carrés possibles (nombre de week-ends avec au moins une sortie + nombre de dates de semaine avec une sortie).
