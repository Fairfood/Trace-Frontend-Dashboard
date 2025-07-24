import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateConnectionPopupComponent } from './create-connection-popup.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CreateConnectionPopupService } from './create-connection-popup.service';
import { ConnectionService } from '../connections.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu'; // Make sure to import MatMenuModule if used in the component
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { CONNECTION_TABS, INVITE_ONLY } from './create-connection-popup.config';
import { HttpClientModule } from '@angular/common/http';

describe('CreateConnectionPopupComponent', () => {
  let component: CreateConnectionPopupComponent;
  let fixture: ComponentFixture<CreateConnectionPopupComponent>;
  let mockService: jasmine.SpyObj<CreateConnectionPopupService>;
  let mockConnectionService: jasmine.SpyObj<ConnectionService>;
  let mockGlobalStore: jasmine.SpyObj<GlobalStoreService>;
  let service: CreateConnectionPopupService;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CreateConnectionPopupService', [
      'createCompanyForm',
      'initialButtonState',
      'createInviteForm',
    ]);
    mockConnectionService = jasmine.createSpyObj('ConnectionService', [
      'listOperations',
    ]);
    mockGlobalStore = jasmine.createSpyObj('GlobalStoreService', [
      'countryList$',
      'countryCodeList$',
    ]);
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    mockGlobalStore.countryList$ = of([]);
    mockGlobalStore.countryCodeList$ = of([]);
    await TestBed.configureTestingModule({
      imports: [
        CreateConnectionPopupComponent,
        ReactiveFormsModule,
        MatMenuModule,
        HttpClientModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ConnectionService, useValue: mockConnectionService },
        { provide: GlobalStoreService, useValue: mockGlobalStore },
        { provide: CreateConnectionPopupService, useValue: mockService },
      ],
    }).compileComponents();
    mockConnectionService.listOperations.and.returnValue(of({ results: [] }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateConnectionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data for non-stock invitation', () => {
    component.incomingData = {
      stockInvite: false,
    };
    spyOn(component, 'initSubscriptions');
    component.initDataForStock();
    expect(component.connectionTabs).toEqual(CONNECTION_TABS);
    expect(component.currentStep).toEqual(CONNECTION_TABS[0].id);
    expect(mockService.createCompanyForm).toHaveBeenCalled();
    expect(component.initSubscriptions).toHaveBeenCalled();
  });

  it('should set nextButtonState and loaderText', () => {
    component.incomingData = {
      stockInvite: true,
    };
    component.initDataForStock();
    expect(component.nextButtonState).toEqual(
      mockService.initialButtonState(true)
    );
    expect(component.loaderText).toEqual('Loading data');
  });
});
