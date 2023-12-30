/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { BASE_URL, HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';

@Injectable({
  providedIn: 'root',
})
export class RequestListingService {
  constructor(private http: HttpClient, private fb: FormBuilder) {}

  getRequestslist(appliedFilterValues: any): Observable<any> {
    const { requestType, status, searchText, direction } = appliedFilterValues;
    return this.http
      .get(
        BASE_URL +
          '/requests/?search=' +
          searchText +
          '&request_type=' +
          requestType +
          '&status=' +
          status +
          '&type=' +
          direction +
          '&limit=50',
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  getStockRequestDetails(id: string): Observable<any> {
    return this.http.get(
      BASE_URL + '/requests/stock/' + id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  getClaimRequestDetails(id: string): Observable<any> {
    return this.http.get(
      BASE_URL + '/requests/claim/' + id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  listCompanyClaims(node_id: string): Observable<any> {
    return this.http.get(
      BASE_URL + '/claims/node/' + node_id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  getMapSupplierRequestDetails(id: string): Observable<any> {
    return this.http.get(
      BASE_URL + '/requests/connection/' + id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  getTransparencyRequestDetails(id: string): Observable<any> {
    return this.http.get(
      BASE_URL + '/requests/stock/' + id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  // claims
  getClaims(chainId: string): Observable<any> {
    return this.http.get(
      BASE_URL + '/claims/?supply_chain=' + chainId + '&type=1',
      headerOptions(HTTP_OPTION_4)
    );
  }

  updateMapSupplierRequest(id: any, params: any): Observable<any> {
    return this.http.patch(
      BASE_URL + '/requests/connection/' + id + '/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  addClaimResponse(id: any, params: any): Observable<any> {
    return this.http.patch(
      BASE_URL + '/requests/claim/field/' + id + '/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  attachPrivateClaim(id: any, params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/requests/claim/' + id + '/attach/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  updateClaimRequest(id: any, params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/requests/claim/' + id + '/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  updateStockRequest(id: any, params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/requests/stock/' + id + '/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  removeTransparencyRequest(id: any): Observable<any> {
    return this.http.delete(
      BASE_URL + '/requests/stock/' + id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  reasonForm(): FormGroup {
    return this.fb.group({
      reason: [''],
    });
  }
}
