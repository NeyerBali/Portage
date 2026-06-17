import * as XLSX from 'xlsx';

/** Génère et télécharge un vrai classeur Excel (.xlsx) avec en-têtes et largeurs auto. */
export function downloadXlsx<T>(
  filename: string,
  rows: T[],
  columns: { key: keyof T | string; label: string }[],
  sheetName = 'Données',
): void {
  const labels = columns.map(c => c.label);
  const data = rows.map(r => {
    const o: Record<string, unknown> = {};
    for (const c of columns) o[c.label] = (r as any)[c.key] ?? '';
    return o;
  });

  const ws = XLSX.utils.json_to_sheet(data, { header: labels });
  // Largeur des colonnes : adaptée au contenu (min 12).
  ws['!cols'] = columns.map(c => {
    const maxData = data.reduce((max, row) => Math.max(max, String((row as any)[c.label] ?? '').length), 0);
    return { wch: Math.min(48, Math.max(12, c.label.length + 2, maxData + 2)) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  XLSX.writeFile(wb, filename, { compression: true });
}
