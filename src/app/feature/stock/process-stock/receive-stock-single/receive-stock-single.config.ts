/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
// components
import { ButtonsComponent, LoaderComponent } from 'fairfood-utils';
import { quantityRegex } from 'src/app/shared/configs/app.constants';
import { StockActionButtonComponent } from '../stock-action-button';
// config or constants
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';

export const RECEIVE_STOCK_CONFIG = [
  CommonModule,
  ReactiveFormsModule,
  ButtonsComponent,
  TranslateModule,
  StockActionButtonComponent,
  MatDatepickerModule,
  MatNativeDateModule,
  MatIconModule,
  FfDropdownComponent,
  FairFoodInputComponent,
  MatAutocompleteModule,
  LoaderComponent,
];

export const RECEIVE_FORM = {
  node: ['', Validators.required],
  name: ['', Validators.required],
  type: [2],
  product: [''],
  productName: [
    '',
    [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
  ],
  quantity: [
    '',
    [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(11),
      Validators.pattern(quantityRegex),
    ],
  ],
  unit: ['1'],
  currency: [''],
  price: [
    '',
    [
      Validators.required,
      Validators.minLength(1),
      Validators.pattern(quantityRegex),
    ],
  ],
  supply_chain: [''],
  date: [new Date(), Validators.required],
  receipt: [''],
};
