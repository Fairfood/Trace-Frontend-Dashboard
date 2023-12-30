/* istanbul ignore file */

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { environment } from 'src/environments/environment';

import { LoaderComponent } from 'fairfood-utils';
import { LogoutDialogComponent } from '../logout-dialog/logout-dialog.component';

@Component({
  selector: 'app-invite-member',
  templateUrl: './invite-member.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    LoaderComponent,
    LogoutDialogComponent,
  ],
})
export class InviteMemberComponent implements OnInit {
  token: string;
  salt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryParameters: any;
  constructor(
    public route: ActivatedRoute,
    public dialog: MatDialog,
    public router: Router
  ) {}
  /* istanbul ignore next */
  ngOnInit() {
    this.queryParameters = this.route.snapshot.queryParams;

    const { token, salt, email } = this.queryParameters;
    this.token = token;
    this.salt = salt;
    if (token && salt) {
      this.checkLoggedInUser();
    } else {
      this.checkLoggedInUser(email);
    }
  }
  /* istanbul ignore next */
  checkLoggedInUser(email?: string) {
    const { user: userId } = this.queryParameters;
    const user =
      localStorage.getItem('userData') &&
      JSON.parse(localStorage.getItem('userData'));
    if (user?.id) {
      if (userId == user.id) {
        this.router.navigateByUrl('company-profile');
      } else {
        this.logoutPopup(email);
      }
    } else {
      this.navigateToLogin(email);
    }
  }
  /* istanbul ignore next */
  navigateToLogin(email?: string): void {
    if (email) {
      window.location.href = environment.authUrl + '/logout?email=' + email;
    } else {
      const { user: userId } = this.queryParameters;
      this.router.navigateByUrl(
        `/login?user=${userId}&token=${this.token}&salt=${this.salt}&type=${1}`
      );
    }
  }
  /* istanbul ignore next */
  logoutPopup(email?: string) {
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      disableClose: true,
      width: '500px',
      height: '225px',
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        localStorage.clear();
        this.navigateToLogin(email);
      } else {
        this.router.navigateByUrl('company-profile');
      }
    });
  }
}
