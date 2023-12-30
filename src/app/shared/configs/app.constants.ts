/* istanbul ignore file */
import { IDropdownItem, IhttpHeadConfig } from './app.model';
import { environment } from 'src/environments/environment';

export const BASE_URL: string = environment.baseUrl;

export enum ACTION_TYPE {
  SUCCESS = 'success',
  FAILED = 'error',
  DELETE = 'delete',
}

export const HTTP_OPTION_1: Partial<IhttpHeadConfig> = {
  contentType: true,
  token: true,
  userId: true,
  timezone: true,
};

export const HTTP_OPTION_2: Partial<IhttpHeadConfig> = {
  token: true,
  userId: true,
  timezone: true,
};

export const HTTP_OPTION_3: Partial<IhttpHeadConfig> = {
  contentType: true,
  token: true,
  userId: true,
  nodeId: true,
};

export const HTTP_OPTION_4: Partial<IhttpHeadConfig> = {
  token: true,
  userId: true,
  nodeId: true,
  timezone: true,
};

// Constants or Enums
export enum NotificationEvent {
  UserProfile = 1,
  Connections = 6,
  TransactionReport = 7,
  Stock = 11,
  RequestForInformation = 14,
  MapConnection = 16,
  ClaimDetails = 9,
  ClaimDetailsWithContext = 13,
}

export enum NotificationRequestType {
  Type1 = 1,
  Type2 = 2,
}

export enum exportType {
  STOCK = 1,
  EXTERNAL_TRANSACTION = 2,
  INTERNAL_TRANSACTION = 3,
  CONNECTIONS = 4,
  FARMER = 5,
  COMPANY = 6,
  INCOME = 10,
}

export enum exportFileType {
  EXCEL = 1,
  CSV = 2,
}
export const quantityRegex = '^[0-9]+(.[0-9]{0,2})?$';
export const UNITS: IDropdownItem[] = [
  {
    id: '1',
    name: 'KG',
  },
];

export enum dynamicTemplateType {
  TRANSACTION = 1,
  CONNECTION = 2,
}

export const emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
