import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

export function uniqueTeamNamesValidator(): ValidatorFn {
  return (formArray: AbstractControl): ValidationErrors | null => {
    const names: string[] = [];
    const controls = (formArray as FormArray).controls;

    // Sammle alle Teamnamen aus allen Gruppen
    controls.forEach(group => {
      const teamsArray = group.get('teams') as FormArray;
      teamsArray?.controls.forEach(teamControl => {
        const name = (teamControl.value || '').trim().toLowerCase();
        if (name) {
          names.push(name);
        }
      });
    });

    // Finde Duplikate
    const duplicates = names.filter((name, idx) => names.indexOf(name) !== idx);

    // Setze Fehler auf die jeweiligen TeamControls
    controls.forEach(group => {
      const teamsArray = group.get('teams') as FormArray;
      teamsArray?.controls.forEach(teamControl => {
        const name = (teamControl.value || '').trim().toLowerCase();
        if (name && duplicates.includes(name)) {
          teamControl.setErrors({ notUnique: true });
        } else {
          // Entferne nur das notUnique-Error, andere Fehler bleiben erhalten
          if (teamControl.errors) {
            const { notUnique, ...rest } = teamControl.errors;
            teamControl.setErrors(Object.keys(rest).length ? rest : null);
          }
        }
      });
    });

    return duplicates.length > 0 ? { notUnique: true } : null;
  };
};