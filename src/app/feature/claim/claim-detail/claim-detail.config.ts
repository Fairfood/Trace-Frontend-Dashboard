/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// material modules
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
// standalone components
import { ButtonsComponent } from 'fairfood-utils';
import { FfDropdownComponent } from 'fairfood-form-components';

export const CLAIM_IMPORTS = [
  CommonModule,
  MatDialogModule,
  ReactiveFormsModule,
  FormsModule,
  MatIconModule,
  MatAutocompleteModule,
  ButtonsComponent,
  FfDropdownComponent,
];
