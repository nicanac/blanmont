export type CsvCell = string | number | undefined;

/** Quoted CSV. A text cell that a spreadsheet would run as a formula gets a leading quote. */
export function toCsv(rows: CsvCell[][], sep = ','): string {
  const esc = (v: CsvCell): string => {
    const text = typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? `'${v}` : String(v ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };
  return rows.map((r) => r.map(esc).join(sep)).join('\n');
}

/** Excel-friendly CSV download (BOM so accents survive). */
export function downloadCsv(filename: string, rows: CsvCell[][], sep = ','): void {
  const csv = toCsv(rows, sep);
  const url = URL.createObjectURL(
    new Blob([String.fromCharCode(0xfeff) + csv], { type: 'text/csv;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * RFC 4180 parser (quoted cells, "" escapes, separators and newlines inside quotes, CRLF, BOM).
 * The separator is the one the header line uses most: ';' (Belgian/French Excel) or ','.
 */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\u{FEFF}/u, '');
  const header = src.split(/\r?\n/, 1)[0];
  const sep = header.split(';').length >= header.split(',').length ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c !== '"') cell += c;
      else if (src[i + 1] === '"') cell += src[i++];
      else quoted = false;
    } else if (c === '"' && cell === '') {
      quoted = true;
    } else if (c === sep) {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += c;
    }
  }
  if (cell !== '' || row.length > 0) rows.push([...row, cell]);
  return rows;
}
