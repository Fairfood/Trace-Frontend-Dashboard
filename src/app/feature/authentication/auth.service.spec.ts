import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('AuthService', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [AuthService, { provide: Router, useValue: routerSpyObj }],
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should generate a valid TOTP token', () => {
    const token = authService.generateTotpToken();

    expect(token).toBeTruthy(); // Check if the token is not empty or falsy
    // You can add more specific assertions here if necessary
  });

  it('should send a magic login request with OTP header', () => {
    const dummyParams = { username: 'user', password: 'pass' };
    const dummyResponse = { success: true };
    const otpToken = '123456'; // Replace with an actual OTP token

    spyOn(authService, 'generateTotpToken').and.returnValue(otpToken);

    authService.magicLogin(dummyParams).subscribe(response => {
      expect(response).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/accounts/login/magic/`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('otp')).toBe(otpToken);
    req.flush(dummyResponse);
  });
});
