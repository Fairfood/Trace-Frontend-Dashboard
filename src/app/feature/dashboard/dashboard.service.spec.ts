import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { StorageService, UtilService } from 'src/app/shared/service';
import { DashboardStoreService } from './dashboard-store.service';
import { CompanyProfileService } from '../company-profile/company-profile.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpTestingController: HttpTestingController;
  let httpMock: HttpTestingController;
  let utilSpy: jasmine.SpyObj<UtilService>;
  const mockTranslateService = {
    instant: (key: string) => key,
  };
  const spy = jasmine.createSpyObj('UtilService', ['getTheme', 'theme']);
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule, TranslateModule],
      providers: [
        DashboardService,
        StorageService,
        DashboardStoreService,
        CompanyProfileService,
        { provide: UtilService, useValue: spy },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    service = TestBed.inject(DashboardService);
    httpTestingController = TestBed.inject(HttpTestingController);
    httpMock = TestBed.inject(HttpTestingController);
    utilSpy = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve supply chain data', () => {
    const storageSpy = spyOn(
      TestBed.inject(StorageService),
      'retrieveStoredData'
    ).and.returnValue('supplyChainId');
    expect(service.supplyChainData()).toEqual('supplyChainId');
    expect(storageSpy).toHaveBeenCalledWith('supplyChainId');
  });

  it('should get status', () => {
    spyOn(TestBed.inject(StorageService), 'retrieveStoredData').and.returnValue(
      'supplyChainId'
    );
    service.getStatus('label');
    const req = httpMock.expectOne(
      `${environment.baseUrl}/dashboard/stats/?supply_chain=supplyChainId&labels=label`
    );
    expect(req.request.method).toBe('GET');
    req.flush({ data: { statistics: {}, otherData: {} } });
  });

  it('should get recent transactions', () => {
    spyOn(TestBed.inject(StorageService), 'retrieveStoredData').and.returnValue(
      'supplyChainId'
    );
    service.getRecentTransactions().subscribe();
    const req = httpMock.expectOne(
      `${environment.baseUrl}/transactions/external/?supply_chain=supplyChainId&limit=5`
    );
    expect(req.request.method).toBe('GET');
  });

  it('should get chart theme colors', () => {
    utilSpy.theme = {
      graphColors: ['#ff0000', '#00ff00', '#0000ff'],
    };

    expect(service.getChartTheme()).toEqual(['#ff0000', '#00ff00', '#0000ff']);
  });

  it('should get map theme', () => {
    utilSpy.theme = {
      colour_map_background: '#ffffff',
      colour_map_marker: '#000000',
      colour_map_clustor: '#cccccc',
      colour_map_marker_text: '#ff0000',
    };

    expect(service.getMapTheme()).toEqual({
      colour_map_background: '#ffffff',
      colour_map_marker: '#000000',
      colour_map_clustor: '#cccccc',
      colour_map_marker_text: '#ff0000',
    });
  });

  it('should get primary theme colors', () => {
    utilSpy.theme = {
      colour_primary_alpha: '#ffffff',
      colour_primary_beta: '#000000',
    };

    expect(service.getPrimaryTheme()).toEqual(['#ffffff', '#000000']);
  });
});
