import { Component, Input, OnChanges } from '@angular/core';

export interface AreaPoint { label: string; value: number; }

@Component({
  selector: 'app-area-chart',
  standalone: false,
  template: `
    <div class="area-wrap">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" preserveAspectRatio="none" class="area">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"></stop>
            <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <path [attr.d]="areaPath" fill="url(#areaGrad)"></path>
        <path [attr.d]="linePath" fill="none" stroke="var(--primary)" stroke-width="2.5"></path>
        <circle *ngFor="let p of dots" [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="var(--bg-surface)" stroke="var(--primary)" stroke-width="2"></circle>
        <!-- Zones de survol (tooltip mois + valeur) -->
        <circle *ngFor="let p of dots; let i = index" [attr.cx]="p.x" [attr.cy]="p.y" r="16"
                fill="transparent" class="hit"
                [appTooltip]="points[i].label + '\n' + (points[i].value | number:'1.0-0') + ' €'"></circle>
      </svg>
      <div class="labels">
        <span *ngFor="let p of points">{{ p.label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .area-wrap { width: 100%; }
    .area { width: 100%; height: 200px; display: block; overflow: visible; }
    .hit { cursor: pointer; transition: fill .12s, fill-opacity .12s; }
    .hit:hover { fill: var(--accent); fill-opacity: .16; }
    .labels { display: flex; justify-content: space-between; font-size: 10px; color: var(--text-subtle); margin-top: 6px; }
    .labels span { flex: 1; text-align: center; text-transform: capitalize; }
  `],
})
export class AreaChartComponent implements OnChanges {
  @Input() points: AreaPoint[] = [];
  readonly W = 600;
  readonly H = 200;
  linePath = '';
  areaPath = '';
  dots: { x: number; y: number }[] = [];

  ngOnChanges(): void {
    const pts = this.points ?? [];
    if (!pts.length) { this.linePath = this.areaPath = ''; this.dots = []; return; }
    const pad = 10;
    const max = Math.max(1, ...pts.map(p => p.value));
    const stepX = (this.W - pad * 2) / Math.max(1, pts.length - 1);
    const coords = pts.map((p, i) => ({
      x: pad + i * stepX,
      y: this.H - pad - (p.value / max) * (this.H - pad * 2),
    }));
    this.dots = coords;
    this.linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    this.areaPath = `${this.linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${this.H - pad} L ${coords[0].x.toFixed(1)} ${this.H - pad} Z`;
  }
}
