/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { LoaderComponent, FairFoodCustomTabComponent } from 'fairfood-utils';
import { BasicDetailsComponent } from './basic-details';
import { ProfileAvatarModule } from '../profile-avatar';
import { TeamMembersComponent } from './team-members';
import { DocumentationModule } from './documentation';
import { SupplyChainsComponent } from './supply-chains';
import { WalletTabComponent } from './wallet-tab';
import { ConnectionLabelComponent } from './connection-label';
import { ActivitiesComponent } from './activities';
import { CompanyClaimsComponent } from './company-claims';

export const IMPORTS = [
  LoaderComponent,
  ProfileAvatarModule,
  FairFoodCustomTabComponent,
  BasicDetailsComponent,
  TeamMembersComponent,
  DocumentationModule,
  SupplyChainsComponent,
  WalletTabComponent,
  ConnectionLabelComponent,
  ActivitiesComponent,
  CompanyClaimsComponent,
];

export const PROFILE_TABS_MORE: ICommonObj[] = [
  {
    id: 'document',
    name: 'Documentation',
  },
  {
    id: 'supplyChain',
    name: 'Active supply chain',
  },
  {
    id: 'connectionLabel',
    name: 'Connection labels',
  },

  {
    id: 'wallet',
    name: 'Wallets',
  },
  {
    id: 'claims',
    name: 'Claims',
  },
  // {
  //   id: 'excelTemplate',
  //   name: 'Custom excel template',
  // },
  {
    id: 'logs',
    name: 'Activity',
  },
];

export const PROFILE_TABS = [
  {
    id: 'basic',
    name: 'Basic details',
  },
  {
    id: 'team',
    name: 'Team members',
  },
];

export const OTHER_COMPANY_TABS = [
  {
    id: 'basic',
    name: 'Basic details',
  },
  // {
  //   id: 'claims',
  //   name: 'Claims',
  // },
  {
    id: 'logs',
    name: 'Activity',
  },
];

export const BASIC_DETAILS = [
  {
    key: 'description_basic',
    label: 'Description',
    controlName: 'description',
    type: 'textarea',
  },
  {
    key: 'street',
    label: 'Street name *',
    controlName: 'street',
    type: 'text',
  },
  {
    key: 'country',
    label: 'Country *',
    controlName: 'country',
    type: 'dropdown',
    optionName: 'countryList',
    defaultValue: 'country',
  },
  {
    key: 'province',
    label: 'Province *',
    controlName: 'province',
    type: 'dropdown',
    optionName: 'stateList',
    defaultValue: 'province',
  },
  {
    key: 'city',
    label: 'City/Village *',
    controlName: 'city',
    type: 'text',
  },
  {
    key: 'zipcode',
    label: 'Postal code',
    controlName: 'zipCode',
    type: 'text',
  },
  {
    key: 'latitude',
    label: 'Latitude',
    controlName: 'latitude',
    type: 'text',
  },
  {
    key: 'longitude',
    label: 'Longitude',
    controlName: 'longitude',
    type: 'text',
  },
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
