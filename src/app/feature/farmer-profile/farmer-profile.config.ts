/* eslint-disable @typescript-eslint/no-explicit-any */

import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FairFoodCustomTabComponent, LoaderComponent } from 'fairfood-utils';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { ListDetailComponent } from './list-detail';
import {
  FarmerDetailsComponent,
  TransformDropdownOptions,
} from './farmer-details';
import { FarmComponent } from './farm/farm.component';
import { AddReferenceComponent } from './add-reference';
import { DocsComponent } from './docs';
import { FarmerActivitiesComponent } from './farmer-activities';
import { IncomeComponent } from './income';
import { ProfileAvatarComponent } from 'src/app/shared/components/profile-avatar';
import { CarbonEmissionsComponent } from './carbon-emissions/carbon-emissions.component';
import { ClaimTabCommonComponent } from 'src/app/shared/components/claim-tab-common/claim-tab-common.component';

interface IAmount {
  amount: string;
  currency: string;
}
export interface IFarmerDetails {
  id: string;
  cards?: any[];
  name: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  province: string;
  street: string;
  zipcode: string;
  gender: string;
  dob: any;
  email: string;
  familyMembers: string;
  phone: {
    dialCode: string;
    phone: string;
  };
  phoneNumber: string;
  dialCode: string;
  image: string;
  avatar?: string;
  pseudonimized?: boolean;
  all_crop_types?: string;
  total_area_in_use?: string;
  id_no?: string;
  income: {
    product: string;
    premium: string;
    others: string;
    total: string;
  };
  primary_operation: ICommonObj;
  consent_status?: string;
  total_income?: {
    total_amount: IAmount[];
    amount_from_products: IAmount[];
    amount_from_premiums: IAmount[];
    other?: IAmount[];
  };
  is_editable: boolean;
  countryFlag?: string;
  updated_on?: any;
  otherApiCall: boolean;
  claims?: IClaim[];
}
export interface IReference {
  count: number;
  results: any[];
  loading: boolean;
}
export interface IStateFarmerProfile {
  farmerDetails: IFarmerDetails;
  isUpdating: boolean;
  farmerReferences: IReference;
  referenceMaster: IReference;
  plots: IReference;
  activities: IReference;
  payments: IReference;
  attachments: IReference;
}

export const PROFILE_TABS: ICommonObj[] = [
  {
    id: 'basic',
    name: 'Basic',
  },
  {
    id: 'farm',
    name: 'Farm',
  },
  {
    id: 'income',
    name: 'Income',
  },
  // {
  //   id: 'claim',
  //   name: 'Claims',
  // },
  {
    id: 'docs',
    name: 'Docs',
  },
  {
    id: 'logs',
    name: 'Logs',
  },
  {
    id: 'carbon_emissions',
    name: 'Carbon',
  },
  {
    id: 'claims',
    name: 'Claims',
  },
];
export const FARMER_PROFILE_IMPORTS = [
  CommonModule,
  MatIconModule,
  MatDialogModule,
  LoaderComponent,
  FairFoodCustomTabComponent,
  ListDetailComponent,
  ProfileAvatarComponent,
  TransformDropdownOptions,
  FarmComponent,
  AddReferenceComponent,
  DocsComponent,
  FarmerActivitiesComponent,
  IncomeComponent,
  FarmerDetailsComponent,
  CarbonEmissionsComponent,
  ClaimTabCommonComponent,
];

export const PLOT_TYPES: ICommonObj[] = [
  {
    id: 'APPROXIMATE',
    name: 'newPlot.approximate',
  },
  {
    id: 'ACCURATE',
    name: 'newPlot.accurate',
  },
  {
    id: 'POLYGON',
    name: 'newPlot.geo',
  },
];

export interface IClaim {
  id: string;
  type: number;
  scope: number;
  verifier: any;
  attached_from: number;
  status: number;
  blockchain_address: any;
  name: string;
  image: any;
  claim_id: string;
  attached_by: any;
  description_basic: string;
  description_full: string;
  claim_processor?: string;
}
