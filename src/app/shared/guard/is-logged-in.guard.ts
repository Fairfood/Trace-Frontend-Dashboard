/* istanbul ignore file */
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';

export const loggedInGuard = () => {
  const next = inject(ActivatedRouteSnapshot);
  if (localStorage.getItem('isFairfoodUserLoggedin')) {
    // //console.log('is verified ', this.isVerified());
    const params = next.queryParams;
    // check if it's a magic link
    if (params.token && params.salt && params.user) {
      return true;
    } else {
      return isVerified();
    }
  } else {
    return true;
  }
};
function isVerified() {
  const router = inject(Router);
  const user = JSON.parse(localStorage.getItem('userData'));
  if (user.email_verified) {
    if (user.status > 1) {
      router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
}
