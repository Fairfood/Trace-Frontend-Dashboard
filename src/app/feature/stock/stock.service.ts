/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { headerOptions } from 'fairfood-utils';
import { Observable, map } from 'rxjs';
import {
  BASE_URL,
  HTTP_OPTION_3,
  HTTP_OPTION_4,
} from 'src/app/shared/configs/app.constants';
import { mapResults } from 'src/app/shared/configs/app.methods';
import { StorageService } from 'src/app/shared/service';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  constructor(private http: HttpClient, private storage: StorageService) {}

  supplyChainData(): any {
    return this.storage.retrieveStoredData('supplyChainId');
  }

  /* istanbul ignore next */
  searchConnectedCompany(val: string, connected: boolean): Observable<any> {
    const supplyChainId = this.storage.retrieveStoredData('supplyChainId');
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
  /* istanbul ignore next */
  createTransaction(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/transactions/external/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  // Merge Transaction
  /* istanbul ignore next */
  mergeStock(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/transactions/internal/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  /* istanbul ignore next */
  searchFarmer(val: string): Observable<any> {
    const supplyChainId = this.storage.retrieveStoredData('supplyChainId');
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

  /* istanbul ignore next */
  createProductBulk(params: any): Observable<any> {
    return this.http
      .post(BASE_URL + '/products/bulk/', params, headerOptions(HTTP_OPTION_4))
      .pipe(
        map((res: any) => {
          const { success, data } = res;
          if (success) {
            return data;
          } else {
            return null;
          }
        })
      );
  }

  /**
   * Creating a new product
   *
   * @param name | string
   * @returns Observable<any>
   */
  /* istanbul ignore next */
  createProduct(name: string): Observable<any> {
    const supply_chain = this.storage.retrieveStoredData('supplyChainId');
    const params = {
      supply_chain,
      name,
    };
    return this.http
      .post(BASE_URL + '/products/', params, headerOptions(HTTP_OPTION_4))
      .pipe(
        map((res: any) => {
          const { success, data } = res;
          if (success) {
            return data;
          } else {
            return null;
          }
        })
      );
  }

  // getting all the products in supply chain
  /* istanbul ignore next */
  searchProduct(val: string): Observable<any> {
    const supplyChainId = this.storage.retrieveStoredData('supplyChainId');
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
