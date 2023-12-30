/* eslint-disable @typescript-eslint/no-explicit-any */

import { ITableColumnHeader } from 'src/app/shared/configs/app.model';

// interfaces
export interface ITransactionFilter {
  selectedProduct: string;
  selectedType: string;
  selectedDate: string;
  selectedActor: string;
  offset: number;
  limit: number;
  searchString: string;
}
export interface ITransactionMaster {
  actors: any[];
  product: any[];
  transactionType: any[];
}
export interface ItabItem {
  id: string;
  name: string;
}

export interface ITransactionList {
  count: number;
  transactions: any;
  tableLoading?: boolean;
}

// constants
export const TAB: ItabItem[] = [
  {
    id: 'actors',
    name: 'Actors',
  },
  {
    id: 'transaction',
    name: 'Transactions',
  },
];

export const TR_TYPES: ItabItem[] = [
  {
    id: 'PROCESSED',
    name: 'Internal',
  },
  {
    id: 'OUTGOING',
    name: 'Outgoing',
  },
  {
    id: 'INCOMING',
    name: 'Incoming',
  },
];

export interface IStage {
  activeStage: number;
  stageList: any[];
}

export const TR_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'Product name',
    class: 'normal-column',
    sortKey: 'name',
  },
  {
    name: 'Quantity',
    class: 'normal-column',
    sortKey: 'created_on',
  },
  {
    name: 'Date',
    class: 'normal-column',
    sortKey: 'country',
  },
  {
    name: 'Transaction type',
    class: 'normal-column',
    sortKey: 'supplyChain',
  },
  {
    name: 'Transaction with',
    class: 'normal-column',
    sortKey: 'status',
  },
  {
    name: 'Transaction hash',
    class: 'normal-column',
    sortKey: 'status',
  },
];
