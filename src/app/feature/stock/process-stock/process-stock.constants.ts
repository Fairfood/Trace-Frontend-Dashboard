import { ITabItem } from 'src/app/shared/configs/app.model';

export const STOCK_PROCESS: ITabItem[] = [
  {
    id: 'stock',
    name: 'Add stock',
    description: 'Select batches from the list',
    active: true,
  },
  {
    id: 'transaction',
    name: 'Transaction details',
    description: 'Add transaction details',
    active: true,
  },
  {
    id: 'claims',
    name: 'Attach claims',
    description: 'Provide all the required claims',
    active: false,
  },
  {
    id: 'summary',
    name: 'Send summary',
    description: '',
    active: false,
  },
];

export const SEND: ITabItem[] = [
  {
    id: 'summary',
    name: 'Send summary',
    description: 'Transaction summary',
    active: false,
  },
];
export const CONVERT: ITabItem[] = [
  {
    id: 'summary',
    name: 'Convert summary',
    description: 'Transaction summary',
    active: false,
  },
];

export const FIRST_TWO: ITabItem[] = [
  {
    id: 'stock',
    name: 'Add stock',
    description: 'Select batches from the list',
    active: true,
  },
  {
    id: 'transaction',
    name: 'Transaction details',
    description: 'Add transaction details',
    active: true,
  },
];
export const STOCK: ITabItem[] = [
  ...FIRST_TWO,
  {
    id: 'claims',
    name: 'Attach claims',
    description: 'Provide all the required claims',
    active: false,
  },
];

export const MERGE_STOCK: ITabItem[] = [
  ...FIRST_TWO,
  {
    id: 'summary',
    name: 'Merge summary',
    description: 'Transaction summary',
    active: false,
  },
];

export const RECEIVE_STOCK: ITabItem[] = [
  {
    id: 'transaction',
    name: 'Receive stock',
    description: 'Receive stock from farmer',
    active: true,
  },
  {
    id: 'claims',
    name: 'Receive evidence',
    description: 'Provide all the required claims',
    active: false,
  },
  {
    id: 'summary',
    name: 'Receive summary',
    description: 'Transaction summary',
    active: false,
  },
];
