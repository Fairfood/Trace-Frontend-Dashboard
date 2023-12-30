/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
// config
import {
  headerOptions,
  mapResults,
  successFormatter,
} from '../configs/app.methods';
import { HTTP_OPTION_3 } from '../configs/app.constants';
import { environment } from 'src/environments/environment';
const BASE_URL = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  exportDataInit$ = new Subject<Record<string, any>>();
  exportIconClicked$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  initExportData(exportingParams: any): void {
    this.exportDataInit$.next(exportingParams);
  }

  /* istanbul ignore next */
  hasExportStarted(): Observable<Record<string, any>> {
    return this.exportDataInit$.asObservable();
  }

  createExport(params: any): Observable<any> {
    return this.http
      .post(
        BASE_URL + '/reports/exports/',
        params,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  pingAPI(id: string): Observable<any> {
    return this.http
      .get(`${BASE_URL}/reports/exports/${id}/`, headerOptions(HTTP_OPTION_3))
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  cancelExport(id: string): Observable<any> {
    return this.http.post(
      `${BASE_URL}/reports/exports/${id}/revoke/`,
      {},
      headerOptions(HTTP_OPTION_3)
    );
  }

  reportListing(): Observable<any> {
    return this.http
      .get(BASE_URL + '/reports/exports/', headerOptions(HTTP_OPTION_3))
      .pipe(map(mapResults));
  }
}
