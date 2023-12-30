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
} from 'fairfood-utils';

export const CLAIM_IMPORT = [
  MatIconModule,
  MatMenuModule,
  FfPaginationComponent,
  LoaderComponent,
  FfFilterBoxWrapperComponent,
  SearchBoxComponent,
  ButtonsComponent,
];
