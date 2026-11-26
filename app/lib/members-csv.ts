import { z } from 'zod';
import { CYCLING_GROUPS } from '@/app/constants/cycling';
import type { Member } from '@/app/types';
import { parseCsv, type CsvCell } from './csv';

/**
 * Members CSV (export and import, /admin/members). Never carries roles, admin rights, the login link
 * (authUid), passwords, tokens, photos or timestamps: an import cannot change who may log in or administer.
 */
export const MEMBER_CSV_COLUMNS = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Nom' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Téléphone' },
  { key: 'preferredGroup', header: 'Groupe' },
  { key: 'cotisation2026Status', header: 'Cotisation 2026' },
  { key: 'cotisation2026PaidAt', header: 'Cotisation payée le' },
  { key: 'ffbcLicenseNumber', header: 'Licence FFBC' },
  { key: 'stravaId', header: 'Strava ID' },
  { key: 'iceContactName', header: 'Contact ICE' },
  { key: 'iceContactPhone', header: 'Téléphone ICE' },
  { key: 'iceRelationship', header: 'Lien ICE' },
  { key: 'bio', header: 'Bio' },
] as const;

type MemberCsvKey = (typeof MEMBER_CSV_COLUMNS)[number]['key'];
export type MemberCsvField = Exclude<MemberCsvKey, 'id'>;
export type MemberCsvValues = Partial<Record<MemberCsvField, string>>;

/** Belgian (fr-BE) Excel splits ';' files into columns on open; ',' files are read too. */
export const MEMBER_CSV_SEPARATOR = ';';
export const MAX_MEMBER_IMPORT_ROWS = 1000;
/** Bytes, kept under Next's 1 MB Server Action body limit (JSON escaping of quotes and newlines adds overhead). */
export const MAX_MEMBER_IMPORT_BYTES = 500_000;
export const MEMBER_IMPORT_TOO_LARGE = 'Fichier trop volumineux (500 Ko maximum).';

export const memberCsvHeader = (key: string): string => MEMBER_CSV_COLUMNS.find((c) => c.key === key)?.header ?? key;

export function membersToCsvRows(members: Member[]): CsvCell[][] {
  return [
    MEMBER_CSV_COLUMNS.map((c) => c.header),
    ...members.map((m) => MEMBER_CSV_COLUMNS.map((c) => String(m[c.key] ?? ''))),
  ];
}

const text = (max: number): z.ZodString => z.string().max(max, `${max} caractères maximum`);

/** One CSV row; only the columns present in the file are checked. */
export const MemberCsvRowSchema = z
  .object({
    name: text(120).min(1, 'obligatoire'),
    email: z.union([z.literal(''), z.email('email invalide').max(200)]),
    phone: text(40),
    preferredGroup: z.enum(['', ...CYCLING_GROUPS], { error: `valeurs permises : ${CYCLING_GROUPS.join(', ')}` }),
    cotisation2026Status: z.enum(['', 'paid', 'pending', 'exempt'], { error: 'valeurs permises : paid, pending, exempt' }),
    cotisation2026PaidAt: text(40),
    ffbcLicenseNumber: text(40),
    stravaId: text(40),
    iceContactName: text(120),
    iceContactPhone: text(40),
    iceRelationship: text(60),
    bio: text(2000),
  })
  .partial();

export interface MemberImportPlan {
  creates: { line: number; values: MemberCsvValues }[];
  /** null clears the field (empty cell). */
  updates: { line: number; id: string; name: string; changes: Partial<Record<MemberCsvField, string | null>> }[];
  unchanged: number;
  rejected: { line: number; reason: string }[];
}

// Undo the export's formula guard (toCsv), so an exported file re-imports unchanged.
const unguard = (v: string): string => (/^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v);
const storedText = (m: Record<string, unknown> | undefined, key: string): string => String(m?.[key] ?? '').trim();

/**
 * Plans an import against the stored members (id → record). A row updates the member of its ID column,
 * else the one with the same email (case-insensitive), else creates one. Columns absent from the file are
 * left unchanged. Throws a French message when the whole file is unusable.
 */
