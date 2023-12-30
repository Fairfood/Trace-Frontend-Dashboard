import { environment } from 'src/environments/environment';

export const authGuard = () => {
  if (localStorage.getItem('isFairfoodUserLoggedin')) {
    return isVerified();
  }

  return toLogin();
};

export function isVerified(): boolean {
  const user = JSON.parse(localStorage.getItem('userData'));
  const impersonate = localStorage.getItem('impersonate');
  if (impersonate) {
    return true;
  } else if (user?.email_verified && user?.status > 1) {
    return true;
  } else {
    return toLogin();
  }
}

/* istanbul ignore next */
export function toLogin(): boolean {
  window.location.href = environment.authUrl;
  return false;
}
