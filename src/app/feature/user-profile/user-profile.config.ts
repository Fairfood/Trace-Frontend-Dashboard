/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ICommonObj } from 'src/app/shared/configs/app.model';

import { NotificationHomeComponent } from '../notification';
import { ProfilePreferencesComponent } from './profile-preferences';

import {
  LoaderComponent,
  ButtonsComponent,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import { ProfileAvatarComponent } from 'src/app/shared/components/profile-avatar';

export const IMPORT_CONFIGS = [
  CommonModule,
  MatIconModule,
  FairFoodCustomTabComponent,
  ProfileAvatarComponent,
  LoaderComponent,
  NotificationHomeComponent,
  ReactiveFormsModule,
  FairFoodInputComponent,
  FfDropdownComponent,
  TranslateModule,
  ButtonsComponent,
  ProfilePreferencesComponent,
];

export const PROFILE_TABS: ICommonObj[] = [
  {
    id: 'notification',
    name: 'Notifications',
  },
  {
    id: 'settings',
    name: 'Notification preferences',
  },
];
