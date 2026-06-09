import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  template: `
    <div class="confirm">
      <div class="confirm-icon" [class.danger]="data.destructive">{{ data.destructive ? '🗑' : 'i' }}</div>
      <h3 class="h4">{{ data.title }}</h3>
      <p class="text-muted">{{ data.message }}</p>
      <div class="confirm-actions">
        <button class="btn btn-ghost" (click)="ref.close(false)">{{ data.cancelLabel || 'Annuler' }}</button>
        <button class="btn" [class.btn-destructive]="data.destructive" [class.btn-primary]="!data.destructive"
                (click)="ref.close(true)">{{ data.confirmLabel || 'Confirmer' }}</button>
      </div>
    </div>
  `,
  styles: [`
    .confirm { padding: var(--sp-6); max-width: 420px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); }
    .confirm-icon { width: 46px; height: 46px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; font-size: 20px; background: var(--info-50); color: var(--info-600); }
    .confirm-icon.danger { background: var(--error-50); color: var(--error-600); }
    .confirm-actions { display: flex; gap: var(--sp-3); margin-top: var(--sp-2); }
  `],
})
export class ConfirmDialogComponent {
  constructor(public ref: MatDialogRef<ConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
