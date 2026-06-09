import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valide qu'un champ date de fin est postérieur ou égal au champ de début.
 * À appliquer au niveau du FormGroup.
 */
export function dateRangeValidator(startKey: string, endKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value;
    const end = group.get(endKey)?.value;
    if (!start || !end) return null;
    return new Date(end) >= new Date(start) ? null : { dateRange: true };
  };
}
