import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationHomeComponent } from './notification-home.component';
import { NotificationService } from '../notification.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { UtilService } from 'src/app/shared/service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { IUserData } from 'src/app/shared/configs/app.model';

describe('NotificationHomeComponent', () => {
  let component: NotificationHomeComponent;
  let fixture: ComponentFixture<NotificationHomeComponent>;
  let utilServiceMock: Partial<UtilService>;
  let userDataSubject: BehaviorSubject<Partial<IUserData> | null>;

  beforeEach(async () => {
    userDataSubject = new BehaviorSubject<Partial<IUserData> | null>(null);
    const globalStoreServiceMock = {
      userData$: userDataSubject.asObservable(),
    };
    const activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({ id: '123' }),
      },
    };

    utilServiceMock = {
      supplyChainData$: new Subject<string>(),
      customSnackBar() {
        console.log('hi');
      },
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
      imports: [NotificationHomeComponent, HttpClientModule],
      providers: [
        NotificationService,
        GlobalStoreService,
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: TranslateService, useValue: translateServiceMock },
        // { provide: GlobalStoreService, useClass: GlobalStoreServiceStub },
        { provide: UtilService, useValue: utilServiceMock },
        { provide: GlobalStoreService, useValue: globalStoreServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load notifications if userData is available', () => {
    const userData: Partial<IUserData> = {
      nodes: [
        { id: '1', name: 'Node 1' },
        { id: '2', name: 'Node 2' },
      ],
    };
    userDataSubject.next(userData);
    component.ngOnInit();
    expect(component.nodes.length).toBe(2);
  });
});
