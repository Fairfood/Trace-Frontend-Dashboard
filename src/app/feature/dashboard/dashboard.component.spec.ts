import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { DashboardStoreService } from './dashboard-store.service';
import { RouterService, UtilService } from 'src/app/shared/service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventEmitter } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const activatedRouteStub = {
      snapshot: { data: {} },
      paramMap: of(convertToParamMap({})),
    };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientModule, MatSnackBarModule],
      providers: [
        DashboardService,
        DashboardStoreService,
        RouterService,
        UtilService,
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
