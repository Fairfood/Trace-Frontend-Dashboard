/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import { headerOptions } from 'src/app/shared/configs/app.methods';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.baseUrl;
@Injectable({
  providedIn: 'root',
})
export class DocumentationService {
  constructor(private http: HttpClient) {}

  listDocument(limit: number, offset: number): Observable<any> {
    return this.http
      .get(
        BASE_URL +
          '/supply-chain/node/documents/?limit=' +
          limit +
          '&offset=' +
          offset,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(
        map((d: any) => {
          const { results, count } = d.data;
          return { results, count };
        })
      );
  }

  uploadDoc(file: any): Observable<any> {
    return this.http.post(
      `${BASE_URL}/supply-chain/node/documents/`,
      file,
      headerOptions(HTTP_OPTION_4)
    );
  }

  deleteDoc(file: any): Observable<any> {
    return this.http.delete(
      `${BASE_URL}/supply-chain/node/documents/${file.id}/`,
      headerOptions(HTTP_OPTION_4)
    );
  }
}
