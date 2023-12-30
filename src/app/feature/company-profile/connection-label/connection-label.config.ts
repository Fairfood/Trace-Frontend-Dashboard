/* istanbul ignore file */
import { ITableColumnHeader } from 'src/app/shared/configs/app.model';
import { CommonModule } from '@angular/common';

import { ProfilePopupComponent } from '../profile-popup/profile-popup.component';
// external library
import {
  FairFoodInputComponent,
  FfMultiSelectDropdownComponent,
} from 'fairfood-form-components';
import {
  LoaderComponent,
  ButtonsComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
// angular material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export const IMPORTS = [
  CommonModule,
  ProfilePopupComponent,
  FfPaginationComponent,
  ButtonsComponent,
  FairFoodInputComponent,
  LoaderComponent,
  MatMenuModule,
  MatIconModule,
  MatTooltipModule,
  FfMultiSelectDropdownComponent,
];
export const LABEL_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'Name',
    class: 'normal-column',
    sortKey: 'name',
  },
  {
    name: 'Supply chain',
    class: 'large-column',
    sortKey: 'created_on',
  },
  {
    name: '',
    class: 'options-column',
    sortKey: 'none',
  },
];
