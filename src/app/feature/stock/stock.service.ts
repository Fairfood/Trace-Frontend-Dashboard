/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  BASE_URL,
  HTTP_OPTION_3,
  HTTP_OPTION_4,
} from 'src/app/shared/configs/app.constants';
import { headerOptions, mapResults } from 'src/app/shared/configs/app.methods';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  constructor(private http: HttpClient) {}

  supplyChainData(): any {
    return localStorage.getItem('supplyChainId');
  }

  searchConnectedCompany(val: string, connected: boolean): Observable<any> {
    const supplyChainId = this.supplyChainData();
    return this.http
      .get(
        BASE_URL +
          '/supply-chain/company/?search=' +
          val +
          '&connected=' +
          connected +
          '&supply_chain=' +
          supplyChainId,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(mapResults));
  }

  /**
   * Create a transaction like send, convert or receive
   * @param params any
   * @returns Observable<any>
   */
  createTransaction(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/transactions/external/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  // Merge Transaction
  mergeStock(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/transactions/internal/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  searchFarmer(val: string): Observable<any> {
    const supplyChainId = this.supplyChainData();
    return this.http
      .get(
        BASE_URL +
          '/supply-chain/farmer/?search=' +
          val +
          '&supply_chain=' +
          supplyChainId,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(mapResults));
  }

  createProductBulk(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/products/bulk/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  /**
   * Creating a new product
   *
   * @param name | string
   * @returns Observable<any>
   */
  createProduct(name: string): Observable<any> {
    const supply_chain = this.supplyChainData();
    const params = {
      supply_chain,
      name,
    };
    return this.http.post(
      BASE_URL + '/products/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  // getting all the products in supply chain
  searchProduct(val: string): Observable<any> {
    const supplyChainId = this.supplyChainData();
    return this.http
      .get(
        BASE_URL +
          '/products/?limit=1000&search=' +
          val +
          '&supply_chain=' +
          supplyChainId,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(mapResults));
  }
}
