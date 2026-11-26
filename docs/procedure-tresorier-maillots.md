# Procédure trésorier — maillots, commandes groupées et paiements

Version 1 — 26 novembre 2026. Pour le trésorier et les administrateurs du CC Saint-Martin Blanmont.
Contrat technique : `docs/maillots.md`.

## En bref

1. Le club ouvre une **commande groupée** (ou vend depuis le **stock**).
2. Chaque membre commande **connecté** et reçoit une **communication structurée** unique (`+++123/4567/89012+++`) et un **QR code** de paiement.
3. Le trésorier **importe le fichier CODA** de la banque : les virements au bon montant avec la bonne communication sont **reconnus automatiquement**.
4. Le trésorier traite à la main la liste **« À traiter »** (paiements sans référence, montant différent…).
5. Le club commande chez Gobik, réceptionne, puis **remet** les maillots. Chaque étape date automatiquement la commande du membre.

Le membre suit tout dans **Mon profil → Mes commandes** : commandé le, payé le, commandé chez Gobik le, arrivé au club le, remis le.

## 0. Une seule fois : le compte du club

1. Ouvrez **Administration → Commandes Équipement → Banque du club**, carte **Paiements — compte du club** (en bas de la page).
2. Saisissez le **bénéficiaire** (nom exact du compte), l'**IBAN** et, si vous l'avez, le **BIC**. L'IBAN est vérifié avant l'enregistrement.
3. Scannez le **QR de test (1,00 €)** avec l'application bancaire d'un téléphone : vérifiez que le bénéficiaire, l'IBAN, le montant et la communication structurée sont bien préremplis, puis **annulez** le virement.
4. Dans la banque en ligne du club, vérifiez que vous pouvez **exporter les extraits au format CODA** (fichier `.cod`). Si l'option n'apparaît pas, demandez son activation à l'agence.

Tant que le compte du club n'est pas configuré, les membres reçoivent leur communication structurée mais pas de QR code.

## 1. Ouvrir une commande groupée

1. **Administration → Commandes Équipement**, bouton **Commandes groupées** en haut de page. Le formulaire **Nouvelle commande groupée** se trouve en bas de la liste.
2. Renseignez le **titre** (ex. « Maillots 2027 »), les **articles** concernés, la **date de clôture** et, si le club veut du stock, les **unités supplémentaires** par article et par taille.
3. Annoncez-la aux membres (WhatsApp, newsletter) avec le lien vers **Le club → Équipement** : la bannière de la commande groupée y apparaît tant qu'elle est ouverte.

Après la date de clôture, les membres ne peuvent plus commander dans cette campagne.

## 2. Pendant la campagne : rapprocher les paiements

À faire **chaque semaine**, et toujours **juste avant la clôture**.

1. Dans la banque en ligne du club, exportez les **extraits CODA** de la période (un fichier par mois ou par trimestre convient).
2. **Administration → Commandes Équipement → Banque** (bouton en haut de page), choisissez le fichier (`.cod`, `.coda` ou `.txt`, 1 Mo maximum) et cliquez **Importer**.
3. Lisez le résumé :
   - **rapprochées** : commandes passées automatiquement à « Payée », avec la date de valeur du virement comme date de paiement.
   - **doublons ignorés** : opérations déjà importées. Réimporter un fichier est sans risque.
   - **à traiter** : virements à examiner (étape 3).

## 3. Traiter la liste « À traiter »

Chaque virement non reconnu affiche une raison :

| Raison | Cause habituelle | Action |
| --- | --- | --- |
| **Sans référence** | Le membre a oublié la communication structurée, ou ce n'est pas un paiement de maillot (cotisation, sponsor…) | Retrouvez la commande (nom du donneur d'ordre, montant) puis **Associer à une commande**. Sinon **Ignorer**. |
| **Référence inconnue** | Faute de frappe dans la communication | Retrouvez la commande puis **Associer**, sinon **Ignorer**. |
| **Montant différent** | Le membre a payé trop ou trop peu | Contactez le membre. Trop peu : attendez le complément, associez un des deux virements à la commande et ignorez l'autre. Trop payé : associez, puis remboursez la différence par virement. |
| **Déjà payée ou annulée** | Double paiement, ou commande annulée | Remboursez par virement depuis la banque, puis **Ignorer**. |

**Associer à une commande** marque la commande « Payée » quel que soit le montant : vérifiez avant de cliquer.

**Paiement en espèces** : **Commandes Équipement**, ligne de la commande, **Marquer payé** (date du jour).

## 4. Clôturer et commander chez Gobik

1. Faites un dernier rapprochement (étape 2).
2. Ouvrez la commande groupée et cliquez **Clôturer la commande**.
3. L'encadré orange **« N commandes non payées (non incluses ci-dessous) »** liste les commandes exclues de la commande fournisseur : relancez les membres ou **annulez** ces commandes.
4. **Exporter CSV** : la matrice des tailles (membres payés + stock club) est au format attendu par Gobik. Envoyez-la à Gobik.
5. Cliquez **Marquer commandée chez Gobik** : la date apparaît chez chaque membre concerné.

## 5. Réception et distribution

1. À l'arrivée du colis, vérifiez les quantités avec la matrice, puis cliquez **Marquer reçue** (une confirmation est demandée). Les unités supplémentaires sont ajoutées **une seule fois** au stock du club, et la date d'arrivée apparaît chez les membres.
2. Lors de la remise (au départ d'une sortie, par exemple), ouvrez la section **Remise aux membres** de la commande groupée (visible une fois la commande **Reçue**) sur le téléphone et cliquez **Remis** pour chaque membre : la date de remise est enregistrée.

## 6. Ventes depuis le stock

- Un membre qui choisit **Retrait du stock** réserve l'article à la commande : le stock diminue tout de suite.
- Le paiement suit le même chemin (QR, communication structurée, import CODA).
- Une fois payé, remettez l'article et cliquez **Remis** dans **Commandes Équipement**.
- Une commande annulée ou supprimée avant la remise **rend l'article au stock**.
- Le stock se corrige à la main dans **Équipements Club** (inventaire).

## 7. Annulations et remboursements

- **Annuler** une commande non payée : aucune autre action.
- **Annuler** une commande payée : l'application l'indique, mais le **remboursement se fait hors application** (virement depuis la banque du club).

## Confidentialité

- L'application ne conserve que le **nom du donneur d'ordre**, les **4 derniers chiffres de son IBAN**, la date, le montant et la communication des virements reçus.
- Le fichier CODA n'est **pas stocké** : il est lu puis oublié.
- Seuls les administrateurs voient la page **Banque**.

## Calendrier conseillé

| Quand | Quoi |
| --- | --- |
| Chaque semaine pendant une campagne | Import CODA et liste « À traiter » |
| La veille de la clôture | Import CODA, relance des non-payés |
| Clôture | Clôturer la commande, export CSV, commande Gobik |
| Réception | Marquer reçue, puis distribution avec « Remis » |
