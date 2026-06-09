import { Component, Input } from '@angular/core';
import { factureStatutLabel, justifStatutLabel, missionStatutLabel } from 'src/app/shared/models';

@Component({
  selector: 'app-status-badge',
  standalone: false,
  template: `<span class="badge {{ status }}"><span class="dot"></span>{{ label }}</span>`,
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() kind: 'mission' | 'facture' | 'consultant' | 'justificatif' = 'mission';

  get label(): string {
    if (this.kind === 'facture') return factureStatutLabel(this.status);
    if (this.kind === 'consultant') return this.status === 'paused' ? 'En pause' : 'Actif';
    if (this.kind === 'justificatif') return justifStatutLabel(this.status);
    return missionStatutLabel(this.status);
  }
}
