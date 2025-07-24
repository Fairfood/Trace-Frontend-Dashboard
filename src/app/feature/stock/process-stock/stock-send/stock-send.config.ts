import { CreateConnectionPopupComponent } from 'src/app/feature/connections/create-connection-popup';
import { SummaryCardComponent } from '../summary-card';
import { RECEIVE_STOCK_CONFIG } from '../receive-stock-single/receive-stock-single.config';

export const ADDITIONAL_CONFIG = [
  ...RECEIVE_STOCK_CONFIG,
  SummaryCardComponent,
  CreateConnectionPopupComponent,
];
