/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
// standalone components
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
  SortCustomComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { TransactionActionsComponent } from '../transaction-actions';
import { FairFoodDropQuantityComponent } from 'src/app/shared/components/ff-drop-quantity';
import { FairFoodDropDateComponent } from 'src/app/shared/components/ff-drop-date';

export const TR_IMPORTS = [
  CommonModule,
  MatRadioModule,
  MatIconModule,
  MatMenuModule,
  MatDialogModule,
  MatCheckboxModule,
  ReactiveFormsModule,
  FormsModule,
  ButtonsComponent,
  LoaderComponent,
  SearchBoxComponent,
  ExportIconComponent,
  FairFoodCustomTabComponent,
  SortCustomComponent,
  FfFilterBoxWrapperComponent,
  TransactionActionsComponent,
  FfPaginationComponent,
  FairFoodDropQuantityComponent,
  FairFoodDropDateComponent,
];
