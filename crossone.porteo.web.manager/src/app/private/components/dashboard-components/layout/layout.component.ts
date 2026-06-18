import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription, debounceTime, filter } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ThemeService, PALETTES, Palette } from 'src/app/core/services/theme.service';
import { RealtimeService, RealtimeNotification } from 'src/app/core/services/realtime.service';
import { LangService } from 'src/app/core/services/lang.service';
import { ApiService } from '../../../http/api.service';
import { SearchResult } from 'src/app/shared/models';

interface NavChild { label: string; icon: string; route: string; }
interface NavGroup { name: string; icon: string; children: NavChild[]; }
interface Crumb { label: string; link?: string; }
interface Notif { type: 'error' | 'warning' | 'info' | 'success'; title: string; detail: string; when: string; }

const NAV_ADMIN: NavGroup[] = [
  { name: 'Général', icon: 'icon-dashboard', children: [
    { label: 'Tableau de bord', icon: 'icon-dashboard', route: '/dashboard' },
    { label: "Centre d'alerte", icon: 'icon-chart-2', route: '/alertes' },
    { label: 'Journal', icon: 'icon-archive-book', route: '/journal' },
  ]},
  { name: 'Activité', icon: 'icon-briefcase', children: [
    { label: 'Missions', icon: 'icon-briefcase', route: '/missions' },
    { label: 'Clients', icon: 'icon-buildings', route: '/clients' },
    { label: 'Consultants', icon: 'icon-profile-2user', route: '/consultants' },
  ]},
  { name: 'Facturation', icon: 'icon-tag', children: [
    { label: 'Factures', icon: 'icon-tag', route: '/factures' },
    { label: 'Justificatifs', icon: 'icon-document-copy', route: '/justificatifs' },
  ]},
  { name: 'RH & Production', icon: 'icon-timer', children: [
    { label: 'CRA', icon: 'icon-timer', route: '/cra' },
    { label: 'Absences', icon: 'icon-airplane', route: '/absences' },
    { label: 'Demandes', icon: 'icon-message-question', route: '/demandes' },
    { label: 'Bulletins', icon: 'icon-receipt-2', route: '/bulletins' },
    { label: 'Simulateur', icon: 'icon-chart-square', route: '/simulateur' },
  ]},
  { name: 'Administration', icon: 'icon-setting', children: [
    { label: 'Assistant IA', icon: 'icon-message-question', route: '/assistant' },
    { label: 'Paramètres', icon: 'icon-setting', route: '/parametres' },
  ]},
];

const NAV_CONSULTANT: NavGroup[] = [
  { name: 'Général', icon: 'icon-dashboard', children: [
    { label: 'Mon tableau de bord', icon: 'icon-dashboard', route: '/dashboard' },
    { label: 'Mes alertes', icon: 'icon-chart-2', route: '/alertes' },
  ]},
  { name: 'Mon activité', icon: 'icon-briefcase', children: [
    { label: 'Mes missions', icon: 'icon-briefcase', route: '/missions' },
    { label: 'Mes factures', icon: 'icon-tag', route: '/factures' },
    { label: 'Mes justificatifs', icon: 'icon-document-copy', route: '/justificatifs' },
  ]},
  { name: 'RH', icon: 'icon-timer', children: [
    { label: 'Mes CRA', icon: 'icon-timer', route: '/cra' },
    { label: 'Mes absences', icon: 'icon-airplane', route: '/absences' },
    { label: 'Mes demandes', icon: 'icon-message-question', route: '/demandes' },
    { label: 'Mes bulletins', icon: 'icon-receipt-2', route: '/bulletins' },
  ]},
  { name: 'Outils', icon: 'icon-chart-square', children: [
    { label: 'Simulateur', icon: 'icon-chart-square', route: '/simulateur' },
    { label: 'Mon profil', icon: 'icon-setting', route: '/parametres' },
  ]},
];

const LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord', missions: 'Missions', clients: 'Clients',
  consultants: 'Consultants', factures: 'Factures', parametres: 'Paramètres',
  alertes: "Centre d'alerte", justificatifs: 'Justificatifs', journal: 'Journal',
  cra: 'CRA', absences: 'Absences', demandes: 'Demandes', bulletins: 'Bulletins', simulateur: 'Simulateur',
};

