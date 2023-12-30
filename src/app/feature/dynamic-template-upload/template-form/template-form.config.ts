import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
// components
import { TemplateProductComponent } from '../template-product';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import { ButtonsComponent } from 'fairfood-utils';

export const IMPORT_ITEMS = [
  CommonModule,
  ReactiveFormsModule,
  MatIconModule,
  MatCheckboxModule,
  MatRadioModule,
  TranslateModule,
  ButtonsComponent,
  FfDropdownComponent,
  FairFoodInputComponent,
  TemplateProductComponent,
];
