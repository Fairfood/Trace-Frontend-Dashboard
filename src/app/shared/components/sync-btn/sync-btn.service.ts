import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL, HTTP_OPTION_4 } from '../../configs/app.constants';
import { headerOptions } from 'fairfood-utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SyncBtnService {
  constructor(private http: HttpClient) {}

  syncWithConnect(): Observable<any> {
    return this.http.post(
      BASE_URL + '/projects/reverse-sync/',
      {},
      headerOptions(HTTP_OPTION_4)
    );
  }

  syncWithNavigate(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/projects/navigate-sync/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }
}
