import { Component, Input } from '@angular/core';
import { factureStatutLabel } from 'src/app/shared/models';
import { missionStatutLabel } from 'src/app/shared/models';

@Component({
  selector: 'app-status-badge',
  standalone: false,
  template: `<span class="badge {{ status }}"><span class="dot"></span>{{ label }}</span>`,
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() kind: 'mission' | 'facture' | 'consultant' = 'mission';

  get label(): string {
    if (this.kind === 'facture') return factureStatutLabel(this.status);
    if (this.kind === 'consultant') return this.status === 'paused' ? 'En pause' : 'Actif';
    return missionStatutLabel(this.status);
  }
}
