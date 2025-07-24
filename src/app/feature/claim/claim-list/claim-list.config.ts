/* istanbul ignore file */
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
// external library
import {
  LoaderComponent,
  ButtonsComponent,
  FfPaginationComponent,
  FairFoodCustomTabComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';
import { TranslateModule } from '@ngx-translate/core';
import { ICommonObj } from 'src/app/shared/configs/app.model';

export const CLAIM_IMPORT = [
  MatIconModule,
  MatMenuModule,
  FfPaginationComponent,
  LoaderComponent,
  FfFilterBoxWrapperComponent,
  SearchBoxComponent,
  ButtonsComponent,
  TranslateModule,
  FairFoodCustomTabComponent,
  FfCustomPaginationComponent,
];

export const CLAIM_TABS: ICommonObj[] = [
  {
    id: 'mine',
    name: 'My claims',
  },
  {
    id: 'toVerify',
    name: 'Assigned to me',
  },
];
