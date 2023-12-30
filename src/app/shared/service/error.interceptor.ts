/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/feature/authentication';
import { SnackBarComponent } from '../components/snack-bar';
import { environment } from 'src/environments/environment';
/**
 * Service responsible for intercepting HTTP requests and handling errors globally.
 */
@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
  /**
   * Initializes the ErrorInterceptorService with required services.
   * @param router - Angular router service.
   * @param authService - Authentication service.
   * @param snackBar - Angular Material Snackbar service.
   */
  constructor(
    public router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Intercepts HTTP requests and handles errors globally.
   * @param req - HTTP request to intercept.
   * @param next - HTTP handler for the intercepted request.
   * @returns An observable of the HTTP event or an error.
   */
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(globalError => {
        if (!window.navigator.onLine) {
          this.noInternetSnackBar();
        }
        if ([401].indexOf(globalError.status) !== -1) {
          const impersonate = localStorage.getItem('impersonate');
          if (impersonate) {
            localStorage.clear();
            window.location.href =
              environment.adminUrl + '?isClearStorage=true';
          } else {
            this.authService.clearLocalStorage();
          }
        }
        return throwError(() => globalError.error);
      })
    );
  }

  /**
   * Displays a snackbar for network error.
   */
  noInternetSnackBar() {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: {
        message: 'Network Error! Check your Internet Connection',
        icon: 'Error',
      },
      panelClass: 'snackbar-color',
      duration: 3000,
    });
  }

  /**
   * Displays a snackbar for unauthorized access.
   */
  noAccessSnackBar() {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: {
        message: 'User role was updated, Redirecting to home page.',
        icon: 'Error',
      },
      panelClass: 'snackbar-color',
      duration: 3000,
    });
  }
}
