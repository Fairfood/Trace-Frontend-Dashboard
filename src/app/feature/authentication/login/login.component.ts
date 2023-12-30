/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * This is a standalone component which can be lazily loaded
 * Checking if magic link url is valid otherwise redirect to login application
 */

// Modules
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// config
import { environment } from 'src/environments/environment';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
const ERROR_MESSAGE = 'Something went wrong! Please try again.';

// Services
import { AuthService } from '../auth.service';
import { UtilService } from 'src/app/shared/service/util.service';
import { ThemeService } from 'src/app/shared/service/theme.service';
import { StorageService } from 'src/app/shared/service';
// components
import { LoaderComponent } from 'fairfood-utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
})
export class LoginComponent implements OnInit, OnDestroy {
  magicLinkloading: boolean;
  userData: any;
  checking = true;
  nodeId: any;
  transactionId: any;
  pageApis: Subscription[];
  errorMessage: string;
  deviceId: string;
  /* istanbul ignore next */
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public authService: AuthService,
    public utilService: UtilService,
    public themeService: ThemeService,
    public storage: StorageService
  ) {
    this.pageApis = [];
  }
  /* istanbul ignore next */
  ngOnInit() {
    this.themeService.setTheme();
    // Fetching parameter from url for magic link validation
    const queryParams = this.route.snapshot.queryParams;
    const {
      token,
      type,
      user: user_id,
      salt,
      transaction_id,
      node_id,
    } = queryParams;
    // Fetching paraams of email notifications
    this.nodeId = node_id || '';
    this.transactionId = transaction_id || '';

    // Checking if the login page has magic link params
    if (token && user_id) {
      this.checking = true;
      this.deviceId = user_id + new Date().valueOf();
      const data = {
        validation_token: token,
        user_id,
        device_id: user_id + Math.random(),
        type,
        salt,
      };
      this.magicLinkLogin(data);
    } else {
      this.checking = false;
      this.errorMessage = 'Invalid request redirecting to login page';
      window.location.href = environment.authUrl;
    }
  }

  // Send login request to server using magic link
  /* istanbul ignore next */
  magicLinkLogin(data: any): void {
    // check if any user is already logged in

    const isLoggedIn = this.storage.retrieveStoredData(
      'isFairfoodUserLoggedin'
    );
    if (isLoggedIn) {
      this.router.navigateByUrl('/');
    } else {
      const api = this.authService.magicLogin(data).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.setUserData(res.data);
          } else {
            this.authError();
          }
        },
        error: () => {
          this.authError();
        },
      });
      this.pageApis.push(api);
    }
  }

  authError(): void {
    this.checking = false;
    this.errorMessage = ERROR_MESSAGE;
    setTimeout(() => {
      window.location.href = environment.authUrl + '/logout';
    }, 2000);
  }

  // Function to store values to localstorage
  /* istanbul ignore next */
  setUserData(val: any): void {
    this.userData = val;

    this.storage.saveInStorage('isFairfoodUserLoggedin', 'true');
    this.storage.saveInStorage('userData', JSON.stringify(val));
    this.storage.saveInStorage('deviceId', this.deviceId);
    // check if route comes from email notification
    if (this.nodeId && this.transactionId) {
      this.manageUser();
    } else {
      if (this.userData.email_verified) {
        this.router.navigateByUrl('/');
      } else {
        this.utilService.customSnackBar(
          'Email not verified. Please contact admin',
          ACTION_TYPE.FAILED
        );
        window.location.href = environment.authUrl;
      }
    }
  }

  manageUser() {
    if (this.nodeId) {
      this.storage.saveInStorage('companyID', this.nodeId);
    }
    if (this.transactionId) {
      this.router.navigate([
        'transaction-report',
        'external',
        this.transactionId,
      ]);
    }
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
  }
}
