import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
// components
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { ProfilePopupComponent } from '../profile-popup/profile-popup.component';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import {
  LoaderComponent,
  ButtonsComponent,
  FfPaginationComponent,
} from 'fairfood-utils';
// config
import { ITableColumnHeader } from 'src/app/shared/configs/app.model';
import { AvatarPipe } from '../../layout/header/header.pipe';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const IMPORTS: any = [
  SearchBoxComponent,
  ButtonsComponent,
  FormsModule,
  ReactiveFormsModule,
  MatMenuModule,
  ProfilePopupComponent,
  LoaderComponent,
  FairFoodInputComponent,
  MatAutocompleteModule,
  MatIconModule,
  FfPaginationComponent,
  AvatarPipe,
  FfDropdownComponent,
];

export const MEMBER_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'Name',
    class: 'large-column',
    sortKey: 'name',
  },
  {
    name: 'Role',
    class: 'normal-column',
    sortKey: 'created_on',
  },
  {
    name: 'Email',
    class: 'normal-column',
    sortKey: 'country',
  },
  {
    name: 'Contact',
    class: 'large-column',
    sortKey: 'supplyChain',
  },
  {
    name: 'Status',
    class: 'smaller-column',
    sortKey: 'status',
  },
  {
    name: '',
    class: 'options-column',
    sortKey: 'none',
  },
];

export interface ITeamMember {
  first_name: string;
  last_name: string;
  user_id: string;
}
