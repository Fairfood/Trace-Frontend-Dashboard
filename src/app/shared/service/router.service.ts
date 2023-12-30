/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  routeChangeSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );

  constructor(public router: Router, public route: ActivatedRoute) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.routeChangeSubject$.next(event.url);
      }
    });
  }

  /**
   * This method determines whether the header component should be hidden based on a given URL.
   * It checks if the URL matches any of the target URLs and returns true if there's a match,
   *  indicating that the header should be hidden. Otherwise, it returns false to show the header.
   * @param url string
   * @returns boolean
   */
  hideHeaderUrls(url: string): boolean {
    const targetUrls = [
      'connections/profile',
      '/company-profile',
      '/requests',
      '/farmer-profile',
      '/transaction-report',
      '/template-upload',
      '/connections/new-farmer',
      '/connections/new-company',
      '/claims/details',
    ];
    let found = false;
    targetUrls.forEach(a => {
      if (url.includes(a)) {
        found = true;
      }
    });
    return found;
  }

  isHomePage(url: string): boolean {
    return url === '/dashboard';
  }

  navigateUrl(url: string): void {
    this.router.navigateByUrl(url);
  }

  navigateArray(url: any[]): void {
    this.router.navigate(url);
  }
}
