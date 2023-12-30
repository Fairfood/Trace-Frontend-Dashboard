import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
// components and pipes
import {
  ErrorColumnMessagePipe,
  ErrorColumnPipe,
  StateFilterPipe,
} from './template-verification.pipe';
import {
  LoaderComponent,
  ActionButtonsComponent,
  ButtonsComponent,
} from 'fairfood-utils';
import {
  FfDropdownComponent,
  FfFilterBoxComponent,
} from 'fairfood-form-components';

export const IMPORTS = [
  CommonModule,
  MatIconModule,
  ActionButtonsComponent,
  FfDropdownComponent,
  ErrorColumnPipe,
  FormsModule,
  LoaderComponent,
  MatDatepickerModule,
  ReactiveFormsModule,
  FfFilterBoxComponent,
  MatCardModule,
  MatMenuModule,
  MatNativeDateModule,
  ErrorColumnMessagePipe,
  ButtonsComponent,
  MatTooltipModule,
  StateFilterPipe,
];
