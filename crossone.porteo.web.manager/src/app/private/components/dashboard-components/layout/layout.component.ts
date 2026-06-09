import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ThemeService, PALETTES, Palette } from 'src/app/core/services/theme.service';
import { ApiService } from '../../../http/api.service';

interface NavItem { label: string; icon: string; route: string; }
interface Crumb { label: string; link?: string; }
interface Notif { type: 'error' | 'warning' | 'info' | 'success'; title: string; detail: string; when: string; }

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

const LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord', missions: 'Missions', clients: 'Clients',
  consultants: 'Consultants', factures: 'Factures', parametres: 'Paramètres',
};

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
  notifOpen = false;
  searchOpen = false;
  searchTerm = '';
  palettes = PALETTES;

  nav: NavItem[] = [];
  roleLabel = 'Consultant';
  initials = 'P';
  factureBadge = 0;
  notifications: Notif[] = [];
  crumbs: Crumb[] = [];

  constructor(public auth: AuthService, public theme: ThemeService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.nav = this.auth.isAdmin ? NAV_ADMIN : NAV_CONSULTANT;
    this.roleLabel = this.auth.isAdmin ? 'Administrateur' : 'Consultant';
    const n = this.auth.fullName || 'P';
    this.initials = n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

    this.buildCrumbs(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.buildCrumbs((e as NavigationEnd).urlAfterRedirects));

    this.loadNotifications();
  }

  get hasNotif(): boolean { return this.notifications.length > 0; }

  badgeFor(route: string): number { return route === '/factures' ? this.factureBadge : 0; }

  private buildCrumbs(url: string): void {
    const segs = url.split('?')[0].split('/').filter(Boolean);
    const crumbs: Crumb[] = [{ label: 'Portéo' }];
    if (segs.length) {
      const root = segs[0];
      crumbs.push({ label: LABELS[root] ?? root, link: segs.length > 1 ? '/' + root : undefined });
      if (segs.length > 1) {
        const id = segs[1];
        crumbs.push({ label: root === 'missions' ? 'MIS-' + id.padStart(4, '0') : (root === 'factures' ? 'FAC-' + id : 'Détail') });
      }
    }
    this.crumbs = crumbs;
  }

  private loadNotifications(): void {
    const items: Notif[] = [];
    this.api.factures.list().subscribe(factures => {
      const now = new Date();
      factures.filter(f => f.statut === 'emise' && new Date(f.dateEcheance) < now).slice(0, 3)
        .forEach(f => items.push({ type: 'error', title: 'Facture en retard', detail: `${f.numero} · ${f.clientNom ?? ''}`, when: f.dateEcheance }));
      factures.filter(f => f.statut === 'payee').slice(0, 2)
        .forEach(f => items.push({ type: 'success', title: 'Facture payée', detail: `${f.numero} · ${(f.montantTTC).toLocaleString('fr-FR')} €`, when: f.dateEmission }));
      this.factureBadge = factures.filter(f => f.statut !== 'payee').length;
      this.api.missions.list({ pageSize: 3, sortBy: 'debut', sortDir: 'desc' }).subscribe(res => {
        res.items.forEach(m => items.push({ type: 'info', title: 'Mission récente', detail: `${m.titre} · ${m.clientNom ?? ''}`, when: m.dateDebut }));
        this.notifications = items;
      });
    });
  }

  doSearch(): void {
    this.searchOpen = false;
    this.router.navigate(['/missions']);
  }

  setPalette(p: Palette): void { this.theme.setPalette(p); this.palettesOpen = false; }
  logout(): void { this.auth.logout(); }
}
