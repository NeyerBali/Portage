import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../../http/api.service';
import { MissionActions } from '../../../store/missions/mission.actions';
import {
  selectMissions, selectMissionsLoading, selectMissionsPage,
  selectMissionsPageSize, selectMissionsTotal,
} from '../../../store/missions/mission.selectors';
import { Client, Consultant, Mission, MISSION_STATUTS, MissionQueryParams } from 'src/app/shared/models';
import { MissionPopupComponent } from '../mission-popup/mission-popup.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-missions-list',
  standalone: false,
  templateUrl: './missions-list.component.html',
  styleUrls: ['./missions-list.component.scss'],
})
export class MissionsListComponent implements OnInit, OnDestroy {
  missions$ = this.store.select(selectMissions);
  loading$ = this.store.select(selectMissionsLoading);
  total$ = this.store.select(selectMissionsTotal);
  page$ = this.store.select(selectMissionsPage);
  pageSize$ = this.store.select(selectMissionsPageSize);

  statuts = MISSION_STATUTS;
  clients: Client[] = [];
  consultants: Consultant[] = [];

  showFilters = false;
  params: MissionQueryParams = { page: 1, pageSize: 8, sortBy: 'debut', sortDir: 'desc' };
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private api: ApiService,
    public auth: AuthService,
  ) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }
  get activeFilterCount(): number {
    return [this.params.statut, this.params.clientId, this.params.consultantId, this.params.debutApres, this.params.debutAvant]
      .filter(v => v !== undefined && v !== null && v !== '').length;
  }

  ngOnInit(): void {
    this.reload();
    this.search$.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(v => {
      this.params = { ...this.params, search: v, page: 1 };
      this.reload();
    });
    if (this.isAdmin) {
      this.api.clients.list().subscribe(c => (this.clients = c));
      this.api.consultants.list().subscribe(c => (this.consultants = c));
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  reload(): void { this.store.dispatch(MissionActions.load({ params: { ...this.params } })); }

  onSearch(value: string): void { this.search$.next(value); }

  quickStatus(statut: string | null): void {
    this.params = { ...this.params, statut: statut ?? undefined, page: 1 };
    this.reload();
  }

  applyFilters(): void { this.params = { ...this.params, page: 1 }; this.reload(); }

  resetFilters(): void {
    this.params = { page: 1, pageSize: this.params.pageSize, sortBy: 'debut', sortDir: 'desc', search: this.params.search };
    this.reload();
  }

  sort(col: string): void {
    const dir = this.params.sortBy === col && this.params.sortDir === 'asc' ? 'desc' : 'asc';
    this.params = { ...this.params, sortBy: col, sortDir: dir };
    this.reload();
  }

  sortIcon(col: string): string {
    if (this.params.sortBy !== col) return '↕';
    return this.params.sortDir === 'asc' ? '↑' : '↓';
  }

  goPage(p: number, total: number, pageSize: number): void {
    const max = Math.max(1, Math.ceil(total / pageSize));
    if (p < 1 || p > max) return;
    this.params = { ...this.params, page: p };
    this.reload();
  }

  openCreate(): void {
    const ref = this.dialog.open(MissionPopupComponent, {
      panelClass: 'porteo-dialog', width: '720px', maxWidth: '95vw',
      data: { mission: null, clients: this.clients, consultants: this.consultants },
    });
    ref.afterClosed().subscribe(res => {
      if (res?.dto) this.store.dispatch(MissionActions.create({ dto: res.dto }));
    });
  }

  openEdit(m: Mission): void {
    const ref = this.dialog.open(MissionPopupComponent, {
      panelClass: 'porteo-dialog', width: '720px', maxWidth: '95vw',
      data: { mission: m, clients: this.clients, consultants: this.consultants },
    });
    ref.afterClosed().subscribe(res => {
      if (res?.dto) this.store.dispatch(MissionActions.update({ id: m.id, dto: res.dto }));
    });
  }

  min(a: number, b: number): number { return Math.min(a, b); }
  ceil(total: number, pageSize: number): number { return Math.max(1, Math.ceil(total / pageSize)); }

  initials(name?: string): string {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(name?: string): string {
    const palette = ['#0E5C4A', '#2D7FF9', '#8B5CF6', '#E29215', '#15A66A', '#B0443A', '#1A5AB4', '#586860'];
    const s = name ?? '';
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
    return palette[h % palette.length];
  }

  confirmDelete(m: Mission): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'porteo-dialog', width: '440px',
      data: { title: 'Supprimer la mission', message: `Confirmer la suppression de « ${m.titre} » ? Cette action est irréversible.`, confirmLabel: 'Supprimer', destructive: true },
    });
    ref.afterClosed().subscribe(ok => { if (ok) this.store.dispatch(MissionActions.delete({ id: m.id })); });
  }
}
