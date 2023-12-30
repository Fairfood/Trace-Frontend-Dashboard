/* eslint-disable @typescript-eslint/no-explicit-any */

import { ITabItem } from 'src/app/shared/configs/app.model';
import {
  CONVERT,
  MERGE_STOCK,
  RECEIVE_STOCK,
  SEND,
  STOCK,
} from './process-stock.constants';

export enum StepValues {
  STOCK = 'stock',
  TRANSACTION = 'transaction',
  CLAIMS = 'claims',
  SUMMARY = 'summary',
}

export interface BatchSummary {
  totalQuantity: number;
  currentStep: string;
  batchQuantity?: number;
  batches?: number;
  products?: string[];
  product?: string;
  transactionDate?: string;
  companyName?: string;
  requestLinked?: boolean;
  requestedData?: any;
  destinationQuantity?: number;
  destinationProducts?: string[];
  farmerName?: string;
  currency?: string;
  totalPrice?: number;
}

export interface CompanyData {
  connectable: boolean;
  connected: boolean;
  email_sent: boolean;
  id: string;
  image: string;
  name: string;
}

export interface TransactionState {
  transactionDetails: Record<string, any>;
  requestedData?: Record<string, any>;
}

export const stockProcessTabs = (type: string): ITabItem[] => {
  if (type === 'send') {
    return [...STOCK, ...SEND];
  } else if (type === 'convert') {
    return [...STOCK, ...CONVERT];
  } else if (type === 'receive') {
    return RECEIVE_STOCK;
  } else {
    return MERGE_STOCK;
  }
};

export interface StockButtonState {
  action: string;
  disabled: boolean;
  currentStep: string;
  buttonText: string;
}

export type ButtonNav = 'next' | 'prev';
