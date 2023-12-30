/* istanbul ignore file */
import {
  IAddionalFilter,
  ICommonIdName,
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';

export const TRANSACTION_TYPES: ICommonObj[] = [
  {
    id: 'external',
    name: 'Transactions',
  },
  {
    id: 'internal',
    name: 'Stock actions',
  },
];
export const STOCK_ACTION_TYPES: ICommonIdName[] = [
  {
    id: 1,
    name: 'Processing',
  },
  {
    id: 3,
    name: 'Merge stock',
  },
  {
    id: 2,
    name: 'Loss',
  },
];

export const OPTIONS_NEEDED: IAddionalFilter[] = [
  {
    id: 'refNo',
    name: 'Reference number',
    visible: false,
  },
];

export const ID: ITableColumnHeader[] = [
  {
    name: 'ID',
    class: 'smaller-column',
    sortKey: 'number',
    isColumnVisible: true,
  },
];

export const TRANSACTION_TYPE_FILTER: ICommonIdName[] = [
  {
    id: 3,
    name: 'Reversal',
  },
  {
    id: 2,
    name: 'Received stock',
  },
  {
    id: 1,
    name: 'Sent stock',
  },
];

export const TRANSACTION_COLUMNS: ITableColumnHeader[] = [
  ...ID,
  {
    name: 'Transaction type',
    class: 'transaction-type-column',
    sortKey: 'type',
    isColumnVisible: true,
  },
  {
    name: 'Connection',
    class: 'normal-column',
    sortKey: 'connection',
    isColumnVisible: true,
  },
  {
    name: 'Product',
    class: 'large-column',
    sortKey: 'product',
    isColumnVisible: true,
  },
  {
    name: 'Quantity (kg)',
    class: 'normal-column',
    sortKey: 'quantity',
    isColumnVisible: true,
  },
  {
    name: 'Transaction date',
    class: 'normal-column',
    sortKey: 'date',
    isColumnVisible: true,
  },
  {
    name: 'Created by',
    class: 'normal-column',
    sortKey: 'creator',
    isColumnVisible: true,
  },
  {
    class: 'normal-column',
    name: 'Reference number',
    isColumnVisible: false,
    sortKey: 'none',
    hideSort: true,
  },
  {
    name: 'Blockchain log',
    class: 'large-column',
    sortKey: 'log',
    isColumnVisible: true,
  },
  {
    name: '',
    class: 'options-column',
    sortKey: 'none',
    isColumnVisible: true,
    hideSort: true,
  },
];

const COMMON: ITableColumnHeader[] = [
  {
    name: 'Transaction date',
    class: 'normal-column',
    sortKey: 'date',
    isColumnVisible: true,
    hideSort: true,
  },
  {
    name: 'Created by',
    class: 'normal-column',
    sortKey: 'creator',
    isColumnVisible: true,
  },
  {
    name: '',
    class: 'options-column',
    sortKey: 'none',
    isColumnVisible: true,
    hideSort: true,
  },
];
export const STOCK_ACTIONS_PROCESSED: ITableColumnHeader[] = [
  ...ID,
  {
    name: 'Source product',
    class: 'large-column',
    sortKey: 'sourceproduct',
    isColumnVisible: true,
  },
  {
    name: 'Source quantity (kg)',
    class: 'normal-column',
    sortKey: 'source_quantity',
    isColumnVisible: true,
  },
  {
    name: 'Destination product',
    class: 'large-column',
    sortKey: 'destinationproduct',
    isColumnVisible: true,
  },
  ...COMMON,
];

export const STOCK_ACTIONS_MERGED: ITableColumnHeader[] = [
  ...ID,
  {
    name: 'Source product',
    class: 'large-column',
    sortKey: 'sourceproduct',
    isColumnVisible: true,
  },
  {
    name: 'Source quantity (kg)',
    class: 'transaction-type-column',
    sortKey: 'source_quantity',
    isColumnVisible: true,
  },
  {
    name: 'Merge product',
    class: 'large-column',
    sortKey: 'mergedproduct',
    isColumnVisible: true,
  },
  {
    name: 'Quantity (kg)',
    class: 'normal-column',
    sortKey: 'quantity',
    isColumnVisible: true,
  },
  ...COMMON,
];

export const STOCK_ACTIONS_LOSS: ITableColumnHeader[] = [
  ...ID,
  {
    name: 'Removed product',
    class: 'large-column',
    sortKey: 'removedproduct',
    isColumnVisible: true,
  },
  {
    name: 'Removed stock ID',
    class: 'normal-column',
    sortKey: 'removedstockid',
    isColumnVisible: true,
  },
  {
    name: 'Quantity (kg)',
    class: 'normal-column',
    sortKey: 'quantity',
    isColumnVisible: true,
  },
  ...COMMON,
];
