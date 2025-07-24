import { TestBed } from '@angular/core/testing';
import { HeaderService } from './header.service';
import { StorageService, ThemeService } from 'src/app/shared/service';
import { AuthService } from '../../authentication/auth.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('HeaderService', () => {
  let service: HeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, HttpClientModule, TranslateModule.forRoot()],
      providers: [
        HeaderService,
        StorageService,
        ThemeService,
        AuthService,
        TranslateService,
      ],
    });
    service = TestBed.inject(HeaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
