import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ApiService } from '../../../http/api.service';
import { Mission, MissionStatut, MISSION_STATUTS, MissionUpsert } from 'src/app/shared/models';

interface BoardColumn { value: MissionStatut; label: string; missions: Mission[]; }

@Component({
  selector: 'app-missions-board',
  standalone: false,
  templateUrl: './missions-board.component.html',
  styleUrls: ['./missions-board.component.scss'],
})
export class MissionsBoardComponent implements OnInit {
  columns: BoardColumn[] = MISSION_STATUTS.map(s => ({ value: s.value, label: s.label, missions: [] }));
  loading = true;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  get isAdmin(): boolean { return this.auth.isAdmin; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.columns.forEach(c => (c.missions = []));
    this.api.missions.list({ pageSize: 500, sortBy: 'debut', sortDir: 'desc' }).subscribe({
      next: res => {
        for (const m of res.items) {
          const col = this.columns.find(c => c.value === m.statut) ?? this.columns[0];
          col.missions.push(m);
        }
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  drop(event: CdkDragDrop<Mission[]>, target: BoardColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    const mission = event.previousContainer.data[event.previousIndex];
    const previousStatut = mission.statut;
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    mission.statut = target.value;

    const dto: MissionUpsert = {
      titre: mission.titre, description: mission.description, statut: target.value,
      dateDebut: (mission.dateDebut || '').substring(0, 10),
      dateFin: (mission.dateFin || '').substring(0, 10),
      tjm: mission.tjm, jours: mission.jours,
      clientId: mission.clientId, consultantId: mission.consultantId,
    };
    this.api.missions.update(mission.id, dto).subscribe({
      next: () => this.toastr.success(`« ${mission.titre} » → ${target.label}`, 'Statut mis à jour'),
      error: () => {
        mission.statut = previousStatut;
        this.toastr.error('Mise à jour impossible. Rechargement…', 'Erreur');
        this.load();
      },
    });
  }

  columnTotal(c: BoardColumn): number { return c.missions.reduce((s, m) => s + (m.montant || 0), 0); }
  view(m: Mission): void { this.router.navigate(['/missions', m.id]); }

  initials(name?: string): string {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }
  avatarColor(name?: string): string {
    const palette = ['#2D7FF9', '#8B5CF6', '#E29215', '#15A66A', '#B0443A', '#1A5AB4', '#586860', '#0E5C4A'];
    const s = name ?? '';
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
    return palette[h % palette.length];
  }
}
