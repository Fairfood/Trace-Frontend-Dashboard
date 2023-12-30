// material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// components
import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';

export const CREATE_REQUEST_CONFIG = [
  CommonModule,
  TranslateModule,
  ReactiveFormsModule,
  MatAutocompleteModule,
  MatInputModule,
  MatSelectModule,
  MatDialogModule,
  MatIconModule,
  LoaderComponent,
  ButtonsComponent,
  FfDropdownComponent,
  FairFoodInputComponent,
  FairFoodCustomTabComponent,
  MatRadioModule,
];
