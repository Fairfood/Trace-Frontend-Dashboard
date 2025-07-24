/* istanbul ignore file */
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderComponent, FairFoodCustomTabComponent } from 'fairfood-utils';
import { BasicDetailsCompanyComponent } from './basic-details';
import { TeamMembersComponent } from './team-members';
import { DocumentsTabComponent } from './documentation';
import { SupplyChainsComponent } from './supply-chains';
import { WalletTabComponent } from './wallet-tab';
import { ConnectionLabelComponent } from './connection-label';
import { ActivitiesComponent } from './activities';
import { CompanyClaimsComponent } from './company-claims';
import { ProfileAvatarComponent } from 'src/app/shared/components/profile-avatar';
import { ClaimsTabComponent } from './claims-tab/claims-tab.component';

export const IMPORTS = [
  LoaderComponent,
  FairFoodCustomTabComponent,
  BasicDetailsCompanyComponent,
  TeamMembersComponent,
  DocumentsTabComponent,
  SupplyChainsComponent,
  WalletTabComponent,
  ConnectionLabelComponent,
  ActivitiesComponent,
  CompanyClaimsComponent,
  TranslateModule,
  ProfileAvatarComponent,
  ClaimsTabComponent,
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
    id: 'claims',
    name: 'Claims',
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
  {
    id: 'claims',
    name: 'Claims',
  },
  {
    id: 'logs',
    name: 'Activity',
  },
];

export const BASIC_DETAILS = [
  {
    key: 'description_basic',
    label: 'misc.desc',
    controlName: 'description',
    type: 'textarea',
    required: false,
  },
  {
    key: 'street',
    label: 'company.street',
    controlName: 'street',
    type: 'text',
    required: true,
  },
  {
    key: 'country',
    label: 'company.country',
    controlName: 'country',
    type: 'dropdown',
    optionName: 'countryList',
    defaultValue: 'country',
    required: true,
  },
  {
    key: 'province',
    label: 'company.province',
    controlName: 'province',
    type: 'dropdown',
    optionName: 'stateList',
    defaultValue: 'province',
    required: true,
  },
  {
    key: 'city',
    label: 'company.city',
    controlName: 'city',
    type: 'text',
    required: true,
  },
  {
    key: 'zipcode',
    label: 'company.postal',
    controlName: 'zipCode',
    type: 'text',
    required: false,
  },
  {
    key: 'latitude',
    label: 'company.latitude',
    controlName: 'latitude',
    type: 'text',
    required: false,
  },
  {
    key: 'longitude',
    label: 'company.longitude',
    controlName: 'longitude',
    type: 'text',
    required: false,
  },
];

/* istanbul ignore next */
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
