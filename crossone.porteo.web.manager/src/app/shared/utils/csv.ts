/** Génère et télécharge un fichier CSV (séparateur ';' pour Excel FR, BOM UTF-8). */
export function downloadCsv<T>(filename: string, rows: T[], columns: { key: keyof T | string; label: string }[]): void {
  const escape = (v: any): string => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[";\n]/.test(s) ? `"${s}"` : s;
  };
  const header = columns.map(c => escape(c.label)).join(';');
  const lines = rows.map(r => columns.map(c => escape((r as any)[c.key])).join(';'));
  const csv = '﻿' + [header, ...lines].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
