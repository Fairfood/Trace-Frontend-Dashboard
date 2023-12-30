import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
// components
import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';

import { MapSuppliersRequestComponent } from './map-suppliers-request';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { ConnectionTypeSelectionComponent } from './connection-type-selection';
// pipes
import { AvatarPipe, ToPositivePipe } from '../layout/header/header.pipe';

export const C_IMPORTS = [
  CommonModule,
  TranslateModule.forChild(),
  GoogleMapsModule,
  MatIconModule,
  MatSlideToggleModule,
  MatMenuModule,
  MatDialogModule,
  MatFormFieldModule,
  MatSelectModule,
  MatTooltipModule,
  ExportIconComponent,
  FairFoodCustomTabComponent,
  SearchBoxComponent,
  ButtonsComponent,
  AvatarPipe,
  ToPositivePipe,
  LoaderComponent,
  FfPaginationComponent,
  FfFilterBoxWrapperComponent,
  MapSuppliersRequestComponent,
  ConnectionTypeSelectionComponent,
];
