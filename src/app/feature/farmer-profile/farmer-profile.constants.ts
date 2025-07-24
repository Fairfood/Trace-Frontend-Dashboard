/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommonObj, ITabItem } from 'src/app/shared/configs/app.model';

export const CONTACT_DETAILS = [
  {
    key: 'street',
    label: 'company.street',
    controlName: 'street',
    type: 'text',
  },
  {
    key: 'city',
    label: 'company.city',
    controlName: 'city',
    type: 'text',
  },
  {
    key: 'country',
    label: 'company.country',
    controlName: 'country',
    type: 'dropdown',
    optionName: 'countryList',
    defaultValue: 'country',
    hideSearch: false,
  },
  {
    key: 'province',
    label: 'company.province',
    controlName: 'province',
    type: 'dropdown',
    optionName: 'stateList',
    defaultValue: 'province',
    hideSearch: false,
  },

  {
    key: 'zipcode',
    label: 'company.postal',
    controlName: 'zipCode',
    type: 'text',
  },
  {
    key: 'email',
    label: 'user.email',
    controlName: 'email',
    type: 'text',
  },
  {
    key: 'dialCode',
    label: 'company.countryCode',
    controlName: 'dialCode',
    type: 'dropdown',
    optionName: 'countryCodes',
    defaultValue: 'dialCode',
    hideSearch: false,
  },
  {
    key: 'phoneNumber',
    label: 'user.contact',
    controlName: 'phoneNumber',
    type: 'text',
  },
];

export const BASIC_DETAILS = [
  {
    key: 'first_name',
    label: 'user.firstName',
    controlName: 'firstName',
    type: 'text',
  },
  {
    key: 'last_name',
    label: 'user.lastName',
    controlName: 'lastName',
    type: 'text',
  },
  {
    key: 'type',
    label: 'user.type',
    controlName: 'type',
    type: 'dropdown',
    optionName: 'operations',
    defaultValue: 'type',
    hideSearch: true,
    hideClear: true,
  },
  {
    key: 'cStatus',
    label: 'user.conscent',
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
    label: 'user.gender',
    controlName: 'gender',
    type: 'dropdown',
    optionName: 'genders',
    defaultValue: 'gender',
    hideSearch: true,
  },
  {
    key: 'dob',
    label: 'user.dob',
    controlName: 'dob',
    type: 'date',
  },
  {
    key: 'familyMembers',
    label: 'user.house',
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
