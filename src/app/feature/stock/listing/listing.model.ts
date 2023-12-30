/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { ICommonObj } from 'src/app/shared/configs/app.model';

export interface IFilterToggleItems {
  selectedProduct: string;
  selectedClaim: string;
  selectedSupplier: string;
  quantityFrom: string;
  quantityTo: string;
  quantityIs: string;
  dateOn: string;
  dateTo: string;
  dateFrom: string;
  searchString: string;
  createdFrom?: string;
}

export interface ITableFilterProps {
  limit: number;
  offset: number;
  sortBy?: string;
  orderBy?: string;
}

export interface IProgressBar {
  progress: boolean;
  value: number;
}

export interface IListingState {
  filters: IFilterToggleItems;
  tableProps: ITableFilterProps;
  selectAll: boolean;
  stockAction: boolean;
  selectedStocks: IStockTableRow[];
  progressBarDetails: IProgressBar;
  viewSelected: boolean;
  enableSendStock: boolean;
  toggle: boolean;
  claimData: Partial<ICommonObj>[];
  selectingOptions: string | null;
}

export interface IStockFilter {
  productData: Partial<ICommonObj>[];
  supplierData?: Partial<ICommonObj>[];
  claimsData: Partial<ICommonObj>[];
}

export interface IFilterParams extends IFilterToggleItems, ITableFilterProps {}

export interface IStockTableRow {
  stockId: number;
  itemId: string;
  name: string;
  product: string;
  created: any;
  from: string;
  batch: string;
  quantityAvailable: number;
  quantityNeeded: number;
  select: boolean;
  option: string;
  referenceNo: string;
  productId: string;
  isExternal: boolean;
  transactionId: string;
}

export interface IListingAPIResponse {
  results: any[];
  count: number;
}

export interface ITableAction {
  action: string;
  data: 'all' | 'selected' | 'none';
}
