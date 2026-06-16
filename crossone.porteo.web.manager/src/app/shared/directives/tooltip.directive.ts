import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';

/**
 * Tooltip flottante stylée. Usage : `<div [appTooltip]="'Titre\nDétail'">`.
 * La 1ʳᵉ ligne est le titre (gras), les suivantes sont des détails.
 * Le tooltip suit le curseur et est ajouté au <body> (jamais coupé par overflow).
 */
@Directive({
  selector: '[appTooltip]',
  standalone: false,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') content = '';
  private tip?: HTMLElement;

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter')
  onEnter(): void {
    if (!this.content) return;
    this.tip = document.createElement('div');
    this.tip.className = 'app-tooltip';
    this.tip.innerHTML = this.content
      .split('\n')
      .filter(l => l.length)
      .map((l, i) => (i === 0 ? `<strong>${esc(l)}</strong>` : `<span>${esc(l)}</span>`))
      .join('');
    document.body.appendChild(this.tip);
    requestAnimationFrame(() => this.tip?.classList.add('show'));
  }

  @HostListener('mousemove', ['$event'])
  onMove(e: MouseEvent): void {
    if (!this.tip) return;
    const pad = 14;
    const r = this.tip.getBoundingClientRect();
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + r.width + 8 > window.innerWidth) x = e.clientX - r.width - pad;
    if (y + r.height + 8 > window.innerHeight) y = e.clientY - r.height - pad;
    this.tip.style.left = `${Math.max(8, x)}px`;
    this.tip.style.top = `${Math.max(8, y)}px`;
  }

  @HostListener('mouseleave')
  onLeave(): void { this.hide(); }

  ngOnDestroy(): void { this.hide(); }

  private hide(): void { this.tip?.remove(); this.tip = undefined; }
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}
