import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';

/** Site vitrine (marketing) — page d'accueil publique de Portéo. */
@Component({
  selector: 'app-vitrine',
  standalone: false,
  templateUrl: './vitrine.component.html',
  styleUrls: ['./vitrine.component.scss'],
})
export class VitrineComponent implements AfterViewInit {
  scrolled = false;
  mobileOpen = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 20; }

  ngAfterViewInit(): void {
    const reveals = Array.from(this.el.nativeElement.querySelectorAll<HTMLElement>('.reveal'));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
        { threshold: 0.12 },
      );
      reveals.forEach(el => io.observe(el));
      // Filet de sécurité : rien ne reste masqué.
      setTimeout(() => reveals.forEach(el => el.classList.add('in')), 2500);
    } else {
      reveals.forEach(el => el.classList.add('in'));
    }
  }

  scrollTo(id: string): void {
    this.mobileOpen = false;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
