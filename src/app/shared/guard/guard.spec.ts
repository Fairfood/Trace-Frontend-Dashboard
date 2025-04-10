/* eslint-disable @typescript-eslint/no-explicit-any */
import { isVerified } from './auth.guard';

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
