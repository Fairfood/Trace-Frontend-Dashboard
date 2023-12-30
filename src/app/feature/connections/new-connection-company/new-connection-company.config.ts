import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ITabItem } from 'src/app/shared/configs/app.model';
// standalne components
import { ShowRequiredErrorPipe } from 'src/app/shared/pipes';

import { ConnectionMappingComponent } from '../connection-mapping';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import {
  LoaderComponent,
  ActionButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';

export const IMPORTS = [
  CommonModule,
  ReactiveFormsModule,
  FairFoodCustomTabComponent,
  FairFoodInputComponent,
  ActionButtonsComponent,
  FfDropdownComponent,
  LoaderComponent,
  ShowRequiredErrorPipe,
  MatIconModule,
  MatRadioModule,
  MatCheckboxModule,
  ConnectionMappingComponent,
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
    description: 'Map a new company',
    active: false,
  },
];
