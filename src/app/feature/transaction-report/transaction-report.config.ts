/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { IClaim } from '../claim/claim.model';

export const TAB: ICommonObj[] = [
  {
    id: 'basic',
    name: 'Basic',
  },
  {
    id: 'trace',
    name: 'Trace',
  },
  {
    id: 'claims',
    name: 'Claims',
  },
  {
    id: 'docs',
    name: 'Docs',
  },
];

export const STOCK_LOSS: ICommonObj[] = [
  {
    id: 'basic',
    name: 'Basic',
  },
  {
    id: 'claims',
    name: 'Claims',
  },
  {
    id: 'docs',
    name: 'Docs',
  },
];

export interface ITransactionDetail {
  number: string;
  claims: IClaim[];
  currency?: any;
  logged_time: any;
  date: any;
  seller_ref_number: any;
  status: number;
  transaction_type: number;
  type: number;
  buyer_ref_number: string;
  badgeText?: string;
  premiums?: any[];
  price?: any;
  rejectable?: boolean;
  priceText?: string;
  destination_batches?: any;
  destination_products?: any;
  sourceProductNames?: string;
  source_products?: any;
  destinationProductNames?: string;
  consumer_interface_url?: string;
  transaction?: string;
  source_batches?: any;
  destination?: any;
  comment?: string;
  products?: any;
  quantity?: number;
  destination_quantity?: number;
  source?: any;
  source_quantity?: number;
  source_wallet?: any;
  id: string;
  blockchain_address?: string;
  explorer_url: string;
  wallet_type?: number;
}

export enum BadgeText {
  OUTGOING = 'Outgoing',
  INCOMING = 'Incoming',
  REVERSAL = 'Reversal',
  PROCESSING = 'Processing',
  LOSS = 'Stock loss',
  MERGE = 'Merge',
}
