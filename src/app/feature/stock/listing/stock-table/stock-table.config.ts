/* istanbul ignore file */
import {
  AsyncPipe,
  DatePipe,
  NgClass,
  NgFor,
  NgIf,
  SlicePipe,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
// material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
// other components
import { LoaderComponent, SortCustomComponent } from 'fairfood-utils';
import { ListingInfoComponent } from '../listing-info';
import { ListingRowSelectionPipe } from '../listing.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

export const IMPORTS = [
  NgIf,
  NgFor,
  DatePipe,
  NgClass,
  AsyncPipe,
  ListingInfoComponent,
  LoaderComponent,
  MatMenuModule,
  ListingRowSelectionPipe,
  SortCustomComponent,
  FormsModule,
  MatIconModule,
  MatCheckboxModule,
  MatRadioModule,
  MatTooltipModule,
  SlicePipe,
];
