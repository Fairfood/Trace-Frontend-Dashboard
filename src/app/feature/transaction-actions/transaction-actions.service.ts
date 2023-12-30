/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import { headerOptions } from 'src/app/shared/configs/app.methods';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.baseUrl;
@Injectable({
  providedIn: 'root',
})
export class TransactionActionsService {
  constructor(private http: HttpClient) {}

  // Loss Transaction
  removeStock(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/transactions/internal/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  rejectTransaction(id: string, param: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/transactions/external/' + id + '/reject/',
      param,
      headerOptions(HTTP_OPTION_4)
    );
  }

  formatDate(date: any): any {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }
}
