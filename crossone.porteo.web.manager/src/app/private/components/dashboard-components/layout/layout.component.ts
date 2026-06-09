import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ThemeService, PALETTES, Palette } from 'src/app/core/services/theme.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  collapsed = false;
  userMenuOpen = false;
  palettesOpen = false;
  palettes = PALETTES;

  constructor(public auth: AuthService, public theme: ThemeService) {}

  get nav(): NavItem[] {
    if (this.auth.isAdmin) {
      return [
        { label: 'Tableau de bord', icon: '◧', route: '/dashboard' },
        { label: 'Missions', icon: '◆', route: '/missions' },
        { label: 'Clients', icon: '◢', route: '/clients' },
        { label: 'Consultants', icon: '◉', route: '/consultants' },
        { label: 'Factures', icon: '▤', route: '/factures' },
        { label: 'Paramètres', icon: '⚙', route: '/parametres' },
      ];
    }
    return [
      { label: 'Mon tableau de bord', icon: '◧', route: '/dashboard' },
      { label: 'Mes missions', icon: '◆', route: '/missions' },
      { label: 'Mes factures', icon: '▤', route: '/factures' },
      { label: 'Mon profil', icon: '⚙', route: '/parametres' },
    ];
  }

  get roleLabel(): string { return this.auth.isAdmin ? 'Administrateur' : 'Consultant'; }
  get initials(): string {
    const n = this.auth.fullName || 'P';
    return n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  setPalette(p: Palette): void { this.theme.setPalette(p); this.palettesOpen = false; }
  logout(): void { this.auth.logout(); }
}
