/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// http call related
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { GlobalStoreService } from '../store/global-store.service';
import { SnackBarComponent } from '../components/snack-bar/snack-bar.component';
// configs
import { successFormatter } from '../configs/app.methods';
import {
  ACTION_TYPE,
  HTTP_OPTION_1,
  HTTP_OPTION_2,
  HTTP_OPTION_3,
  HTTP_OPTION_4,
} from '../configs/app.constants';
import { StorageService } from './storage.service';
import {
  ICommonAPIResponse,
  ICommonObj,
  INode,
  IProductMaster,
} from '../configs/app.model';
import { TranslateService } from '@ngx-translate/core';
import { headerOptions } from 'fairfood-utils';
const BASE_URL = environment.baseUrl;

const mapFn = (res: any): ICommonObj[] => {
  const { results } = res;
  const result = results.map((item: any) => {
    const { id, name } = item;
    return {
      id,
      name,
    };
  });
  return result;
};

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme: any;
  supplyChainData$ = new Subject<string>();
  companyData$ = new BehaviorSubject(null);
  mapInitialized$ = new BehaviorSubject<boolean>(false);
  allSupplyChain$ = new BehaviorSubject<boolean>(false);
  linkedTransparencyRequestData: any;
  externalId = new BehaviorSubject<boolean>(false);

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private store: GlobalStoreService,
    private storage: StorageService,
    private translate: TranslateService
  ) {}

  /**
   * Displays a customized snack bar notification with a success or error message.
   *
   * @param message The message to be displayed in the snack bar.
   * @param type The type of the message, either 'success' or 'error' or 'delete'.
   */
  customSnackBar(message: string, type: 'success' | 'error' | 'delete'): void {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: {
        message: message,
        icon: type,
      },
      duration: 3000,
    });
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains('push-right');
  }

  toggleSidebar(): void {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('push-right');
  }

  getUserDetails(userId: string): Observable<any> {
    return this.http
      .get(`${BASE_URL}/accounts/user/${userId}/`, headerOptions(HTTP_OPTION_1))
      .pipe(map(successFormatter));
  }

  updateUser(params: any): Observable<any> {
    return this.http
      .patch(`${BASE_URL}/accounts/user/`, params, headerOptions(HTTP_OPTION_2))
      .pipe(map(successFormatter));
  }

  getSupplyChains(): Observable<any> {
    return this.http
      .get(`${BASE_URL}/supply-chain/`, headerOptions(HTTP_OPTION_3))
      .pipe(map(successFormatter));
  }

  loadAppConstants() {
    this.http
      .get(`${BASE_URL}/dashboard/config/`, headerOptions(HTTP_OPTION_1))
      .pipe(map(successFormatter))
      .subscribe({
        next: response => {
          const { currencies, ...configs } = response;
          const result = currencies.map(
            (data: { key: string; name: string }) => {
              const { key, name } = data;
              return {
                id: key,
                name: `${key}-${name}`,
              };
            }
          );
          this.store.updateConstant({
            ...configs,
            currencies: result,
          });
          this.setCountries();
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  setCountries(): void {
    this.http
      .get(`${BASE_URL}/supply-chain/countries/`, headerOptions(HTTP_OPTION_1))
      .pipe(
        tap((res: any) => {
          const { data, success } = res;
          if (success) {
            const countryCodes: any = [];
            const result = Object.keys(data).map(key => {
              data[key].id = key;
              data[key].name = key;
              countryCodes.push({
                id: `+${data[key].dial_code}`,
                name: `${key} (+${data[key].dial_code})`,
              });
              return data[key];
            });

            this.store.initCountryData(result, countryCodes);
          }
        })
      )
      .subscribe();
  }

  downloadReceipt(url: string): any {
    return this.http.get(url, { responseType: 'blob' });
  }

  listReceivedVerifications(limit: number): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/claims/verification/received/?limit=${limit}`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  loadGoogleMaps(): void {
    const url = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapKey}`;

    this.http
      .jsonp(url, 'callback')
      .pipe(
        map(() => true),
        catchError((err: Error) => {
          console.log(err);
          return throwError(() => false);
        }),
        tap((status: boolean) => {
          this.mapInitialized$.next(status);
        })
      )
      .subscribe();
  }

  validateCompanyname(companyName: string): Observable<any> {
    return this.http.post(
      BASE_URL + '/supply-chain/validate/company-name/',
      {
        name: companyName,
      },
      headerOptions(HTTP_OPTION_1)
    );
  }

  checkFarmerID(data: any) {
    return this.http.post(
      BASE_URL + '/supply-chain/validate/farmer/',
      data,
      headerOptions(HTTP_OPTION_4)
    );
  }

  localSupplyChainData(): string {
    return this.storage.retrieveStoredData('supplyChainId');
  }

  // getting all the products in supply chain
  searchProduct(val: string): Observable<ICommonAPIResponse<IProductMaster>> {
    const supplyChainId = this.localSupplyChainData();
    return this.http
      .get(
        BASE_URL +
          '/products/?limit=1000&search=' +
          val +
          '&supply_chain=' +
          supplyChainId,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map(successFormatter),
        tap((res: ICommonAPIResponse<IProductMaster>) => {
          const { results } = res;
          const result = results.map((item: IProductMaster) => {
            const { id, name } = item;
            return {
              id,
              name,
            };
          });
          this.store.initProductData(result);
        })
      );
  }

  getCompany(): Observable<ICommonAPIResponse<INode>> {
    const supplyChainId =
      this.localSupplyChainData() === null ? '' : this.localSupplyChainData();
    return this.http
      .get(
        BASE_URL +
          '/supply-chain/connections/?search=&limit=200&supply_chain=' +
          supplyChainId,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map(successFormatter),
        tap((res: any) => {
          const result = mapFn(res);
          this.store.updateLatestConnections(result);
        })
      );
  }

  searchConnectedCompany(
    val: string,
    connected: boolean
  ): Observable<ICommonAPIResponse<INode>> {
    const supplyChainId = this.localSupplyChainData();
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
      .pipe(
        map(successFormatter),
        tap(res => {
          const result = mapFn(res);
          this.store.setConnectedCompanies(result);
        })
      );
  }

  transactionRejectMessage(type: 'fail' | 'success'): void {
    const message =
      type === 'fail'
        ? this.translate.instant('transaction.snackbar.rejectFailed')
        : this.translate.instant('transaction.snackbar.rejected');

    this.customSnackBar(
      message,
      type === 'fail' ? ACTION_TYPE.FAILED : ACTION_TYPE.SUCCESS
    );
  }

  getNotificationSettings(node_id: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/communications/email-configs/?node=${node_id}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  updateNotificationSettings(data: any): Observable<any> {
    return this.http.post(
      `${BASE_URL}/communications/email-configs/`,
      data,
      headerOptions(HTTP_OPTION_3)
    );
  }

  fetchCompanyDetails(companyId: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/supply-chain/company/${companyId}/`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((d: any) => {
          const { data } = d;
          data.external_id
            ? this.externalId.next(true)
            : this.externalId.next(false);
          return data;
        })
      );
  }

  checkStatus(claim: string, nodeId: string) {
    return this.http.get(
      BASE_URL +
        `/guardian/claim-status/?guardian_claim=${claim}&filter_value=${nodeId}`,
      headerOptions(HTTP_OPTION_4)
    );
  }
}
