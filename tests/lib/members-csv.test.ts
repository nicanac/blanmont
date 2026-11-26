import { describe, it, expect } from 'vitest';
import { parseCsv, toCsv } from '@/app/lib/csv';
import {
  MAX_MEMBER_IMPORT_BYTES,
  MAX_MEMBER_IMPORT_ROWS,
  MEMBER_CSV_SEPARATOR,
  MemberCsvRowSchema,
  membersToCsvRows,
  planMembersImport,
} from '@/app/lib/members-csv';
import type { Member } from '@/app/types';

const BOM = String.fromCharCode(0xfeff);

const member = (id: string, extra: Partial<Member> = {}): Member => ({
  id,
  name: id,
  role: ['Member'],
  bio: '',
  photoUrl: '/images/default-avatar.png',
  ...extra,
});

const stored = (...members: Member[]): Map<string, Record<string, unknown>> =>
  new Map(members.map(({ id, ...rest }) => [id, { ...rest, authUid: `uid-${id}` }]));

const exportCsv = (members: Member[]): string => BOM + toCsv(membersToCsvRows(members), MEMBER_CSV_SEPARATOR);

describe('toCsv / parseCsv', () => {
  it('quotes separators, quotes and newlines and guards formula cells', () => {
    expect(toCsv([['a;b', 'Léa "L"', 'l1\nl2', '=1+1', '+32 470', '@x', '-1', '\tA']], ';')).toBe(
      `"a;b";"Léa ""L""";"l1\nl2";"'=1+1";"'+32 470";"'@x";"'-1";"'\tA"`
    );
  });

  it('parses quoted cells, CRLF, a BOM and an empty last cell', () => {
    expect(parseCsv(BOM + '"ID";"Nom"\r\n"1";"a;""b""\r\nc"\r\n2;\r\n')).toEqual([
      ['ID', 'Nom'],
      ['1', 'a;"b"\r\nc'],
      ['2', ''],
    ]);
  });

  it('detects a comma-separated file from its header', () => {
    expect(parseCsv('Nom,Email\n"Doe; John",j@example.test')).toEqual([
      ['Nom', 'Email'],
      ['Doe; John', 'j@example.test'],
    ]);
  });

  it('reads back what it writes', () => {
    const rows = [['x', 'y;z'], ['"q"', 'a\nb'], ['', 'é']];
    expect(parseCsv(toCsv(rows, ';'))).toEqual(rows);
  });
});

