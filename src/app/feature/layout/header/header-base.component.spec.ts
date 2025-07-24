import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { HeaderBaseComponent } from './header-base.component';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ISupplyChain, IUserData } from 'src/app/shared/configs/app.model';

const userData: IUserData = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: '',
  phone: {
    dial_code: '+91',
    phone: '1234567890',
  },
  dob: '',
  address: '',
  default_node: '1',
  email_verified: true,
  privacy_accepted: true,
  terms_accepted: true,
  image: '',
  nodes: [
    {
      id: '1',
      name: 'name',
      brandLogo: 'brandLogo',
    },
  ],
};

describe('HeaderBaseComponent', () => {
  let component: HeaderBaseComponent;
  let fixture: ComponentFixture<HeaderBaseComponent>;
  let utilSpy: jasmine.SpyObj<UtilService>;
  let globalStoreSpy: jasmine.SpyObj<GlobalStoreService>;
  let storageSpy: jasmine.SpyObj<StorageService>;

  const activatedRouteStub = { snapshot: { params: { id: 'some_id' } } };
  const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);

  beforeEach(() => {
    utilSpy = jasmine.createSpyObj('UtilService', [
      'loadGoogleMaps',
      'loadAppConstants',
      'isToggled',
      'toggleSidebar',
      'searchProduct',
      'getCompany',
      'searchConnectedCompany',
      'updateUser',
    ]);

    utilSpy.searchProduct.and.returnValue(
      of({
        count: 0,
        results: [],
      })
    );

    utilSpy.getCompany.and.returnValue(
      of({
        count: 0,
        results: [],
      })
    );

    utilSpy.searchConnectedCompany.and.returnValue(
      of({
        count: 0,
        results: [],
      })
    );

    utilSpy.updateUser.and.returnValue(of({}));

    globalStoreSpy = jasmine.createSpyObj('GlobalStoreService', [
      'userData$',
      'initSupplychainData',
    ]);

    globalStoreSpy.userData$ = of(null);

    storageSpy = jasmine.createSpyObj('StorageService', [
      'retrieveStoredData',
      'saveInStorage',
    ]);

    storageSpy.retrieveStoredData.and.callFake((key: string) => {
      if (key === 'supplyChainName') return 'Test Chain';
      if (key === 'supplyChainId') return '1';
      return null;
    });

    TestBed.configureTestingModule({
      imports: [HeaderBaseComponent, MatSnackBarModule, HttpClientModule],
      providers: [
        {
          provide: UtilService,
          useValue: utilSpy,
        },
        {
          provide: GlobalStoreService,
          useValue: globalStoreSpy,
        },
        {
          provide: StorageService,
          useValue: storageSpy,
        },
        RouterService,
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderBaseComponent);
    component = fixture.componentInstance;
    utilSpy = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call init functions', () => {
    component.initSubscription();

    expect(utilSpy.loadAppConstants).toHaveBeenCalled();
  });

  it('should call init functions', () => {
    component.initBackgroundCalls();

    expect(utilSpy.searchProduct).toHaveBeenCalled();
    expect(utilSpy.getCompany).toHaveBeenCalled();
    expect(utilSpy.searchConnectedCompany).toHaveBeenCalled();
  });

  it('setNodeIdVariable', () => {
    component.nodeDetails = {
      id: '',
      name: '',
      brandLogo: '',
    };
    component.setNodeIdVariable('some_id');

    expect(component.nodeDetails.id).toBe('some_id');
  });

  it('should call initBackgroundCalls after 2000ms', fakeAsync(() => {
    spyOn(component, 'initBackgroundCalls');
    spyOn(component, 'selectSupplyChain');

    component.supplyChainList = [
      {
        id: '1',
        name: 'name',
        description: 'description',
        image: '',
      },
      {
        id: '2',
        name: 'name',
        description: 'description',
        image: '',
      },
    ];

    component.initSubscription();
    jasmine.clock().install();
    jasmine.clock().tick(2000);

    setTimeout(() => {
      expect(component.initBackgroundCalls).toHaveBeenCalled();
    });

    // Fast-forward time by ticking the clock
    jasmine.clock().uninstall();

    expect(component.userData).toBe(null);

    expect(component.filteredSupplyChain).toEqual(
      component.supplyChainList.map(({ id, name }) => ({ id, name }))
    );
    expect(component.selectSupplyChain).toHaveBeenCalled();
  }));

  describe('createFilteredSupplyChain', () => {
    it('should return filtered supply chain', () => {
      // arrange
      const mock: ISupplyChain[] = [
        {
          id: '1',
          name: 'name',
          description: 'description',
          image: '',
        },
        {
          id: '2',
          name: 'name',
          description: 'description',
          image: '',
        },
      ];
      component.isHomePage = true;

      const results = component.createFilteredSupplyChain(mock);

      expect(results.length).toBe(3);
      expect(results[0].id).toBe('All');
    });

    it('should return filtered supply chain', () => {
      // arrange
      const mock: ISupplyChain[] = [
        {
          id: '1',
          name: 'name',
          description: 'description',
          image: '',
        },
        {
          id: '2',
          name: 'name',
          description: 'description',
          image: '',
        },
      ];
      component.isHomePage = false;

      const results = component.createFilteredSupplyChain(mock);

      expect(results.length).toBe(2);
      expect(results).toEqual(mock.map(({ id, name }) => ({ id, name })));
      expect(results[0].id).toBe('1');
    });
  });

  it('should setCurrentCompany', () => {
    component.userData = userData;
    component.setCurrentCompany(0);

    expect(component.nodeDetails.name).toBe('name');
    expect(storageSpy.saveInStorage).toHaveBeenCalledWith(
      'companyName',
      'name'
    );
  });

  it('should setBrandLogo', () => {
    component.userData = userData;
    component.setBrandLogo(userData.nodes[0]);

    expect(component.nodeDetails.brandLogo).toBe('');
  });

  it('should setActiveNode and call api', () => {
    component.userData = userData;
    spyOn(component, 'gotoHome');
    component.setActiveNode('1');

    expect(utilSpy.updateUser).toHaveBeenCalled();
    expect(component.gotoHome).toHaveBeenCalled();
  });

  it('should storeSupplyChainDetails', () => {
    component.storeSupplyChainDetails({
      id: '1',
      name: 'name',
    });

    expect(storageSpy.saveInStorage).toHaveBeenCalledWith('supplyChainId', '1');
    expect(storageSpy.saveInStorage).toHaveBeenCalledWith(
      'supplyChainName',
      'name'
    );
  });

  describe('selectSupplyChain', () => {
    it('handle changes for different data', () => {
      const mockSupplyChain: ISupplyChain[] = [
        { id: '1', name: 'Test Chain', description: '', image: '' },
        { id: '2', name: 'name2', description: '', image: '' },
      ];

      const result = component.selectSupplyChain(mockSupplyChain);
      expect(result).toEqual({
        id: '1',
        name: 'Test Chain',
      });
    });

    it('handle changes for different data', () => {
      const mockSupplyChain: ISupplyChain[] = [
        { id: '1', name: 'Test Chain', description: '', image: '' },
        { id: '2', name: 'name2', description: '', image: '' },
      ];

      storageSpy.retrieveStoredData.and.callFake((key: string) => {
        if (key === 'supplyChainName') return '';
        if (key === 'supplyChainId') return '';
        return null;
      });

      const result = component.selectSupplyChain(mockSupplyChain);
      expect(result).toEqual({
        id: '1',
        name: 'Test Chain',
      });
    });
  });
});
