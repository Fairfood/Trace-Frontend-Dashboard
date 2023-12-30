import {
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';

export const COMPANY_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'Company name',
    class: 'large-column',
    sortKey: 'name',
  },
  {
    name: 'Company type',
    class: 'normal-column',
    sortKey: 'type',
  },
  {
    name: 'Connecton relation',
    class: 'normal-column',
    sortKey: 'relation',
  },
  {
    name: 'Connection status',
    class: 'normal-column',
    sortKey: 'status',
  },
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
    name: 'Farmer name',
    class: 'large-column',
    sortKey: 'name',
  },
  {
    name: 'Farmer type',
    class: 'normal-column',
    sortKey: 'type',
  },
  {
    name: 'Connecton relation',
    class: 'normal-column',
    sortKey: 'relation',
  },
  {
    name: 'Connection status',
    class: 'large-column',
    sortKey: 'status',
  },
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
  // {
  //   id: 'stockId',
  //   name: 'Stock ID',
  // },
  // {
  //   id: 'refId',
  //   name: 'Ref ID',
  // },
];
