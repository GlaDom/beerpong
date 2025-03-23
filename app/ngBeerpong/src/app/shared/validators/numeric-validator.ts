import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function numericValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!/^\d*$/.test(value)) {
      return { onlyNumbers: 'Nur Zahlen erlaubt' };
    }

    if (value > 10) {
      return { maxLength: 'Maximal 10 Zeichen erlaubt' };
    }

    return null;
  };
}
