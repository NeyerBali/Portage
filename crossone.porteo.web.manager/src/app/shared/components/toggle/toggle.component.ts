import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Interrupteur (switch) du design — 42×24, ON = emerald-600. */
@Component({
  selector: 'app-toggle',
  standalone: false,
  template: `
    <button type="button" class="toggle" [class.on]="checked" role="switch"
            [attr.aria-checked]="checked" (click)="toggle()">
      <span class="knob"></span>
    </button>
  `,
  styles: [`
    .toggle { width: 42px; height: 24px; border-radius: 999px; border: none; background: var(--border-strong); position: relative; cursor: pointer; transition: background var(--dur) var(--ease); flex-shrink: 0; padding: 0; }
    .toggle:focus-visible { outline: none; box-shadow: var(--ring); }
    .toggle.on { background: var(--emerald-600); }
    .knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: var(--shadow-sm); transition: transform var(--dur) var(--ease); }
    .toggle.on .knob { transform: translateX(18px); }
  `],
})
export class ToggleComponent {
  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();
  toggle(): void { this.checked = !this.checked; this.checkedChange.emit(this.checked); }
}
