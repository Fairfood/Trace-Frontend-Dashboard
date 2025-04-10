import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletTabComponent } from './wallet-tab.component';
import { CompanyProfileService } from '../company-profile.service';
import { Observable, of } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';

describe('WalletTabComponent', () => {
  let component: WalletTabComponent;
  let fixture: ComponentFixture<WalletTabComponent>;

  beforeEach(async () => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      imports: [WalletTabComponent],
      providers: [
        { provide: CompanyProfileService, useClass: CompanyProfileServiceStub },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

class CompanyProfileServiceStub {
  getWallets(): Observable<any> {
    return of({ count: 0, results: [] });
  }
}
