/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminGuard, authGuard } from './';
import { isVerified } from './auth.guard';

describe('adminGuard', () => {
  beforeEach(() => {
    const store: any = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
    };
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
  });

  it('should return true when local user data has email_verified', () => {
    localStorage.setItem('userData', JSON.stringify({ email_verified: true }));
    expect(adminGuard()).toBe(true);
  });

  it('should return false when local user data has email_verified undefined', () => {
    localStorage.setItem('userData', JSON.stringify({ user: false }));
    expect(adminGuard()).toBe(false);
  });

  it('should return false when local user data has no email verified', () => {
    localStorage.setItem('userData', JSON.stringify({ email_verified: false }));
    expect(adminGuard()).toBe(false);
  });
});

describe('authGuard', () => {
  beforeEach(() => {
    const store: any = {};
    const mockLocalStorage = {
      getItem: (key: string): string => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
    };
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
  });

  it('should return true when user is logged in', () => {
    localStorage.setItem('isFairfoodUserLoggedin', 'true');
    localStorage.setItem(
      'userData',
      JSON.stringify({ email_verified: true, status: 2 })
    );
    expect(authGuard()).toBe(true);
  });

  it('isVerified()  should return true when impersonate is set in localstorage', () => {
    localStorage.setItem('impersonate', 'true');
    expect(isVerified()).toBe(true);
  });

  it('isVerified() should return true when impersonate and userdata is verified', () => {
    localStorage.setItem('impersonate', 'true');

    localStorage.setItem(
      'userData',
      JSON.stringify({ email_verified: true, status: 2 })
    );

    expect(isVerified()).toBe(true);
  });
});
