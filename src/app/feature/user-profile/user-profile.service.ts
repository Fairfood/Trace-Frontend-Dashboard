/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  // Injecting Angular FormBuilder in the service constructor
  constructor(private fb: FormBuilder) {}

  // Method to create and return a user profile form group

  profileForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobile: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern('^(?!0+$)[0-9]{1,15}$'),
        ],
      ],
      email: ['', Validators.required],
      dialCode: ['', Validators.required],
    });
  }
}
