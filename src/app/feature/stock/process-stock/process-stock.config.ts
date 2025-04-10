/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */

import { ITabItem } from 'src/app/shared/configs/app.model';
import {
  CONVERT,
  CUSTOM_DATE_FORMATS,
  MERGE_STOCK,
  RECEIVE_STOCK,
  SEND,
  STOCK,
} from './process-stock.constants';
import { CommonModule } from '@angular/common';
import { FairFoodCustomTabComponent, LoaderComponent } from 'fairfood-utils';
import { StockConvertComponent } from './stock-convert';
import { StockSendComponent } from './stock-send';
import { ReceiveStockSingleComponent } from './receive-stock-single';
import { StockClaimsComponent } from './stock-claims';
import { TransactionSummaryComponent } from './transaction-summary';
import { StockMergeComponent } from './stock-merge';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { IBatches } from '../listing/listing.model';

export const PROCESS_STOCK_CONFIG = [
  CommonModule,
  FairFoodCustomTabComponent,
  LoaderComponent,
  StockConvertComponent,
  StockSendComponent,
  ReceiveStockSingleComponent,
  StockClaimsComponent,
  StockMergeComponent,
  TransactionSummaryComponent,
];

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

export const DATE_PROVIDER = [
  { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
  },
];

export interface InheritableClaimAPI {
  batches: IBatches[];
  formData: any;
  actionUrl: string;
}
