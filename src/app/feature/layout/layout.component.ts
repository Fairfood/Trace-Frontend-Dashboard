/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
// components
import { HeaderComponent } from './header';
import { SidebarComponent } from './sidebar';
import { LoaderComponent } from 'fairfood-utils';
// services
import { AuthService } from '../authentication';
import { IdTokenRequest } from 'src/app/shared/configs/app.model';
import { StorageService } from 'src/app/shared/service';

/**
 * Component representing the main layout of the application.
 */
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    HeaderComponent,
    SidebarComponent,
    LoaderComponent,
    TranslateModule,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy {
  collapsedSideBar: boolean;
  viewingAsAdmin: boolean;
  companyName: string;
  loader = true;
  canLoadHeader = false;
  sub: Subscription[] = [];

  private readonly storageService = inject(StorageService);
  private readonly location = inject(Location);

  constructor(private auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit() {
    // new workflow
    /**
     * Checking if code exists in the query params.
     * If it exists, it means the user is trying to login.
     * If it doesn't exist, it means the user is already logged in.
     */
    const code = this.route.snapshot.queryParamMap.get('code');
    const loggedIn = localStorage.getItem('isFairfoodUserLoggedin');

    if (code && !loggedIn) {
      const reqObject: IdTokenRequest = {
        code,
        grant_type: 'authorization_code',
        redirect_uri: window.location.origin + '/',
        client_id: environment.clientId,
        client_secret: environment.clientSecret,
      };
      const api = this.auth.getIdToken(reqObject).subscribe(res => {
        const { access_token, id_token, refresh_token } = res;
        this.auth.setUserData({ access_token, id_token, refresh_token });
        this.getUserDetails();
      });
      this.sub.push(api);
    } else {
      if (!localStorage.getItem('isFairfoodUserLoggedin')) {
        window.location.href = environment.authenticateUrl;
      }
      this.checkForImpersonate();
    }
  }

  checkForImpersonate(): void {
    const impersonate = localStorage.getItem('impersonate');
    this.viewingAsAdmin = impersonate === 'true';
    if (this.viewingAsAdmin) {
      this.auth.setCookie();
      const userData = JSON.parse(localStorage.getItem('userData'));
      this.storageService.saveInStorage('userId', userData.id);
      this.companyName = userData.name;
    }

    this.canLoadHeader = true;
  }

  getUserDetails(): void {
    const api = this.auth.fetchSsoUserDetails().subscribe({
      next: (response: any) => {
        this.storageService.saveInStorage('userData', JSON.stringify(response));
        this.storageService.saveInStorage('userId', response.id);
        // change url without reloading
        this.location.go('/dashboard');
        this.checkForImpersonate();
      },
      error: (err: any) => {
        console.log(err);
        // window.location.href = environment.authUrl + '/auth-error?type=2';
      },
    });
    this.sub.push(api);
  }

  /**
   * Event handler for receiving collapsed sidebar status.
   * @param $event - Event data indicating whether the sidebar is collapsed or not.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receiveCollapsed($event: any) {
    this.collapsedSideBar = $event;
  }

  /**
   * Handles the loading status changes.
   * @param status - The loading status ('started' or 'completed').
   */
  loadingStatus(status: string): void {
    if (status === 'started') {
      this.loader = true;
    } else {
      this.loader = false;
    }
  }

  /**
   * Navigates back to the admin view, clearing the local storage.
   */
  backtoAdmin(): void {
    localStorage.clear();
    window.location.href = environment.adminUrl + '?isClearStorage=true';
  }

  ngOnDestroy() {
    this.sub.forEach(sub => sub.unsubscribe());
  }
}
