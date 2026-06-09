import { Component, Input, OnChanges } from '@angular/core';

/** Mini sparkline (tendance) affichée dans les cartes KPI. */
@Component({
  selector: 'app-spark',
  standalone: false,
  template: `
    <svg *ngIf="path" [attr.viewBox]="'0 0 ' + W + ' ' + H" class="spark" preserveAspectRatio="none">
      <path [attr.d]="area" [attr.fill]="color" fill-opacity="0.12"></path>
      <path [attr.d]="path" fill="none" [attr.stroke]="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `,
  styles: [`.spark { width: 84px; height: 30px; display: block; }`],
})
export class SparkComponent implements OnChanges {
  @Input() data: number[] = [];
  @Input() color = 'var(--primary)';
  readonly W = 84;
  readonly H = 30;
  path = '';
  area = '';

  ngOnChanges(): void {
    const d = this.data ?? [];
    if (d.length < 2) { this.path = this.area = ''; return; }
    const pad = 2;
    const max = Math.max(...d), min = Math.min(...d);
    const range = max - min || 1;
    const stepX = (this.W - pad * 2) / (d.length - 1);
    const pts = d.map((v, i) => ({
      x: pad + i * stepX,
      y: this.H - pad - ((v - min) / range) * (this.H - pad * 2),
    }));
    this.path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    this.area = `${this.path} L ${pts[pts.length - 1].x.toFixed(1)} ${this.H} L ${pts[0].x.toFixed(1)} ${this.H} Z`;
  }
}
