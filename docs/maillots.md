# Maillots — group orders, club stock and bank reconciliation

Status: v1 spec, 2026-11-26. Source: member feedback ("gestion des maillots avec la possibilité de lier cela à la banque du club pour gérer le stock, paiement pour une commande groupée, dates de commande / paiement / livraison attribuées automatiquement au membre, QR code ou communication structurée avec réconciliation automatisée").

## Decisions (2026-11-26, Nico)

| Topic | Decision | Why |
| --- | --- | --- |
| Bank link | Treasurer uploads the bank's **CODA** statement file; the app reconciles | Every Belgian bank exports CODA; no fees, no PSD2 contract |
| Order model | **Group-order campaigns + club stock** | Jerseys are made to order by Gobik; spare units stay in club stock |
| Who orders | **Logged-in members only** | Dates are attached to the member id and shown in the profile |
| Amount mismatch | **Exact amount only**; anything else goes to the unmatched list for manual resolution | Treasurer keeps control of every non-standard case |

## Flows

1. **Stock purchase**: member picks product/size/qty with stock ≥ qty, the stock is reserved at once, member pays, admin hands it over ("Remis").
2. **Group order**: admin opens a campaign (products, deadline, optional extra units for club stock). Members order until `closesAt` and pay. Admin closes, exports the size matrix (paid orders + extra stock), orders from Gobik ("Commandée chez Gobik"), marks it received ("Reçue": extra units are added to stock), then ticks each member off on the distribution checklist ("Remis").
3. **Payment**: each order gets a unique Belgian structured communication (OGM). The confirmation and the profile show an EPC (SEPA) QR code that carries IBAN, amount and the OGM, plus the OGM and IBAN as text with copy buttons.
4. **Reconciliation**: the treasurer uploads a CODA file in `/admin/commandes/banque`. Each new credit whose OGM matches a pending order **and** whose amount equals the order total marks the order paid, with `paidAt` = the bank value date. Every other credit lands in the unmatched list with a reason; the admin can assign it to an order by hand or ignore it. An admin can also mark an order paid by hand (cash).

## Dates the member sees (all automatic, none typed)

| Label (FR) | Source |
| --- | --- |
| Commandé le | `order.createdAt` |
| Payé le | `order.paidAt` (bank value date, or the day of the manual mark) |
| Commandé chez Gobik le | `campaign.supplierOrderedAt` (campaign orders only) |
| Arrivé au club le | `campaign.receivedAt` (campaign orders only) |
| Remis le | `order.deliveredAt` |

## Data (Firebase RTDB, Admin SDK only, never the client SDK)

All money stays in euros on orders (existing `totalPrice`), **compare in cents** (`Math.round(eur * 100)`). Bank transactions store integer cents.

- `/equipment/{id}/stock/{size}` (exists): decremented by an RTDB **transaction** when a stock order is created (reject if it would go below 0), restored when a non-delivered stock order is cancelled, incremented by `campaign.extraStock` when the campaign becomes `received` (once).
- `/equipment-orders/{id}` (exists), new fields on `EquipmentOrder`:
  - `memberId: string` (from the session, never from the client; optional in the type for legacy orders)
  - `source: 'stock' | 'campaign'`, `campaignId?: string`
  - `paymentReference: string` (12 digits, no formatting)
  - `status`: add `'paid'` → `'pending' | 'paid' | 'confirmed' | 'delivered' | 'cancelled'` (`confirmed` stays for legacy orders only)
  - `paidAt?`, `bankTransactionId?`, `deliveredAt?`, `cancelledAt?`
- `/equipment-campaigns/{id}`: `{ id, title, equipmentIds: string[], closesAt, status: 'open' | 'closed' | 'ordered' | 'received', supplierOrderedAt?, receivedAt?, extraStock?: Record<equipmentId, Record<size, number>>, createdAt, updatedAt? }`
- `/bank-transactions/{id}`: `{ id, importedAt, valueDate (YYYY-MM-DD), amountCents, counterpartyName, counterpartyIbanLast4, communication (≤ 140 chars), reference?, status: 'matched' | 'unmatched' | 'ignored', reason?: 'no-reference' | 'unknown-reference' | 'not-pending' | 'amount-mismatch', orderId?, manual?: boolean }`. `id` = first 20 hex of sha256(`bankRef|valueDate|amountCents|counterpartyAccount`) so a re-imported file adds nothing. Only credits are stored. Full counterparty IBAN is **not** stored (privacy).
- `/settings/payment`: `{ beneficiary, iban, bic? }`, edited in `/admin/settings`; IBAN validated with ISO 13616 mod-97 before saving.
- `/counters/payment-reference`: integer, incremented by RTDB transaction.

Mock mode (`isMockMode`) keeps in-memory stores like `MOCK_EQUIPMENT_ORDERS`, so tests run without Firebase.

RTDB security rules: `database.rules.json` (in the repo since v0.35.0) denies every client read and write at the root, so the new paths are server-only; check it is deployed (`firebase deploy --only database`).

