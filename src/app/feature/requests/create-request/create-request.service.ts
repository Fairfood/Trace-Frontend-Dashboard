/* eslint-disable @typescript-eslint/no-explicit-any */
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
export class CreateRequestService {
  constructor(private http: HttpClient) {}

  supplyChainData(): any {
    return localStorage.getItem('supplyChainId');
  }

  // Supplier data
  getSuppliers(type: number, search = ''): Observable<any> {
    const supplyChainId = this.supplyChainData();
    return this.http
      .get(
        BASE_URL +
          '/supply-chain/suppliers/?limit=1000&supply_chain=' +
          supplyChainId +
          '&type=' +
          type +
          '&search=' +
          search,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(mapResults));
  }

  /**
   * Request for a stock to supplier
   * @param params :any
   * @returns  Observable<any>
   */
  createStockRequest(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/requests/stock/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  transparencyRequest(type: number): Observable<any> {
    const supplyChainId = this.supplyChainData();
    return this.http.get(
      BASE_URL +
        '/requests/stock/?search=' +
        '&type=' +
        type +
        '&node=' +
        '&product=' +
        '&status=' +
        '&date_from=' +
        '&date_to=' +
        '&date_on=' +
        '&quantity_from=' +
        '&quantity_to=' +
        '&quantity_is=' +
        '&limit=' +
        '&supply_chain=' +
        supplyChainId,
      headerOptions(HTTP_OPTION_4)
    );
  }

  verifyTransactionRequest(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/requests/stock/verify/',
      params,
      headerOptions(HTTP_OPTION_3)
    );
  }
}
