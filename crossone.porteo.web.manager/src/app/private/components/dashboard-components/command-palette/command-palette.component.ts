import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../../http/api.service';
import { SearchResult } from 'src/app/shared/models';

interface PaletteItem { label: string; sub?: string; icon: string; route: string; group: string; }

/** Palette de commandes globale (⌘K / Ctrl+K) : recherche + navigation au clavier. */
@Component({
  selector: 'app-command-palette',
  standalone: false,
  templateUrl: './command-palette.component.html',
  styleUrls: ['./command-palette.component.scss'],
})
export class CommandPaletteComponent implements OnInit {
  open = false;
  query = '';
  selected = 0;
  results: SearchResult[] = [];
  private commands: PaletteItem[] = [];
  private search$ = new Subject<string>();
  @ViewChild('input') input?: ElementRef<HTMLInputElement>;

  constructor(public auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.commands = this.buildCommands();
    this.search$.pipe(debounceTime(200)).subscribe(q => {
      if (q.trim().length < 2) { this.results = []; return; }
      this.api.alerts.search(q).subscribe(r => { this.results = r; this.selected = 0; });
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); this.toggle(); return; }
    if (!this.open) return;
    const items = this.items;
    if (e.key === 'Escape') { this.close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); this.selected = Math.min(items.length - 1, this.selected + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.selected = Math.max(0, this.selected - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); this.go(items[this.selected]); }
  }

  get items(): PaletteItem[] {
    const q = this.query.trim().toLowerCase();
    const cmds = this.commands.filter(c => !q || c.label.toLowerCase().includes(q));
    const res: PaletteItem[] = this.results.map(r => ({ label: r.titre, sub: r.sousTitre, icon: this.typeIcon(r.type), route: r.route, group: 'Résultats' }));
    return [...cmds, ...res];
  }

  toggle(): void { this.open ? this.close() : this.openPalette(); }
  private openPalette(): void { this.open = true; this.query = ''; this.results = []; this.selected = 0; setTimeout(() => this.input?.nativeElement.focus(), 30); }
  close(): void { this.open = false; }
  onInput(v: string): void { this.query = v; this.selected = 0; this.search$.next(v); }
  go(item?: PaletteItem): void { if (!item) return; this.close(); this.router.navigateByUrl(item.route); }
  typeIcon(t: string): string { return ({ mission: '◆', client: '◢', consultant: '◉', facture: '▤' } as Record<string, string>)[t] ?? '•'; }

  private buildCommands(): PaletteItem[] {
    const cmds: PaletteItem[] = [
      { group: 'Aller à', label: 'Tableau de bord', icon: '◧', route: '/dashboard' },
      { group: 'Aller à', label: 'Missions', icon: '◆', route: '/missions' },
      { group: 'Aller à', label: 'Kanban des missions', icon: '⊞', route: '/missions/tableau' },
      { group: 'Aller à', label: 'Factures', icon: '▤', route: '/factures' },
      { group: 'Aller à', label: 'Justificatifs', icon: '📎', route: '/justificatifs' },
      { group: 'Aller à', label: 'CRA', icon: '◷', route: '/cra' },
      { group: 'Aller à', label: 'Absences', icon: '🌴', route: '/absences' },
      { group: 'Aller à', label: 'Demandes', icon: '✉', route: '/demandes' },
      { group: 'Aller à', label: 'Bulletins', icon: '€', route: '/bulletins' },
      { group: 'Aller à', label: 'Simulateur', icon: '∿', route: '/simulateur' },
      { group: 'Aller à', label: 'Paramètres', icon: '⚙', route: '/parametres' },
    ];
    if (this.auth.isAdmin) {
      cmds.splice(4, 0,
        { group: 'Aller à', label: 'Clients', icon: '◢', route: '/clients' },
        { group: 'Aller à', label: 'Consultants', icon: '◉', route: '/consultants' });
      cmds.push(
        { group: 'Aller à', label: "Centre d'alerte", icon: '⚠', route: '/alertes' },
        { group: 'Aller à', label: 'Journal', icon: '≣', route: '/journal' });
    }
    return cmds;
  }
}
