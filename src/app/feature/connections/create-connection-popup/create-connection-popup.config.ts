/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
// standalone components
import {
  ActionButtonsComponent,
  LoaderComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';

import { ITabItem } from 'src/app/shared/configs/app.model';

export const COMPONENT_IMPORTS = [
  CommonModule,
  MatDialogModule,
  ReactiveFormsModule,
  FormsModule,
  MatIconModule,
  MatRadioModule,
  MatCheckboxModule,
  LoaderComponent,
  FairFoodCustomTabComponent,
  FairFoodInputComponent,
  FfDropdownComponent,
  ActionButtonsComponent,
];

export const INVITE_ONLY: ITabItem[] = [
  {
    id: 'invite',
    name: 'Invite connection',
    description: 'Invite connection',
    active: false,
  },
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
  ...INVITE_ONLY,
];

export const connectionProfileDropdownValue = (
  selectedValue: string,
  formControlName: string,
  formName: any,
  data?: any
) => {
  if (selectedValue) {
    if (formControlName === 'province') {
      formName.patchValue({
        latitude: data.latlong[0],
        longitude: data.latlong[1],
        province: data?.id,
      });
    } else if (formControlName === 'dialCode') {
      formName.patchValue({
        inDialCode: data?.id,
      });
    } else if (formControlName === 'country') {
      formName.patchValue({
        country: data?.id,
        province: '',
      });
    } else {
      formName.patchValue({
        primaryOperation: data?.id,
      });
    }
  } else {
    if (formControlName === 'province') {
      formName.patchValue({
        latitude: 0,
        longitude: 0,
        province: null,
      });
    } else if (formControlName === 'dialCode') {
      formName.patchValue({
        inDialCode: null,
      });
    } else if (formControlName === 'country') {
      formName.patchValue({
        country: null,
        province: null,
      });
    } else {
      formName.patchValue({
        primaryOperation: null,
      });
    }
  }
};