export function planMembersImport(csv: string, existing: Map<string, Record<string, unknown>>): MemberImportPlan {
  if (new TextEncoder().encode(csv).length > MAX_MEMBER_IMPORT_BYTES) throw new Error(MEMBER_IMPORT_TOO_LARGE);
  const [header = [], ...records] = parseCsv(csv);
  const columns = header.map(
    (h) => MEMBER_CSV_COLUMNS.find((c) => c.header.toLowerCase() === h.trim().toLowerCase())?.key
  );
  if (!columns.some((k) => k === 'id' || k === 'name' || k === 'email')) {
    throw new Error('En-tête non reconnu : le fichier doit reprendre les colonnes d’un export (ID, Nom, Email…).');
  }
  const duplicate = columns.find((k, i) => k && columns.indexOf(k) !== i);
  if (duplicate) throw new Error(`Colonne « ${memberCsvHeader(duplicate)} » en double.`);
  const rows = records.map((cells, i) => ({ cells, line: i + 2 })).filter((r) => r.cells.some((c) => c.trim() !== ''));
  if (rows.length > MAX_MEMBER_IMPORT_ROWS) {
    throw new Error(`Trop de lignes : ${MAX_MEMBER_IMPORT_ROWS} membres maximum par import.`);
  }

  const byEmail = new Map<string, string>();
  for (const [id, m] of existing) {
    const email = storedText(m, 'email').toLowerCase();
    if (email) byEmail.set(email, id);
  }
  const plan: MemberImportPlan = { creates: [], updates: [], unchanged: 0, rejected: [] };
  const seen = new Map<string, number>();
  const fileEmails = new Map<string, number>(); // email (lower-case) → line that claims it

  for (const { cells, line } of rows) {
    const raw: Record<string, string> = {};
    columns.forEach((key, j) => {
      if (key) raw[key] = unguard((cells[j] ?? '').trim());
    });
    const { id = '', ...fields } = raw;
    const parsed = MemberCsvRowSchema.safeParse(fields);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      plan.rejected.push({ line, reason: `${memberCsvHeader(String(issue.path[0]))} : ${issue.message}` });
      continue;
    }
    const values = parsed.data as MemberCsvValues;
    const email = (values.email ?? '').toLowerCase();
    if (id && !existing.has(id)) {
      plan.rejected.push({ line, reason: 'ID inconnu : aucun membre avec cet identifiant.' });
      continue;
    }
    const targetId = id || (email ? byEmail.get(email) : undefined);
    const key = targetId ?? (email ? `new:${email}` : '');
    if (key && seen.has(key)) {
      plan.rejected.push({ line, reason: `Même membre que la ligne ${seen.get(key)}.` });
      continue;
    }
    if (key) seen.set(key, line);

    if (!targetId && !values.name) {
      plan.rejected.push({ line, reason: 'Nom : obligatoire pour un nouveau membre' });
      continue;
    }
    if (targetId && email && byEmail.has(email) && byEmail.get(email) !== targetId) {
      plan.rejected.push({ line, reason: 'Email déjà utilisé par un autre membre.' });
      continue;
    }
    const emailLine = email ? fileEmails.get(email) : undefined;
    if (emailLine) {
      plan.rejected.push({ line, reason: `Email déjà attribué à la ligne ${emailLine} de ce fichier.` });
      continue;
    }
    if (email) fileEmails.set(email, line);
    if (!targetId) {
      plan.creates.push({ line, values: Object.fromEntries(Object.entries(values).filter(([, v]) => v !== '')) });
      continue;
    }
    const current = existing.get(targetId);
    const changes = Object.fromEntries(
      Object.entries(values)
        .filter(([k, v]) => v !== storedText(current, k))
        .map(([k, v]) => [k, v === '' ? null : v])
    );
    if (Object.keys(changes).length === 0) plan.unchanged++;
    else plan.updates.push({ line, id: targetId, name: values.name || storedText(current, 'name'), changes });
  }
  return plan;
}
