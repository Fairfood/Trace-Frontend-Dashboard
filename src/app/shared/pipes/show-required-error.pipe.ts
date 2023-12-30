import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';

@Pipe({
  name: 'showRequiredError',
  standalone: true,
  pure: false,
})
export class ShowRequiredErrorPipe implements PipeTransform {
  transform(formGroup: FormGroup, controlName: string): boolean {
    const formControl = formGroup.get(controlName);

    if (!formControl) {
      return false; // Control does not exist
    }

    const hasRequired = formControl.hasError('required');

    if (!hasRequired) {
      return false;
    }
    return (
      formControl?.errors?.required &&
      (formControl.touched || formControl.dirty)
    );
  }
}
