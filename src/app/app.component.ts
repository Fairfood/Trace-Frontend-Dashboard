/* istanbul ignore file */
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getCustomCookie } from './shared/configs/app.methods';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  styleUrls: [],
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');

    /**
     * impersonate: From admin inteface an admin user can navigate to trace (Like an impersonation)
     * Data is shared via cookies
     * Admin token data is replaced with existing user data if logged in, otherwise set as userdata along with
     * impersonate: true value in localstorage
     * this will be passed along with all the API calls
     */
    const impersonate = getCustomCookie('userData');
    if (impersonate !== 'no-match') {
      const userData = JSON.parse(impersonate);
      localStorage.removeItem('userData');
      localStorage.removeItem('companyID');
      localStorage.setItem('impersonate', 'true');
      localStorage.setItem('isFairfoodUserLoggedin', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('companyID', userData.nodeId);
      document.cookie.split(';').forEach(function (c) {
        document.cookie =
          c.trim().split('=')[0] +
          '=;' +
          'expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      });
      let domainPath = '';

      if (environment.adminUrl.includes('.org')) {
        domainPath = 'domain=fairfood.org;';
      } else if (environment.adminUrl.includes('localhost')) {
        domainPath = '';
      } else {
        domainPath = 'domain=fairfood.nl;';
      }
      document.cookie = `userData=${'test'};${domainPath}path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    }
  }

  ngOnInit() {
    // method to logout all open tabs automatically when user logs out in one of them
    // if a localstorage item is deleted event.key will be empty
    window.addEventListener('storage', event => {
      if (event.key === 'companyId') {
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      }
      if (event.storageArea === localStorage && event.key === null) {
        const token = localStorage.getItem('isFairfoodUserLoggedin');
        if (!token) {
          // Refresh after 2 second
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        }
      }
    });
  }
}
