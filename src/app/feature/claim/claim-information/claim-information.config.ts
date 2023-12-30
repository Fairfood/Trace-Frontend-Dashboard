/* istanbul ignore file */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { ICommonObj } from 'src/app/shared/configs/app.model';

export const CLAIM_DETAIL_IMPORT = [
  CommonModule,
  LoaderComponent,
  ButtonsComponent,
  FormsModule,
  ReactiveFormsModule,
  MatIconModule,
  FairFoodCustomTabComponent,
  FairFoodInputComponent,
];

export const CLAIM_TABS: ICommonObj[] = [
  {
    id: 'basic',
    name: 'Basic details',
  },
  {
    id: 'comment',
    name: 'Comments',
  },
];
