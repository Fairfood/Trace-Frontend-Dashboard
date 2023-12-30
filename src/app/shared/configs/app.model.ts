/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
type FieldNames = 'contentType' | 'token' | 'timezone' | 'userId' | 'nodeId';

export type IhttpHeadConfig = {
  [K in FieldNames]: boolean;
};

type UserFields =
  | 'address'
  | 'dob'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'id'
  | 'image'
  | 'default_node';
type UserBooleanFields =
  | 'email_verified'
  | 'privacy_accepted'
  | 'terms_accepted';
type UserString = {
  [K in UserFields]: string;
};
type UserBoolean = {
  [K in UserBooleanFields]: boolean;
};
export interface IUserData extends UserString, UserBoolean {
  nodes: any[];
  phone?: {
    dial_code: string;
    phone: string;
  };
  status?: number;
  type?: number;
  updated_email?: string;
}

export interface ICommonObj {
  id: string;
  name: string;
}

export interface ICommonIdName extends Omit<ICommonObj, 'id'> {
  id: number;
}

export interface IDropdownItem extends ICommonObj {
  hideItem?: boolean;
}

export interface ITableColumnHeader {
  name: string;
  class: string;
  sortKey?: string;
  hideSort?: boolean;
  isColumnVisible?: boolean;
}

export interface IWizardStep {
  title: string;
  subTitle: string;
}
export interface ICarousal extends IWizardStep {
  imageUrl: string;
  defaultImage?: string;
}

export interface IAttachmentData {
  addedBy: string;
  addedOn: any;
  name: string;
  uploader?: string;
  file: string;
  id?: string;
}
export interface ITabItem {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface IconConfig {
  isMatIcon: boolean;
  icon: string;
}

export interface IList {
  title: string;
  description: string;
  leftIcon?: IconConfig;
  rightIcon?: IconConfig;
}

export interface IListWithIndex {
  item: IList;
  index: number;
}

export interface IActivity {
  text: string;
  image: string;
  created_on: string;
  supply_chain: string;
  user: string;
}

export interface ICommonAPIResponse<T> {
  count: number;
  results: T[];
}

export interface IAddionalFilter extends ICommonObj {
  visible: boolean;
}

export interface IProductMaster extends ICommonObj {
  description: string;
  image: string;
}

export interface INode extends ICommonObj {
  blockchain_address: string;
  claims: any[];
  country: string;
  province: string;
  email_sent: boolean;
  image: string;
  latitude: number;
  longitude: number;
  primary_operation: ICommonObj;
  short_name: string;
  status: number;
  type: number;
  managers: any[];
  description_basic: string;
  add_connections: boolean;
}
