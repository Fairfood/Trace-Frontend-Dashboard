import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
// components
import { TemplateFormComponent } from '../template-form';
import { LoaderComponent, ActionButtonsComponent } from 'fairfood-utils';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { MappingTableComponent } from '../mapping-table/mapping-table.component';
import { ShowRequiredErrorPipe } from 'src/app/shared/pipes';
export const MAP_IMPORTS = [
  CommonModule,
  MatIconModule,
  TranslateModule,
  LoaderComponent,
  MatCheckboxModule,
  ReactiveFormsModule,
  TemplateFormComponent,
  MappingTableComponent,
  ActionButtonsComponent,
  FairFoodInputComponent,
  ShowRequiredErrorPipe,
];
