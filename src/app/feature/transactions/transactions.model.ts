import { ICommonIdName, ICommonObj } from 'src/app/shared/configs/app.model';

export interface ITransactionCreator {
  first_name: string;
  last_name: string;
  email: string;
  id: string;
  is_active: boolean;
  phone: {
    dial_code: string;
    phone: string;
  };
  type: number;
}

export interface ITransactionConnection {
  id: string;
  name: string;
  type: number;
  status: number;
  image: string;
  latitude: number;
  longitude: number;
  primary_operation: ICommonObj;
  province: string;
  country: string;
  description_basic: string;
}

export interface ITransactionData {
  blockchain_address: string;
  id: string;
  quantity: number;
  buyer_ref_number: string;
  connection?: ITransactionConnection;
  creator?: ITransactionCreator;
  currency: string;
  date: number;
  number: number;
  price: number;
  products: Partial<ICommonObj>[];
  rejectable: boolean;
  result_batches: string[];
  seller_ref_number: string;
  type: number;
  source?: Source;
}
export interface ITrListFilterMaster {
  transactionFilterTypes: ICommonIdName[];
  companyData: ICommonObj[];
  productData: ICommonObj[];
  teamMembers: ICommonObj[];
}

export interface IAppliedFilterTransaction {
  selectedProduct: string;
  selectedCompany: string;
  searchString: string;
  transactionType: string;
  limit: number;
  offset: number;
  orderBy: string;
  sortBy: string;
  quantityFrom: string;
  quantityTo: string;
  dateOn: string;
  dateTo: string;
  dateFrom: string;
  creator: string;
  archived: boolean;
  isCarbonProduct?: boolean;
}

export interface IStockActionTable {
  id: number;
  itemId: string;
  type: string;
  created: string;
  creator: any;
  sourceProduct?: string;
  sourceQuantity?: any;
  destinationProduct?: string;
  quantity?: number;
  removedStockId?: string;
}

export interface FilterParams {
  type?: number;
  date_from: string;
  date_to: string;
  date_on: string;
  search: string;
  creator: string;
  quantity_from: string;
  quantity_to: string;
  product?: string;
  node?: string;
  destination_product?: string;
  source_product?: string;
}

export interface Source {
  id: string;
  name: string;
  short_name: string;
  blockchain_address: string;
  primary_operation: PrimaryOperation;
  type: number;
  status: number;
  image: string;
  latitude: number;
  longitude: number;
  country: string;
  province: string;
  description_basic: string;
  date_joined: any;
  managers: string[];
  claims: any[];
  email_sent: boolean;
  add_connections: boolean;
  pseudonimized: boolean;
}

export interface PrimaryOperation {
  id: string;
  name: string;
}
