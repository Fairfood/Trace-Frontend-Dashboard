/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { environment } from 'src/environments/environment';
const BASE_URL = environment.baseUrl;
@Injectable({
  providedIn: 'root',
})
export class ConnectionLabelService {
  constructor(private http: HttpClient) {}

  listConnectionLabels(limit: number, offset: number): Observable<any> {
    const url = `${BASE_URL}/supply-chain/label/?limit=${limit}&offset=${offset}`;
    return this.http
      .get(url, headerOptions(HTTP_OPTION_4))
      .pipe(map(successFormatter));
  }

  createConnectionLabel(params: any): Observable<any> {
    const url = `${BASE_URL}/supply-chain/label/`;
    return this.http.post(url, params, headerOptions(HTTP_OPTION_4));
  }

  removeConnectionLabel(id: any): Observable<any> {
    const url = `${BASE_URL}/supply-chain/label/${id}/`;
    return this.http.delete(url, headerOptions(HTTP_OPTION_4));
  }

  updateConnectionLabel(id: string, params: any): Observable<any> {
    const url = `${BASE_URL}/supply-chain/label/${id}/`;
    return this.http.patch(url, params, headerOptions(HTTP_OPTION_4));
  }
}
