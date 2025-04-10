/* istanbul ignore file */
import {
  ICommonObj,
  ITableColumnHeader,
  LocationTypes,
} from 'src/app/shared/configs/app.model';

const COMMON: ITableColumnHeader[] = [
  {
    name: 'connections.relation',
    class: 'normal-column',
    sortKey: 'relation',
  },
  {
    name: 'connections.status',
    class: 'normal-column',
    sortKey: 'status',
  },
];

export const COMPANY_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'company.name',
    class: 'large-column',
    sortKey: 'name',
  },
  {
    name: 'connections.cType',
    class: 'normal-column',
    sortKey: 'type',
  },
  ...COMMON,
  {
    name: '',
    class: 'normal-column',
    sortKey: 'none',
  },
  {
    name: '',
    class: 'options-column',
    sortKey: 'none',
  },
];

export const FARMER_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'farmer.name',
    class: 'large-column',
    sortKey: 'name',
  },
  {
    name: 'connections.fType',
    class: 'normal-column',
    sortKey: 'type',
  },
  ...COMMON,
  {
    name: '',
    class: 'options-column',
    sortKey: 'none',
  },
];

export const SEARCHBY_OPTIONS: ICommonObj[] = [
  {
    id: 'all',
    name: 'All',
  },
  {
    id: 'name',
    name: 'Name',
  },
  {
    id: 'reference_number',
    name: 'Reference number',
  },
  {
    id: 'email',
    name: 'Email',
  },
  {
    id: 'address',
    name: 'Address',
  },
  // {
  //   id: 'stockId',
  //   name: 'Stock ID',
  // },
  // {
  //   id: 'refId',
  //   name: 'Ref ID',
  // },
];

export const LOCATION_TYPES: LocationTypes[] = [
  { id: 'APPROXIMATE', name: 'Approximate' },
  { id: 'POLYGON', name: 'Polygon' },
  { id: 'ACCURATE', name: 'Accurate' },
];
