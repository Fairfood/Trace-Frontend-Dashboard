/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';
import { AuthService } from '../auth.service';

import { LogoutDialogComponent } from '../logout-dialog/logout-dialog.component';
import { LoaderComponent } from 'fairfood-utils';

@Component({
  selector: 'app-email-notifications',
  templateUrl: './email-notifications.component.html',
  standalone: true,
  imports: [
    CommonModule,
    LogoutDialogComponent,
    LoaderComponent,
    MatDialogModule,
  ],
})
export class EmailNotificationsComponent implements OnInit, OnDestroy {
  notificationObject: any;
  loading = true;
  queryParams: any;
  sub: Subscription;

  constructor(
    public rotes: ActivatedRoute,
    public router: Router,
    public authService: AuthService,
    public dialog: MatDialog
  ) {}

  /* istanbul ignore next */
  ngOnInit() {
    const params = this.rotes.snapshot.queryParams;
    const { user, notification, supply_chain, token, salt } = params;
    this.queryParams = { notification, user };
    if (token && salt) {
      this.nodeInviteRedirect();
    } else {
      const schainId = supply_chain;

      if (schainId) {
        localStorage.setItem('active-supply-chain-added', 'true');
      }
      this.isLoggedIn();
    }
  }
  /* istanbul ignore next */
  isLoggedIn() {
    const isUserLogedIn = localStorage.getItem('isFairfoodUserLoggedin');
    const user = JSON.parse(localStorage.getItem('userData'));
    if (isUserLogedIn && user) {
      // check if same user is loggedin
      if (user.id === this.queryParams.user) {
        // same user :)
        this.getNotificationObject();
      } else {
        this.logoutPopup();
      }
    } else {
      // no user logged in
      window.location.href = environment.authUrl;
    }
  }

  /* istanbul ignore next */
  getNotificationObject(): void {
    if (this.queryParams.notification && this.queryParams.user) {
      this.sub = this.authService
        .getNotificationParams(this.queryParams.notification)
        .subscribe(
          (response: any) => {
            const data = response.data;
            data.user_id = this.queryParams.user;
            this.queryParams.node_id = data.target_node;
            localStorage.setItem('notificationObject', JSON.stringify(data));
            this.router.navigateByUrl('/home');
          },
          () => {
            window.location.href = environment.authUrl;
          }
        );
    } else {
      window.location.href = environment.authUrl;
    }
  }

  /* istanbul ignore next */
  logoutPopup() {
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      disableClose: true,
      width: '500px',
      height: '225px',
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // logout & redirect to login page
        this.authService.logout();
      } else {
        this.router.navigateByUrl('/home');
      }
    });
  }

  /* istanbul ignore next */
  nodeInviteRedirect(): void {
    const params = this.rotes.snapshot.queryParams;
    window.location.href = `${environment.authUrl}/accept-node-invite?token=${params.token}&salt=${params.salt}&user=${params.user}&email=${params.email}`;
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
