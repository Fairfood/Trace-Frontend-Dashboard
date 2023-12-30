/* eslint-disable @typescript-eslint/no-explicit-any */

import { ICommonObj, ITabItem } from 'src/app/shared/configs/app.model';

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
];

export const CONTACT_DETAILS = [
  {
    key: 'street',
    label: 'Street name',
    controlName: 'street',
    type: 'text',
  },
  {
    key: 'city',
    label: 'City/Village',
    controlName: 'city',
    type: 'text',
  },
  {
    key: 'country',
    label: 'Country',
    controlName: 'country',
    type: 'dropdown',
    optionName: 'countryList',
    defaultValue: 'country',
    hideSearch: false,
  },
  {
    key: 'province',
    label: 'Province',
    controlName: 'province',
    type: 'dropdown',
    optionName: 'stateList',
    defaultValue: 'province',
    hideSearch: false,
  },

  {
    key: 'zipcode',
    label: 'Postal code',
    controlName: 'zipCode',
    type: 'text',
  },
  {
    key: 'email',
    label: 'Email',
    controlName: 'email',
    type: 'text',
  },
  {
    key: 'dialCode',
    label: 'Code',
    controlName: 'dialCode',
    type: 'dropdown',
    optionName: 'countryCodes',
    defaultValue: 'dialCode',
    hideSearch: false,
  },
  {
    key: 'phoneNumber',
    label: 'Phone',
    controlName: 'phoneNumber',
    type: 'text',
  },
];
export const BASIC_DETAILS = [
  {
    key: 'first_name',
    label: 'First Name',
    controlName: 'firstName',
    type: 'text',
  },
  {
    key: 'last_name',
    label: 'Last name',
    controlName: 'lastName',
    type: 'text',
  },
  {
    key: 'type',
    label: 'Type',
    controlName: 'type',
    type: 'dropdown',
    optionName: 'operations',
    defaultValue: 'type',
    hideSearch: true,
    hideClear: true,
  },
  {
    key: 'cStatus',
    label: 'Conscent',
    controlName: 'cStatus',
    type: 'dropdown',
    optionName: 'consentStatus',
    defaultValue: 'cStatus',
    hideSearch: true,
    hideClear: true,
  },
];

export const PERSONAL_DETAILS = [
  {
    key: 'gender',
    label: 'Gender',
    controlName: 'gender',
    type: 'dropdown',
    optionName: 'genders',
    defaultValue: 'gender',
    hideSearch: true,
  },
  {
    key: 'dob',
    label: 'Date of birth',
    controlName: 'dob',
    type: 'date',
  },
  {
    key: 'familyMembers',
    label: 'House hold size',
    controlName: 'familyMembers',
    type: 'text',
  },
];
export const GENDERS: ICommonObj[] = [
  {
    id: 'Male',
    name: 'Male',
  },
  {
    id: 'Female',
    name: 'Female',
  },
  {
    id: 'Other',
    name: 'Other',
  },
];

export const PLOT_TABS: ITabItem[] = [
  {
    id: 'basic',
    name: 'Address details',
    description: 'Add address details',
    active: true,
  },
  {
    id: 'plot',
    name: 'Plot details',
    description: 'Add plot details',
    active: false,
  },
];

export const INIT_TABLE: any = { count: 0, results: [], loading: true };