@Component({
  selector: 'app-layout',
  standalone: false,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  collapsed = false;
  mobileOpen = false;
  userMenuOpen = false;
  palettesOpen = false;
  notifOpen = false;
  searchOpen = false;
  searchTerm = '';
  palettes = PALETTES;

  groups: NavGroup[] = [];
  openGroup: string | null = null;
  currentUrl = '';
  private activeUrl: string | null = null;
  roleLabel = 'Consultant';
  initials = 'P';
  factureBadge = 0;
  notifications: Notif[] = [];
  crumbs: Crumb[] = [];
  searchResults: SearchResult[] = [];
  private search$ = new Subject<string>();
  private rtSub?: Subscription;

  constructor(
    public auth: AuthService, public theme: ThemeService, private api: ApiService,
    private router: Router, private toastr: ToastrService, private realtime: RealtimeService,
    public lang: LangService,
  ) {}

  ngOnInit(): void {
    this.groups = this.auth.isAdmin ? NAV_ADMIN : NAV_CONSULTANT;
    this.roleLabel = this.auth.isAdmin ? 'Administrateur' : 'Consultant';
    const n = this.auth.fullName || 'P';
    this.initials = n.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

    this.currentUrl = this.router.url;
    this.openActiveGroup();
    this.buildCrumbs(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
        this.openActiveGroup();
        this.buildCrumbs(this.currentUrl);
        this.mobileOpen = false;
      });

    this.loadNotifications();

    this.search$.pipe(debounceTime(250)).subscribe(q => {
      if (!q || q.trim().length < 2) { this.searchResults = []; return; }
      this.api.alerts.search(q).subscribe(r => (this.searchResults = r));
    });

    // Temps réel (SignalR) : notifications live.
    this.realtime.connect();
    this.rtSub = this.realtime.notifications$.subscribe(n => this.onRealtime(n));
  }

  ngOnDestroy(): void {
    this.rtSub?.unsubscribe();
    this.realtime.disconnect();
  }

  private onRealtime(n: RealtimeNotification): void {
    const tone = this.toneFor(n.type);
    this.notifications.unshift({ type: tone, title: n.titre, detail: n.description, when: n.when });
    if (this.notifications.length > 20) this.notifications.pop();
    const toast = { success: 'success', warning: 'warning', error: 'error', info: 'info' }[tone];
    (this.toastr as any)[toast](n.description, n.titre, { timeOut: 4000 });
  }

  private toneFor(type: string): Notif['type'] {
    if (/paid|valid/.test(type)) return 'success';
    if (/relance|retard|echu/.test(type)) return 'warning';
    if (/refus|delete|supprim|error/.test(type)) return 'error';
    return 'info';
  }

  onSearchInput(value: string): void { this.searchTerm = value; this.search$.next(value); }

  goResult(r: SearchResult): void {
    this.searchResults = []; this.searchTerm = '';
    this.router.navigateByUrl(r.route);
  }

  resultIcon(type: string): string {
    return { mission: '◆', client: '◢', consultant: '◉', facture: '▤' }[type] ?? '•';
  }

  get hasNotif(): boolean { return this.notifications.length > 0; }

  badgeFor(route: string): number { return route === '/factures' ? this.factureBadge : 0; }

  // ── Menu accordéon (un seul groupe ouvert, route-driven) ──────────────────
  private norm(url: string): string { return (url ?? '').split('?')[0].split('#')[0].replace(/\/+$/, ''); }
  private computeActiveUrl(): void {
    const u = this.norm(this.currentUrl);
    let best: string | null = null; let bestLen = -1;
    for (const g of this.groups) for (const c of g.children) {
      const t = this.norm(c.route);
      if ((u === t || u.startsWith(t + '/')) && t.length > bestLen) { bestLen = t.length; best = t; }
    }
    this.activeUrl = best;
  }
  isItemActive(route: string): boolean { return this.activeUrl != null && this.norm(route) === this.activeUrl; }
  isGroupActive(g: NavGroup): boolean { return g.children.some(c => this.isItemActive(c.route)); }
  isGroupOpen(g: NavGroup): boolean { return this.openGroup === g.name; }
  toggleGroup(g: NavGroup): void { this.openGroup = this.openGroup === g.name ? null : g.name; }
  private openActiveGroup(): void {
    this.computeActiveUrl();
    const active = this.groups.find(g => this.isGroupActive(g));
    if (active) this.openGroup = active.name;
    else if (this.openGroup == null) this.openGroup = this.groups[0]?.name ?? null;
  }
  toggleCollapse(): void { this.collapsed = !this.collapsed; }
  goToGroup(g: NavGroup): void { const f = g.children[0]; if (f) this.router.navigateByUrl(f.route); }
  goToProfile(): void { this.router.navigateByUrl('/parametres'); }
  getAvatarColor(): string { return 'var(--primary)'; }

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
    if (this.searchResults.length) { this.goResult(this.searchResults[0]); return; }
    this.router.navigate(['/missions']);
  }

  setPalette(p: Palette): void { this.theme.setPalette(p); this.palettesOpen = false; }
  logout(): void { this.auth.logout(); }
}
