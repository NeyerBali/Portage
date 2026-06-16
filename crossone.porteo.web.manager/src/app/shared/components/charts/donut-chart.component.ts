import { Component, Input, OnChanges } from '@angular/core';

export interface DonutSegment { label: string; value: number; color: string; }

@Component({
  selector: 'app-donut-chart',
  standalone: false,
  template: `
    <div class="donut-wrap">
      <svg viewBox="0 0 120 120" class="donut">
        <circle cx="60" cy="60" r="46" fill="none" stroke="var(--bg-sunken)" stroke-width="16"></circle>
        <circle *ngFor="let a of arcs" cx="60" cy="60" r="46" fill="none"
                [attr.stroke]="a.color" stroke-width="16" stroke-linecap="butt"
                [attr.stroke-dasharray]="a.dash" [attr.stroke-dashoffset]="a.offset"
                transform="rotate(-90 60 60)" class="arc"
                [appTooltip]="a.label + '\n' + a.value + ' mission(s) · ' + a.pct + '%'"></circle>
        <text x="60" y="56" text-anchor="middle" class="donut-total">{{ total }}</text>
        <text x="60" y="72" text-anchor="middle" class="donut-sub">missions</text>
      </svg>
      <ul class="legend">
        <li *ngFor="let s of segments" [appTooltip]="s.label + '\n' + s.value + ' mission(s) · ' + pct(s.value) + '%'">
          <span class="sw" [style.background]="s.color"></span>{{ s.label }}
          <span class="v">{{ s.value }}</span>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .donut-wrap { display: flex; align-items: center; gap: var(--sp-6); flex-wrap: wrap; }
    .donut { width: 160px; height: 160px; }
    .donut-total { font-family: var(--font-display); font-size: 26px; fill: var(--text-strong); }
    .donut-sub { font-size: 9px; fill: var(--text-subtle); text-transform: uppercase; letter-spacing: .1em; }
    .legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: var(--t-sm); }
    .legend li { display: flex; align-items: center; gap: 8px; cursor: default; border-radius: 7px; padding: 2px 4px; transition: background .12s; }
    .legend li:hover { background: var(--bg-sunken); }
    .legend .sw { width: 11px; height: 11px; border-radius: 3px; }
    .legend .v { margin-left: auto; font-family: var(--font-mono); color: var(--text-muted); }
    .arc { cursor: pointer; transition: opacity .12s, stroke-width .12s; }
    .arc:hover { opacity: .82; }
  `],
})
export class DonutChartComponent implements OnChanges {
  @Input() segments: DonutSegment[] = [];
  arcs: { color: string; dash: string; offset: number; label: string; value: number; pct: number }[] = [];
  total = 0;

  ngOnChanges(): void {
    const C = 2 * Math.PI * 46;
    this.total = this.segments.reduce((s, x) => s + x.value, 0);
    let acc = 0;
    this.arcs = this.segments.filter(s => s.value > 0).map(s => {
      const frac = this.total ? s.value / this.total : 0;
      const len = frac * C;
      const arc = { color: s.color, dash: `${len} ${C - len}`, offset: -acc, label: s.label, value: s.value, pct: Math.round(frac * 100) };
      acc += len;
      return arc;
    });
  }

  pct(v: number): number { return this.total ? Math.round((v / this.total) * 100) : 0; }
}
