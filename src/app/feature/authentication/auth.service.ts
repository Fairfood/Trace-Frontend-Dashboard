/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import totp from 'totp-generator';

import { environment } from 'src/environments/environment';
import { headerOptions } from 'src/app/shared/configs/app.methods';
import {
  ACTION_TYPE,
  HTTP_OPTION_1,
} from 'src/app/shared/configs/app.constants';
import { StorageService, UtilService } from 'src/app/shared/service';
const BASE_URL = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  sub: Subscription;
  constructor(
    public router: Router,
    public http: HttpClient,
    private util: UtilService,
    private storage: StorageService
  ) {}

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
  logout() {
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
    } else {
      this.clearLocalStorage();
    }
  }

  /**
   * Clears local storage and redirects the user to the authentication server's logout page.
   */
  /* istanbul ignore next */
  clearLocalStorage() {
    this.storage.clearStorage();
    window.location.href = environment.authUrl + '/logout';
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
