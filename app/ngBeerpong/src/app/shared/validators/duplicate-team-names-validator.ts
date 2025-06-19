import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

export function uniqueTeamNamesValidator(): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    const names: string[] = [];
    const controls = (formArray as FormArray).controls;

    controls.forEach(group => {
      for (let i = 1; i <= 5; i++) {
        const ctrl = group.get('team' + i);
        const name = (ctrl?.value || '').trim().toLowerCase();
        if (name) {
          names.push(name);
        }
      }
    });

    const duplicates = names.filter((name, idx) => names.indexOf(name) !== idx);
    // Set error on each duplicate field
    controls.forEach(group => {
      for (let i = 1; i <= 5; i++) {
        const ctrl = group.get('team' + i);
        if (!ctrl) continue;
        const name = (ctrl.value || '').trim().toLowerCase();
        if (name && duplicates.includes(name)) {
          ctrl.setErrors({ notUnique: true });
        } else {
          // Nur das eigene notUnique-Error entfernen, andere Errors bleiben erhalten
          if (ctrl.errors) {
            const { notUnique, ...rest } = ctrl.errors;
            ctrl.setErrors(Object.keys(rest).length ? rest : null);
          }
        }
      }
    });

    return duplicates.length > 0 ? { notUnique: true } : null;
  };
}