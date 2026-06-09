import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ThemeService, PALETTES, Palette } from 'src/app/core/services/theme.service';

interface NavItem { label: string; icon: string; route: string; }

const NAV_ADMIN: NavItem[] = [
  { label: 'Tableau de bord', icon: '◧', route: '/dashboard' },
  { label: 'Missions', icon: '◆', route: '/missions' },
  { label: 'Clients', icon: '◢', route: '/clients' },
  { label: 'Consultants', icon: '◉', route: '/consultants' },
  { label: 'Factures', icon: '▤', route: '/factures' },
  { label: 'Paramètres', icon: '⚙', route: '/parametres' },
];

const NAV_CONSULTANT: NavItem[] = [
  { label: 'Mon tableau de bord', icon: '◧', route: '/dashboard' },
  { label: 'Mes missions', icon: '◆', route: '/missions' },
  { label: 'Mes factures', icon: '▤', route: '/factures' },
  { label: 'Mon profil', icon: '⚙', route: '/parametres' },
];

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  collapsed = false;
  userMenuOpen = false;
  palettesOpen = false;
  palettes = PALETTES;

  // Référence STABLE (calculée une fois) : évite une boucle de détection de
  // changements avec les routerLink/routerLinkActive du menu.
  nav: NavItem[] = [];
  roleLabel = 'Consultant';
  initials = 'P';

  constructor(public auth: AuthService, public theme: ThemeService) {}

  ngOnInit(): void {
    this.nav = this.auth.isAdmin ? NAV_ADMIN : NAV_CONSULTANT;
    this.roleLabel = this.auth.isAdmin ? 'Administrateur' : 'Consultant';
    const n = this.auth.fullName || 'P';
    this.initials = n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  setPalette(p: Palette): void { this.theme.setPalette(p); this.palettesOpen = false; }
  logout(): void { this.auth.logout(); }
}
