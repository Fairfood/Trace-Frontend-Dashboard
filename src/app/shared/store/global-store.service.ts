/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseStoreService } from './base-store.service';
import { ICommonObj, IUserData } from '../configs/app.model';

/**
 * Interface representing the global state structure.
 */
interface IGlobal {
  appConstants: any;
  countryData: any;
  countryCodeData: any;
  userData: any;
  supplyChainData: any;
  supplyChainProducts: ICommonObj[];
  // act as a filter master data in stock and transactions (include farmers and company) latest 100
  latestConnections: ICommonObj[];
  connectedCompanies: ICommonObj[];
}

const initialState: IGlobal = {
  appConstants: null,
  countryData: null,
  countryCodeData: null,
  userData: null,
  supplyChainData: null,
  supplyChainProducts: null,
  latestConnections: null,
  connectedCompanies: null,
};

@Injectable({
  providedIn: 'root',
})
export class GlobalStoreService extends BaseStoreService<IGlobal> {
  /**
   * Observable for app constants in the global state.
   */
  glboalConstants$: Observable<any> = this.select(
    (state: IGlobal) => state.appConstants
  );

  /**
   * Observable for the list of countries in the global state.
   */
  countryList$: Observable<any[]> = this.select(
    (state: IGlobal) => state.countryData
  );

  /**
   * Observable for the list of country codes in the global state.
   * Fetching only once per refresh
   */
  countryCodeList$: Observable<any[]> = this.select(
    (state: IGlobal) => state.countryCodeData
  );

  /**
   * Observable for user data in the global state.
   */
  userData$: Observable<IUserData> = this.select(
    (state: IGlobal) => state.userData
  );

  /**
   * Observable for supply chain data in the global state.
   * Fetching only once
   */
  supplychainData$: Observable<Partial<ICommonObj>[]> = this.select(
    (state: IGlobal) => state.supplyChainData
  );

  /**
   * Observable for supply chain products in the global state.
   * Refetching on every supplychain changes
   */
  supplychainProducts$: Observable<any[]> = this.select(
    (state: IGlobal) => state.supplyChainProducts
  );

  /**
   * Observable for the latest connection details in the global state.
   */
  latestConnectionDetails$: Observable<any[]> = this.select(
    (state: IGlobal) => state.latestConnections
  );

  /**
   * Observable for connected companies in the global state.
   */
  connectedCompanies$: Observable<any[]> = this.select(
    (state: IGlobal) => state.connectedCompanies
  );

  constructor() {
    super(initialState);
  }

  /**
   * Updates the app constants in the global state.
   * @param data - New app constants data.
   */
  updateConstant(data: any): void {
    this.setState({
      appConstants: data,
    });
  }

  /**
   * Initializes country data in the global state.
   * @param countryData - List of countries.
   * @param countryCodeData - List of country codes.
   */
  initCountryData(countryData: any, countryCodeData: any): void {
    this.setState({
      countryData,
      countryCodeData,
    });
  }

  /**
   * Updates user data in the global state.
   * @param value - New user data.
   */
  updateUserData(value: Partial<IUserData>): void {
    this.setState({
      userData: value,
    });
  }

  /**
   * Initializes supply chain data in the global state.
   * @param value - List of supply chain data.
   */
  initSupplychainData(value: Partial<ICommonObj>[]): void {
    this.setState({
      supplyChainData: value,
    });
  }

  /**
   * Initializes product data in the global state.
   * @param value - List of product data.
   */
  initProductData(value: ICommonObj[]): void {
    this.setState({
      supplyChainProducts: value,
    });
  }

  /**
   * Updates the latest connections data in the global state.
   * @param value - List of latest connections data.
   */
  updateLatestConnections(value: ICommonObj[]): void {
    this.setState({
      latestConnections: value,
    });
  }

  /**
   * Sets the connected companies data in the global state.
   * @param value - List of connected companies data.
   */
  setConnectedCompanies(value: ICommonObj[]): void {
    this.setState({
      connectedCompanies: value,
    });
  }
}