describe('MemberCsvRowSchema', () => {
  it('accepts empty optional cells and checks emails, groups and statuses', () => {
    expect(MemberCsvRowSchema.safeParse({ name: 'A', email: '', preferredGroup: '' }).success).toBe(true);
    expect(MemberCsvRowSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
    expect(MemberCsvRowSchema.safeParse({ preferredGroup: 'Z' }).success).toBe(false);
    expect(MemberCsvRowSchema.safeParse({ cotisation2026Status: 'payé' }).success).toBe(false);
    expect(MemberCsvRowSchema.safeParse({ name: '' }).success).toBe(false);
  });
});

describe('planMembersImport', () => {
  const alice = member('m1', {
    name: 'Alice; "Ali"',
    email: 'Alice@Example.test',
    phone: '+32 470 12 34 56',
    preferredGroup: 'A',
    cotisation2026Status: 'paid',
    bio: 'Ligne 1\nLigne 2',
    iceContactName: '=HYPERLINK("x")',
  });
  const bob = member('m2', { name: 'Bob', email: 'bob@example.test', role: ['Admin'] });

  it('re-imports an export with zero changes (round trip)', () => {
    const plan = planMembersImport(exportCsv([alice, bob]), stored(alice, bob));
    expect(plan).toEqual({ creates: [], updates: [], unchanged: 2, rejected: [] });
  });

  it('plans creates, updates (by id or email, case-insensitive) and rejects with a reason', () => {
    const csv = [
      'ID;Nom;Email;Groupe',
      'm1;Alice;alice@example.test;B',
      ';Bob;BOB@EXAMPLE.TEST;C',
      ';Carla;carla@example.test;A',
      'nope;Dan;;A',
      ';Eve;eve@example;A',
      ';Fay;;Z',
      ';Alice bis;alice@example.test;A',
      ';;;',
    ].join('\n');
    const plan = planMembersImport(csv, stored(alice, bob));
    expect(plan.updates).toEqual([
      { line: 2, id: 'm1', name: 'Alice', changes: { name: 'Alice', email: 'alice@example.test', preferredGroup: 'B' } },
      { line: 3, id: 'm2', name: 'Bob', changes: { email: 'BOB@EXAMPLE.TEST', preferredGroup: 'C' } },
    ]);
    expect(plan.creates).toEqual([{ line: 4, values: { name: 'Carla', email: 'carla@example.test', preferredGroup: 'A' } }]);
    expect(plan.rejected.map((r) => [r.line, r.reason])).toEqual([
      [5, 'ID inconnu : aucun membre avec cet identifiant.'],
      [6, 'Email : email invalide'],
      [7, expect.stringMatching(/^Groupe : valeurs permises/)],
      [8, 'Même membre que la ligne 2.'],
    ]);
  });

  it('leaves absent columns unchanged and clears a field on an empty cell', () => {
    const plan = planMembersImport('ID;Téléphone\nm1;', stored(alice));
    expect(plan.updates).toEqual([{ line: 2, id: 'm1', name: alice.name, changes: { phone: null } }]);
  });

  it('refuses to move an email onto another member', () => {
    const plan = planMembersImport('ID;Email\nm1;bob@example.test', stored(alice, bob));
    expect(plan.rejected).toEqual([{ line: 2, reason: 'Email déjà utilisé par un autre membre.' }]);
  });

  it('refuses an email that another row of the same file already assigns', () => {
    const carl = member('m3', { email: 'carl@example.test' });
    const csv = [
      'ID;Nom;Email',
      'm1;Alice;new@example.test',
      'm3;Carl;NEW@example.test',
      ';Zoé;new@example.test',
      ';Yan;yan@example.test',
      'm3;Carl;yan@example.test',
    ].join('\n');
    const plan = planMembersImport(csv, stored(alice, carl));
    expect(plan.updates.map((u) => u.line)).toEqual([2]);
    expect(plan.creates.map((c) => c.line)).toEqual([5]);
    expect(plan.rejected).toEqual([
      { line: 3, reason: 'Email déjà attribué à la ligne 2 de ce fichier.' },
      { line: 4, reason: 'Email déjà attribué à la ligne 2 de ce fichier.' },
      { line: 6, reason: 'Même membre que la ligne 3.' },
    ]);
  });

  it('caps the file in bytes, not characters', () => {
    const accents = 'Nom\n' + 'é'.repeat(MAX_MEMBER_IMPORT_BYTES / 2 + 1);
    expect(accents.length).toBeLessThan(MAX_MEMBER_IMPORT_BYTES);
    expect(() => planMembersImport(accents, new Map())).toThrow(/500 Ko/);
  });

  it('ignores role, admin and login columns', () => {
    const csv = 'ID;Nom;Rôles;role;isAdmin;authUid\nm1;Alice;Admin;Admin;true;x\n;New;Admin;Admin;true;x';
    const plan = planMembersImport(csv, stored(alice));
    expect(plan.updates).toEqual([{ line: 2, id: 'm1', name: 'Alice', changes: { name: 'Alice' } }]);
    expect(plan.creates).toEqual([{ line: 3, values: { name: 'New' } }]);
  });

  it('rejects an unknown header, duplicate columns and too many rows', () => {
    expect(() => planMembersImport('foo;bar\n1;2', new Map())).toThrow(/En-tête non reconnu/);
    expect(() => planMembersImport('Nom;nom\na;b', new Map())).toThrow(/en double/);
    const many = ['Nom', ...Array.from({ length: MAX_MEMBER_IMPORT_ROWS + 1 }, (_, i) => `M${i}`)].join('\n');
    expect(() => planMembersImport(many, new Map())).toThrow(/Trop de lignes/);
  });
});
