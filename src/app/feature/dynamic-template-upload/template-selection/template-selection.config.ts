import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MatIconModule } from '@angular/material/icon';
// components
import {
  LoaderComponent,
  ActionButtonsComponent,
  ButtonsComponent,
} from 'fairfood-utils';
import { TemplateDropdownComponent } from '../template-dropdown';
import { TemplateFormComponent } from '../template-form';

export const SELECTION_IMPORT = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  MatIconModule,
  ButtonsComponent,
  TranslateModule,
  LoaderComponent,
  ActionButtonsComponent,
  TemplateFormComponent,
  TemplateDropdownComponent,
];
