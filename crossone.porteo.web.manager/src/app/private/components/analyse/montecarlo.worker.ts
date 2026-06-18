/// <reference lib="webworker" />

/**
 * Web Worker — simulation Monte-Carlo du recouvrement des factures impayées.
 * S'exécute sur un THREAD séparé (vrai parallélisme) : l'interface reste fluide
 * pendant des dizaines de milliers d'itérations.
 */

interface SimInvoice { montant: number; prob: number; }
interface SimInput { invoices: SimInvoice[]; runs: number; }

addEventListener('message', ({ data }: MessageEvent<SimInput>) => {
  const { invoices, runs } = data;
  const totals: number[] = new Array(runs);
  const step = Math.max(1, Math.floor(runs / 100));

  for (let r = 0; r < runs; r++) {
    let sum = 0;
    for (let i = 0; i < invoices.length; i++) {
      if (Math.random() < invoices[i].prob) sum += invoices[i].montant;
    }
    totals[r] = sum;
    if (r % step === 0) postMessage({ type: 'progress', value: Math.round((r / runs) * 100) });
  }

  totals.sort((a, b) => a - b);
  const pct = (p: number) => totals[Math.min(totals.length - 1, Math.floor((p / 100) * totals.length))];
  const mean = totals.reduce((s, x) => s + x, 0) / totals.length;

  // Histogramme (12 classes)
  const bins = 12;
  const min = totals[0], max = totals[totals.length - 1];
  const width = (max - min) / bins || 1;
  const hist = new Array(bins).fill(0);
  for (const t of totals) hist[Math.min(bins - 1, Math.floor((t - min) / width))]++;

  postMessage({ type: 'done', result: { mean, p10: pct(10), p50: pct(50), p90: pct(90), min, max, hist, bins, width } });
});
