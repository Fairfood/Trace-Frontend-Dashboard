/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CompanyProfileStoreService } from '../company-profile-store.service';
import { HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import { map, tap } from 'rxjs/operators';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { Observable } from 'rxjs/internal/Observable';
import { ICommonObj } from 'src/app/shared/configs/app.model';

const BASE_URL = environment.baseUrl;
@Injectable({
  providedIn: 'root',
})
export class TeamMemberService {
  constructor(
    private store: CompanyProfileStoreService,
    private http: HttpClient
  ) {}

  /**
   * Fetch team members
   * Cache team members data
   * @returns Observable
   */
  listTeamMembers(reqOptions: {
    search: string;
    limit: number;
    offset: number;
  }): void {
    const { search, limit, offset } = reqOptions;

    this.http
      .get(
        `${BASE_URL}/supply-chain/node/member/?search=${search}&limit=${limit}&offset=${offset}`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(
        tap((d: any) => {
          const { data } = d;
          this.store.updateMemberData(data);
        })
      )
      .subscribe();
  }

  searchMember(search: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/supply-chain/node/member/?search=${search}`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  resendMemberInvite(data: any, teamId: any): Observable<any> {
    return this.http.post(
      `${BASE_URL}/supply-chain/node/member/${teamId}/resend/`,
      data,
      headerOptions(HTTP_OPTION_4)
    );
  }

  searchEmail(email: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/accounts/user/search/?email=${email}`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map((d: any) => d.data.results));
  }

  addTeam(data: any): Observable<any> {
    return this.http.post(
      `${BASE_URL}/supply-chain/node/member/`,
      data,
      headerOptions(HTTP_OPTION_4)
    );
  }

  updateRole(id: any, type: any): Observable<any> {
    return this.http.patch(
      `${BASE_URL}/supply-chain/node/member/${id}/`,
      { type },
      headerOptions(HTTP_OPTION_4)
    );
  }

  removeMember(id: any): Observable<any> {
    return this.http.delete(
      `${BASE_URL}/supply-chain/node/member/${id}/`,
      headerOptions(HTTP_OPTION_4)
    );
  }

  roleList(): ICommonObj[] {
    return [
      {
        name: 'Admin',
        id: '1',
      },
      {
        name: 'Member',
        id: '2',
      },
      {
        name: 'Viewer',
        id: '3',
      },
    ];
  }
}
