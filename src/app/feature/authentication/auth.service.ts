/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Injector, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription, catchError, map, of, tap } from 'rxjs';
import totp from 'totp-generator';

import {
  clientId,
  clientSecret,
  environment,
} from 'src/environments/environment';
import { successFormatter } from 'src/app/shared/configs/app.methods';
import {
  ACTION_TYPE,
  HTTP_OPTION_1,
  HTTP_OPTION_5,
} from 'src/app/shared/configs/app.constants';
import {
  IRefreshTokenApi,
  IdTokenResponse,
} from 'src/app/shared/configs/app.model';
// services
import { StorageService, UtilService } from 'src/app/shared/service';
import { HTTP_OPTION_6, headerOptions } from 'fairfood-utils';
import { JwtHelperService } from '@auth0/angular-jwt';

const BASE_URL = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  sub: Subscription;

  private readonly TOKEN_EXPIRY_THRESHOLD_MINUTES = 5;
  // private readonly jwtHelper = inject(JwtHelperService);
  private jwtHelper: JwtHelperService;
  constructor(
    public router: Router,
    public http: HttpClient,
    private util: UtilService,
    private storage: StorageService,
    private injector: Injector
  ) {}

  private getJwtHelper(): JwtHelperService {
    if (!this.jwtHelper) {
      this.jwtHelper = this.injector.get(JwtHelperService);
    }
    return this.jwtHelper;
  }

  /**
   * Generates a Time-based One-Time Password (TOTP) token using the configured secret.
   * @returns TOTP token as a string.
   */
  generateTotpToken(): string {
    return totp(environment.totpToken);
  }

  /**
   * Performs a login request to the authentication server.
   * @param params - User credentials for login.
   * @returns An Observable with the authentication response.
   */
  /* istanbul ignore next */
  login(params: any): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/accounts/login/`, params);
  }

  /**
   * Performs a magic login request using a TOTP token for authentication.
   * @param params - User credentials for magic login.
   * @returns An Observable with the authentication response.
   */
  magicLogin(params: any): Observable<any> {
    const headers = new HttpHeaders({
      otp: this.generateTotpToken(),
    });
    return this.http.post<any>(`${BASE_URL}/accounts/login/magic/`, params, {
      headers,
    });
  }
  /**
   * Logs the user out by sending a request to the authentication server.
   * Clears local storage upon successful logout.
   */
  /* istanbul ignore next */
  logout(): void {
    const device_id = this.storage.retrieveStoredData('deviceId');
    if (device_id) {
      this.sub = this.http
        .post(
          `${BASE_URL}/accounts/logout/`,
          {
            device_id,
          },
          headerOptions(HTTP_OPTION_1)
        )
        .subscribe({
          next: () => {
            this.clearLocalStorage();
          },
          error: (err: any) => {
            console.log(err);
            const { error } = err;
            this.util.customSnackBar(error.detail.detail, ACTION_TYPE.FAILED);
          },
        });
      document.cookie =
        'isFairfoodUserLoggedIn=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    } else {
      this.clearLocalStorage();
      document.cookie =
        'isFairfoodUserLoggedIn=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  }

  /**
   * Clears local storage and redirects the user to the authentication server's logout page.
   */
  /* istanbul ignore next */
  clearLocalStorage() {
    this.storage.clearStorage();
    window.location.href = `${environment.authUrl}/logout`;
  }

  /**
   * Checks the validity of a verification token.
   * @param token - Verification token.
   * @param salt - Salt for verification.
   * @param type - Type of verification.
   * @returns An Observable with the verification response.
   */
  /* istanbul ignore next */
  checkVerify(token: string, salt: string, type: any): Observable<any> {
    const url = `${BASE_URL}/accounts/validator/?token=${token}&salt=${salt}&type=${type}`;
    return this.http.get<any>(url);
  }

  /**
   * Validates a verification token.
   * @param token - Verification token.
   * @param salt - Salt for verification.
   * @param type - Type of verification.
   * @returns An Observable with the validation response.
   */
  /* istanbul ignore next */
  validate(token: string, salt: string, type: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'User-Type': type,
    });
    const data = {
      token,
      salt,
    };
    return this.http.post<any>(`${BASE_URL}/accounts/validator/`, data, {
      headers,
    });
  }

  /**
   * Retrieves notification parameters for a given notification ID.
   * @param notificationId - ID of the notification.
   * @returns An Observable with the notification parameters.
   */
  /* istanbul ignore next */
  getNotificationParams(notificationId: string): Observable<any> {
    return this.http.get<any>(
      `${BASE_URL}/communications/notifications/${notificationId}/`
    );
  }

  getIdToken(reqObject: any): Observable<any> {
    const headers = new HttpHeaders({
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const encoded = new URLSearchParams(Object.entries(reqObject)).toString();
    return this.http.post(`${environment.ssoBaseUrl}o/oauth2/token/`, encoded, {
      headers,
    });
  }

  setUserData(token: IdTokenResponse): void {
    this.storage.saveInStorage('isFairfoodUserLoggedin', 'true');
    this.storage.saveInStorage('access_token', token.access_token);
    this.storage.saveInStorage('refresh_token', token.refresh_token);
    this.storage.saveInStorage('id_token', token.id_token);
    this.setCookie();
  }

  fetchSsoUserDetails(): Observable<any> {
    return this.http
      .get(`${BASE_URL}/accounts/current-user/`, headerOptions(HTTP_OPTION_5))
      .pipe(map(successFormatter));
  }

  refreshToken(): Observable<any> {
    const refresh_token = this.storage.retrieveStoredData('refresh_token');
    if (!refresh_token) {
      return of();
    }
    const reqObj: IRefreshTokenApi = {
      refresh_token: refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };
    const encoded = new URLSearchParams(Object.entries(reqObj)).toString();
    return this.http
      .post(
        `${environment.ssoBaseUrl}o/oauth2/token/`,
        encoded,
        headerOptions(HTTP_OPTION_6)
      )
      .pipe(
        catchError(() => of()),
        tap((data: any) => {
          const { access_token, refresh_token, id_token } = data;
          this.storage.saveInStorage('access_token', access_token);
          this.storage.saveInStorage('refresh_token', refresh_token);
          this.storage.saveInStorage('id_token', id_token);
          this.scheduleTokenRefresh(data.access);
        })
      );
  }

  scheduleTokenRefresh(token: string): void {
    const expirationTime = this.getJwtHelper()
      .getTokenExpirationDate(token)
      ?.getTime();
    const refreshTime = expirationTime
      ? expirationTime - this.TOKEN_EXPIRY_THRESHOLD_MINUTES * 60 * 1000
      : Date.now();
    const refreshInterval = refreshTime - Date.now();

    if (refreshInterval > 0) {
      setTimeout(() => {
        this.refreshToken().subscribe();
      }, refreshInterval);
    }
  }

  setCookie(): void {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 100);

    let domainPath = '';

    // Handle domain for local and other environments
    const currentUrl = window.location.hostname;
    if (currentUrl.includes('localhost')) {
      domainPath = 'domain=localhost;'; // Share cookies between localhost ports
    } else if (currentUrl.includes('.org')) {
      domainPath = 'domain=fairfood.org;';
    } else if (currentUrl.includes('.nl')) {
      domainPath = 'domain=fairfood.nl;';
    } else {
      const extractedDomain = currentUrl
        .split('//')[1]
        ?.split(':')[0]
        ?.split('/')[0];
      domainPath = extractedDomain ? `domain=${extractedDomain};` : '';
    }

    // Set cookie to indicate that the user is logged in
    document.cookie = `isFairfoodUserLoggedIn=true;${domainPath}path=/;expires=${expiryDate.toUTCString()};secure;`;
  }

  /**
   * Cleanup method to unsubscribe from subscriptions when the service is destroyed.
   */
  /* istanbul ignore next */
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub?.unsubscribe();
    }
  }
}
