import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
// other components
import {
  FfPaginationComponent,
  LoaderComponent,
  SortCustomComponent,
} from 'fairfood-utils';
import { ListingInfoComponent } from '../listing-info';
import { ListingRowSelectionPipe } from '../listing.pipe';

export const IMPORTS = [
  CommonModule,
  FfPaginationComponent,
  LoaderComponent,
  MatMenuModule,
  ListingRowSelectionPipe,
  SortCustomComponent,
  FormsModule,
  MatIconModule,
  MatCheckboxModule,
  MatRadioModule,
  ListingInfoComponent,
];
