/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment';
import { LoaderComponent } from 'fairfood-utils';

@Component({
  selector: 'app-verify',
  template: `<section class="ff-flex-center loader-only">
    <app-loader
      loaderText="loaderText"
      loaderType="type1"
      *ngIf="loading"></app-loader>
  </section>`,
  standalone: true,
  imports: [CommonModule, LoaderComponent],
})
export class VerifyComponent implements OnInit, OnDestroy {
  loading = true;
  loaderText = 'Verifying';
  pageApis: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  /* istanbul ignore next */
  ngOnInit(): void {
    const { token, type, salt } = this.route.snapshot.queryParams;

    if (token && salt) {
      this.verifyToken(token, salt, type || 2);
    } else {
      this.handleError('Invalid link/Link expired');
    }
  }
  /* istanbul ignore next */
  verifyToken(token: string, salt: string, type: number): void {
    const checkVerify$ = this.authService.checkVerify(token, salt, type);
    const validate$ = this.authService.validate(token, salt, type);

    const verifySubscription = checkVerify$
      .pipe(
        switchMap((res: any) => {
          if (res.data.valid) {
            return validate$;
          } else {
            throw new Error('Invalid link');
          }
        })
      )
      .subscribe({
        next: (val: any) => {
          if (val.success) {
            this.loaderText = 'Verification successful';
            this.gotoLogin();
          } else {
            throw new Error('Verification failed');
          }
        },
        error: (error: any) => {
          this.handleError(error.message || 'Verification failed');
        },
      });

    this.pageApis.push(verifySubscription);
  }
  /* istanbul ignore next */
  handleError(message: string): void {
    this.loaderText = message;
    this.gotoLogin();
  }

  gotoLogin(): void {
    timer(2000).subscribe(() => {
      window.location.href = environment.authUrl;
    });
  }
  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
  }
}
