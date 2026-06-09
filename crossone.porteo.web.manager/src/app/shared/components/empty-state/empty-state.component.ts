import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: false,
  template: `
    <div class="empty-state fade-in">
      <div class="icon-ring">{{ icon }}</div>
      <div class="h4">{{ title }}</div>
      <p class="text-muted">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '∅';
  @Input() title = 'Aucune donnée';
  @Input() message = '';
}
