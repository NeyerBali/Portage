import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * Permet de projeter un gabarit de cellule personnalisé pour une colonne :
 * `<ng-template [appColumnCell]="'statut'" let-row>…</ng-template>`
 */
@Directive({
  selector: '[appColumnCell]',
  standalone: false,
})
export class ColumnCellDirective {
  @Input('appColumnCell') columnKey = '';
  constructor(public tpl: TemplateRef<{ $implicit: unknown; row: unknown }>) {}
}
