/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICommonObj } from 'src/app/shared/configs/app.model';

export interface IClaim extends ICommonObj {
  active: boolean;
  criteria: IClaimCriteria[];
  description_basic: string;
  description_full: string;
  image: string;
  inheritable: boolean;
  proportional: boolean;
  removable: boolean;
  type: number;
  verified_by: number;
  verifiers: any[];
  evidence?: any;
  assignVerifier?: boolean;
  verifierName?: string;
  selected?: boolean;
}

export interface IClaimField {
  description: string;
  multiple_options: boolean;
  options: any[];
  title: string;
  id: string;
  type: number;
  table?: boolean;
}

export interface IClaimCriteria extends ICommonObj {
  description: string;
  is_mandatory: boolean;
  verification_type: number;
  verifier: any;
  fields: IClaimField[];
  context: any;
}
