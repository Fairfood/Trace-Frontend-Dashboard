import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MustMatch, removeSpaces } from './app.methods'; // Replace with the actual file path

describe('MustMatch Validator', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormBuilder],
    });
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should not set an error if the fields match', () => {
    const formGroup = formBuilder.group(
      {
        password: ['password123', Validators.required],
        confirmPassword: ['password123', Validators.required],
      },
      { validators: MustMatch('password', 'confirmPassword') }
    );

    expect(formGroup.valid).toBe(true);
    expect(formGroup.get('confirmPassword').hasError('mustMatch')).toBe(false);
  });

  it('should set an error if the fields do not match', () => {
    const formGroup = formBuilder.group(
      {
        password: ['password123', Validators.required],
        confirmPassword: ['password456', Validators.required],
      },
      { validators: MustMatch('password', 'confirmPassword') }
    );

    expect(formGroup.valid).toBe(false);
    expect(formGroup.get('confirmPassword').hasError('mustMatch')).toBe(true);
  });
});

describe('removeSpaces Validator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should not modify the value if it contains non-space characters', () => {
    const control = new FormControl('Test Value');
    const result = removeSpaces(control);
    expect(control.value).toBe('Test Value');
    expect(result).toBeNull();
  });

  it('should set the control value to an empty string if it contains only spaces', () => {
    const control = new FormControl('    ');
    const result = removeSpaces(control);
    expect(control.value).toBe('');
    expect(result).toBeNull();
  });
});
