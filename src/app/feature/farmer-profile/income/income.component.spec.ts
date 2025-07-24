import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { IncomeComponent } from './income.component';
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { UtilService } from 'src/app/shared/service';
import { EventEmitter } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { IFarmerDetails, IReference } from '../farmer-profile.config';

describe('IncomeComponent', () => {
  let component: IncomeComponent;
  let fixture: ComponentFixture<IncomeComponent>;
  let farmerProfileStoreServiceStub: Partial<FarmerProfileStoreService>;
  let utilServiceMock: Partial<UtilService>;

  beforeEach(async () => {
    utilServiceMock = {
      supplyChainData$: new Subject<string>(),
    };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      // use: () => {},
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    farmerProfileStoreServiceStub = {
      payments$: of({} as IReference),
      farmerDetails$: of({} as IFarmerDetails),
    };

    await TestBed.configureTestingModule({
      imports: [IncomeComponent, TranslateModule.forRoot(), HttpClientModule],
      providers: [
        { provide: UtilService, useValue: utilServiceMock },
        {
          provide: FarmerProfileStoreService,
          useValue: farmerProfileStoreServiceStub,
        },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
