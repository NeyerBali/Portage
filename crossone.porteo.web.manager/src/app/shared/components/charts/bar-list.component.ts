import { Component, Input, OnChanges } from '@angular/core';

export interface BarItem { label: string; value: number; sub?: string; }

@Component({
  selector: 'app-bar-list',
  standalone: false,
  template: `
    <ul class="bars">
      <li *ngFor="let it of items">
        <div class="bar-top">
          <span class="lbl">{{ it.label }}</span>
          <span class="val mono">{{ it.value | number:'1.0-0' }} €</span>
        </div>
        <div class="track"><div class="fill" [style.width.%]="pct(it.value)"></div></div>
      </li>
    </ul>
  `,
  styles: [`
    .bars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--sp-4); }
    .bar-top { display: flex; justify-content: space-between; font-size: var(--t-sm); margin-bottom: 6px; }
    .bar-top .val { color: var(--text-muted); }
    .track { height: 9px; background: var(--bg-sunken); border-radius: var(--r-pill); overflow: hidden; }
    .fill { height: 100%; border-radius: var(--r-pill); background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width var(--dur-slow) var(--ease-out); }
  `],
})
export class BarListComponent implements OnChanges {
  @Input() items: BarItem[] = [];
  private max = 1;
  ngOnChanges(): void { this.max = Math.max(1, ...this.items.map(i => i.value)); }
  pct(v: number): number { return Math.round((v / this.max) * 100); }
}
