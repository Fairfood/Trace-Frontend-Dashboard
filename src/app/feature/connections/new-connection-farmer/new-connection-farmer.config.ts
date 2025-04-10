/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// standalne components
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import {
  LoaderComponent,
  ActionButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';
import { ITabItem } from 'src/app/shared/configs/app.model';
import { SafeHtmlPipe, ShowRequiredErrorPipe } from 'src/app/shared/pipes';
import { ConnectionMappingComponent } from '../connection-mapping';

export const IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  FairFoodCustomTabComponent,
  FairFoodInputComponent,
  ActionButtonsComponent,
  FfDropdownComponent,
  LoaderComponent,
  ShowRequiredErrorPipe,
  ConnectionMappingComponent,
  TranslateModule,
  SafeHtmlPipe,
];

export const CONNECTION_TABS: ITabItem[] = [
  {
    id: 'basic',
    name: 'Basic details',
    description: 'Buyer basic details',
    active: true,
  },
  {
    id: 'address',
    name: 'Address/contact',
    description: 'Add address & contact info',
    active: false,
  },
  {
    id: 'invite',
    name: 'Map connection',
    description: 'Map farmer to company',
    active: false,
  },
];