## Status transitions

Orders: `pending → paid | cancelled`, `paid → delivered | cancelled` (cancelling a paid order shows "remboursement à faire hors application"), `confirmed → delivered | cancelled` (legacy), `delivered` is final. Cancelling a non-delivered stock order restores stock.

Campaigns: `open → closed → ordered (sets supplierOrderedAt) → received (sets receivedAt, adds extraStock once)`. Member orders on a campaign are refused when `status !== 'open'` or now > `closesAt`. The size matrix counts **paid** orders + `extraStock`; unpaid orders are listed as a warning.

## Payment reference (OGM / communication structurée)

- Base = `'1'` + 9-digit zero-padded counter value (prefix 1 = boutique). Check = base mod 97, 0 becomes 97, two digits. Reference = base + check (12 digits).
- Display: `+++123/4567/89002+++`.
- Parse: find any 12 digits in free text (with or without `+++`, `***`, `/`, spaces), keep the first one whose check digits are valid.

## EPC QR payload (EPC069-12 v2)

Lines joined by `\n`: `BCD`, `002`, `1` (UTF-8), `SCT`, BIC (may be empty), beneficiary (≤ 70 chars), IBAN (upper case, no spaces), `EUR` + amount with 2 decimals (0.01 to 999999999.99), purpose (empty), structured remittance = the 12-digit OGM, then trailing empty fields omitted. Max 331 bytes. QR error correction **M**. Render with the existing `app/lib/qrcode.ts`.

Risk: Belgian apps differ on OGM in the structured field. The field choice is one constant; test with KBC, BNP Paribas Fortis, ING and Belfius before go-live.

## CODA parsing (v2, 128-char records, read as latin1)

Positions are 1-based, inclusive. Lines may end with `\r`. Reject a file that has no record `0` or has records of the wrong length ("Fichier CODA invalide"). Max upload 1 MB (Next's server-action body limit).

- `21` movement part 1: 3-6 sequence, 11-31 bank reference, 32 sign (`0` credit, `1` debit), 33-47 amount (15 digits, **3 implied decimals**), 48-53 value date DDMMYY, 62 communication type (`1` = structured), 63-115 communication. If structured and 63-65 is `101` or `102`, the OGM is 66-77.
- `22` part 2: 11-63 communication (continued).
- `23` part 3: 11-47 counterparty account, 48-82 counterparty name, 83-125 communication (continued).
- `21` pos. 7-10 detail number, pos. 125 globalisation code: a `0000` record with a code other than `0` followed by details (same sequence, detail > `0000`) is the bank's total and is dropped; the details are the credits.
- Join 21/22/23 by sequence number. Free communication = 21[63-115] + 22[11-63] + 23[83-125], trimmed; scan it for an OGM when the structured field is absent. Skip debits and every other record type.

## Reconciliation (pure function, exact amount)

For each new credit, in file order: no reference → `no-reference`; no order with that `paymentReference` → `unknown-reference`; order not `pending` → `not-pending`; amount ≠ order total in cents → `amount-mismatch`; else **matched** (order → `paid`, `paidAt = valueDate`, `bankTransactionId`). Two credits for one order in one file: the first matches, the second is `not-pending`. Manual assign (admin) accepts any amount, sets `manual: true`; it claims the credit before paying the order and releases it if the order cannot be paid. A credit whose id is already an order's `bankTransactionId` (import stopped midway, or run twice at once) is matched without paying again; each transaction record is written create-only right after its order.

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/le-club/equipement` | public | open-campaign banner (title, deadline), "En stock" per size |
| `/checkout` | member (redirect to `/login?next=…` otherwise) | choose "Retrait du stock" or the open campaign; name/email from the session; after submit: payment card |
| `/profile/commandes` | member | own orders, the date timeline, payment card while pending |
| `/admin/commandes` | admin | existing list + payment status, OGM, dates, "Marquer payé", "Remis", "Annuler" |
| `/admin/commandes/campagnes` + `/[id]` | admin | campaigns list/create; detail: status stepper, size matrix + CSV, unpaid warning, distribution checklist |
| `/admin/commandes/banque` | admin | CODA upload, import summary, unmatched credits with assign/ignore |
| `/admin/settings` | admin | "Paiements — compte du club" card: beneficiary, IBAN, BIC, QR preview |

## Security

Member actions use `getSessionUser()` and take `memberId` from the session; admin actions call `requireAdminSession()`. Prices and stock are read server-side. Every input goes through Zod. The CODA upload is admin-only, ≤ 1 MB, parsed in memory, never stored as a file.

## Out of scope (v1)

Ponto/PSD2 sync, Payconiq, membership dues, refunds, e-mail notifications, non-CODA bank formats, stock movement ledger, partial payments.

## Design

Figma file `VaK6xKOuQMDETLpTNPLyou`, page "50 · Maillots & paiements". UI copy in French; Carte IGN design system (`design-system/README.md`).
