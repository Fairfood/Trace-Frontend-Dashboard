/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { CompanyProfileComponent } from './company-profile.component';
import { UtilService, StorageService } from 'src/app/shared/service';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { GlobalStoreService } from 'src/app/shared/store';
import { CompanyProfileService } from './company-profile.service';
import { CompanyProfileStoreService } from './company-profile-store.service';
import { BasicDetailsCompanyComponent } from './basic-details';
import { FairFoodCustomTabComponent, LoaderComponent } from 'fairfood-utils';
import { TeamMembersComponent } from './team-members';
import { SupplyChainsComponent } from './supply-chains';
import { WalletTabComponent } from './wallet-tab';
import { ConnectionLabelComponent } from './connection-label';
import { ActivitiesComponent } from './activities';
import { CompanyClaimsComponent } from './company-claims';
import { ProfileAvatarComponent } from 'src/app/shared/components/profile-avatar';
import { PROFILE_TABS } from './company-profile.config';
import { DocumentsTabComponent } from './documentation';

describe('CompanyProfileComponent', () => {
  let component: CompanyProfileComponent;
  let fixture: ComponentFixture<CompanyProfileComponent>;
  let utilServiceMock: Partial<UtilService>;

  beforeEach(() => {
    utilServiceMock = {
      supplyChainData$: new Subject<string>(),
    };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    TestBed.configureTestingModule({
      imports: [
        CompanyProfileComponent,
        LoaderComponent,
        FairFoodCustomTabComponent,
        BasicDetailsCompanyComponent,
        TeamMembersComponent,
        DocumentsTabComponent,
        SupplyChainsComponent,
        WalletTabComponent,
        ConnectionLabelComponent,
        ActivitiesComponent,
        CompanyClaimsComponent,
        TranslateModule,
        ProfileAvatarComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        { provide: UtilService, useValue: utilServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: GlobalStoreService, useClass: GlobalStoreServiceStub },
        { provide: CompanyProfileService, useClass: CompanyProfileServiceStub },
        {
          provide: CompanyProfileStoreService,
          useClass: CompanyProfileStoreServiceStub,
        },
        { provide: StorageService, useClass: StorageServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyProfileComponent);
    component = fixture.componentInstance;
    component.tabGroup = PROFILE_TABS;
    component.isConnection = false;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component with tabGroup and isConnection', () => {
    expect(component.tabGroup).toBeDefined();
    expect(component.isConnection).toBeDefined();
  });

  it('should initialize component and call initSubscription', () => {
    spyOn(component, 'initSubscription').and.callThrough();
    component.ngOnInit();
    expect(component.initSubscription).toHaveBeenCalled();
  });

  it('should set company data', () => {
    const fakeProfileData = {
      image: 'mock_image_url',
      name: 'Mock Company Name',
      is_admin: true,
      country: 'mock_country_id',
    };
    component.companyProfileData = fakeProfileData;
    component.setCompanyData();
    expect(component.companyPic).toEqual(fakeProfileData.image);
    expect(component.companyProfileData.icon).toEqual('MC');
    expect(component.isCompanyAdmin).toBeTruthy();
    expect(component.dataLoaded).toBeTruthy();
  });

  it('should open image upload', () => {
    const mockData = { type: 'upload', formData: {}, image: 'mock_image_url' };
    component.openImageUpload(mockData);
    expect(component.companyPic).toEqual(mockData.image);
  });

  it('should change active tab', () => {
    const mockTab = { id: 'test_tab', name: 'Testbed' };
    component.changeTab(mockTab);
    expect(component.activeTabId).toEqual(mockTab.id);
  });

  it('should toggle edit mode', () => {
    component.toggleEdit(true);
    expect(component.isEdit).toBeTruthy();
    component.toggleEdit(false);
    expect(component.isEdit).toBeFalsy();
  });
});

class ActivatedRouteStub {
  private paramMapSubject = new Subject();
  readonly paramMap = this.paramMapSubject.asObservable();
  setParamMap(params: any) {
    this.paramMapSubject.next(params);
  }
}

class GlobalStoreServiceStub {
  userData$ = new BehaviorSubject<any>(null);
  countryList$ = new BehaviorSubject<any>(null);
}

class CompanyProfileServiceStub {
  fetchCompanyProfileDetails(companyId: string) {
    console.log('hi');
  }

  basicDetailsForm() {
    return {};
  }
}

class CompanyProfileStoreServiceStub {
  profileData$ = new BehaviorSubject<any>({
    image: '',
    name: 'Test company',
    is_admin: false,
  });
}

class StorageServiceStub {
  retrieveStoredData(key: string): any {
    console.log('hi');
  }
  saveInStorage(key: string, value: any) {
    console.log('hi');
  }
}
