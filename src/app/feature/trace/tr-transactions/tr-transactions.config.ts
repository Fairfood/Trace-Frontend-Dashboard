import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';

import {
  FfFilterBoxComponent,
  FfFilterBoxWrapperComponent,
} from 'fairfood-form-components';
import {
  ButtonsComponent,
  FfPaginationComponent,
  LoaderComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
export const TR_CONFIG = [
  NgFor,
  NgIf,
  AsyncPipe,
  DatePipe,
  MatMenuModule,
  FfFilterBoxWrapperComponent,
  FfPaginationComponent,
  TranslateModule,
  LoaderComponent,
  SearchBoxComponent,
  FfFilterBoxComponent,
  MatIconModule,
  CommonWalletComponent,
  MatDatepickerModule,
  MatNativeDateModule,
  MatCardModule,
  ButtonsComponent,
  FfCustomPaginationComponent,
];
