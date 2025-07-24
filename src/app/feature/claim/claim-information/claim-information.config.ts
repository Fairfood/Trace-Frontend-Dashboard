/* istanbul ignore file */
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';

import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RejectClaimComponent } from '../reject-claim';

export const CLAIM_DETAIL_IMPORT = [
  NgIf,
  NgFor,
  DatePipe,
  NgClass,
  LoaderComponent,
  ButtonsComponent,
  FormsModule,
  ReactiveFormsModule,
  MatIconModule,
  FairFoodCustomTabComponent,
  FairFoodInputComponent,
  TranslateModule,
  MatDialogModule,
  RejectClaimComponent,
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
