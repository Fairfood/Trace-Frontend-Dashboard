/* istanbul ignore file */
import {
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';
import {
  IFilterParams,
  IFilterToggleItems,
  ITableFilterProps,
} from './listing.model';

export const LISTING_COLUMNS: ITableColumnHeader[] = [
  {
    name: 'selection',
    class: 'selection-column',
    sortKey: 'none',
    hideSort: true,
    isColumnVisible: true,
  },
  {
    name: 'Stock ID',
    class: 'stock-id-column no-border-left',
    sortKey: 'number',
    isColumnVisible: true,
  },
  {
    name: 'Product',
    class: 'large-column',
    sortKey: 'product.name',
    isColumnVisible: true,
  },
  {
    name: 'Created date',
    class: 'normal-column',
    sortKey: 'created_on',
    isColumnVisible: true,
  },
  {
    name: 'Created from',
    class: 'normal-column',
    sortKey: 'from',
    isColumnVisible: true,
  },
  {
    name: 'Supplier',
    class: 'normal-column',
    sortKey: 'batch',
    isColumnVisible: true,
  },
  {
    name: 'Quantity available(kg)',
    class: 'large-column',
    sortKey: 'initial_quantity',
    isColumnVisible: true,
  },
  {
    name: 'Reference number',
    class: 'normal-column',
    sortKey: 'batch',
    isColumnVisible: true,
    hideSort: true,
  },
  {
    name: '',
    class: 'options-column',
    sortKey: 'none',
    hideSort: true,
  },
];
export const STOCK_TYPES_FILTER: ICommonObj[] = [
  {
    id: 'processed',
    name: 'Processed',
  },
  {
    id: 'purchased',
    name: 'Purchased',
  },
  {
    id: 'merged',
    name: 'Merged',
  },
  {
    id: 'returned',
    name: 'Returned',
  },
];

export const ENTIRE_LIST_API_LIMIT = 50;

export const RESET_FILTER: IFilterToggleItems = {
  selectedProduct: '',
  selectedClaim: '',
  selectedSupplier: '',
  quantityFrom: '',
  quantityTo: '',
  quantityIs: '',
  dateOn: '',
  dateTo: '',
  dateFrom: '',
  searchString: '',
  createdFrom: '',
};

export const TABLE_FILTER_PROPS: ITableFilterProps = {
  limit: 10,
  offset: 0,
  sortBy: 'created_on',
  orderBy: 'desc',
};

export const INIT_FILTERS: IFilterParams = {
  ...RESET_FILTER,
  ...TABLE_FILTER_PROPS,
};

export const SEARCHBY_OPTIONS_STOCK: ICommonObj[] = [
  {
    id: 'all',
    name: 'All',
  },
  {
    id: 'stockId',
    name: 'Stock ID',
  },
  {
    id: 'refId',
    name: 'Ref ID',
  },
];
