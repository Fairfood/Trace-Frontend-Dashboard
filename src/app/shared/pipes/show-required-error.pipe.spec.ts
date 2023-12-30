import { ShowRequiredErrorPipe } from './show-required-error.pipe';
import { FormGroup, FormControl, Validators } from '@angular/forms';

describe('ShowRequiredErrorPipe', () => {
  let pipe: ShowRequiredErrorPipe;
  let formGroup: FormGroup;

  beforeEach(() => {
    pipe = new ShowRequiredErrorPipe();
    formGroup = new FormGroup({
      name: new FormControl('', Validators.required), // Control with required validator
      age: new FormControl(25), // Control without required validator
    });
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return true if the form control is required, touched, and dirty', () => {
    // Set the control as touched and dirty
    formGroup.get('name').markAsTouched();
    formGroup.get('name').markAsDirty();

    const result = pipe.transform(formGroup, 'name');

    // Expecting true because the control is required, touched, and dirty
    expect(result).toBe(true);
  });

  it('should return false if the form control is not required', () => {
    const result = pipe.transform(formGroup, 'age');

    // Expecting false because the control is not required
    expect(result).toBe(false);
  });

  it('should return false if the form control is required but not touched or dirty', () => {
    const result = pipe.transform(formGroup, 'name');

    // Expecting false because the control is required but not touched or dirty
    expect(result).toBe(false);
  });

  it('should return false if the control does not exist in the form group', () => {
    const result = pipe.transform(formGroup, 'nonExistentControl');

    // Expecting false because the control does not exist in the form group
    expect(result).toBe(false);
  });
});
