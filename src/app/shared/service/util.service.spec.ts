import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { UtilService } from './util.service';
import { GlobalStoreService } from '../store/global-store.service';
import { StorageService } from './storage.service';
import { environment } from 'src/environments/environment';

describe('UtilService', () => {
  let service: UtilService;
  let httpTestingController: HttpTestingController;

  const mockSnackBar = {
    openFromComponent: jasmine.createSpy('openFromComponent'),
  };

  const mockGlobalStoreService = {
    updateConstant: jasmine.createSpy('updateConstant'),
    initCountryData: jasmine.createSpy('initCountryData'),
    initProductData: jasmine.createSpy('initProductData'),
    updateLatestConnections: jasmine.createSpy('updateLatestConnections'),
    setConnectedCompanies: jasmine.createSpy('setConnectedCompanies'),
  };

  const mockStorageService = {
    retrieveStoredData: jasmine
      .createSpy('retrieveStoredData')
      .and.returnValue('mockSupplyChainId'),
  };

  const mockTranslateService = {
    instant: (key: string) => key,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        UtilService,
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: GlobalStoreService, useValue: mockGlobalStoreService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });

    service = TestBed.inject(UtilService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should display a success snack bar', () => {
    service.customSnackBar('Success Message', 'success');
    expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
      jasmine.any(Function),
      {
        data: { message: 'Success Message', icon: 'success' },
        duration: 3000,
      }
    );
  });

  it('should display an error snack bar', () => {
    service.customSnackBar('Error Message', 'error');
    expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
      jasmine.any(Function),
      {
        data: { message: 'Error Message', icon: 'error' },
        duration: 3000,
      }
    );
  });

  it('should display a delete snack bar', () => {
    service.customSnackBar('Delete Message', 'delete');
    expect(mockSnackBar.openFromComponent).toHaveBeenCalledWith(
      jasmine.any(Function),
      {
        data: { message: 'Delete Message', icon: 'delete' },
        duration: 3000,
      }
    );
  });

  it('should toggle the sidebar', () => {
    const body = document.querySelector('body');
    spyOn(body.classList, 'toggle');
    service.toggleSidebar();
    expect(body.classList.toggle).toHaveBeenCalledWith('push-right');
  });

  it('should check if the sidebar is toggled', () => {
    const body = document.createElement('body');
    spyOn(document, 'querySelector').and.returnValue(body);
    body.classList.add('push-right');
    expect(service.isToggled()).toBe(true);
  });

  it('should get user details', () => {
    const mockUserId = 'mockUserId';
    service.getUserDetails(mockUserId).subscribe();
    const req = httpTestingController.expectOne(
      `${environment.baseUrl}/accounts/user/${mockUserId}/`
    );
    expect(req.request.method).toEqual('GET');
    req.flush({});
  });

  it('should update user', () => {
    const mockParams = { key: 'value' };
    service.updateUser(mockParams).subscribe();
    const req = httpTestingController.expectOne(
      `${environment.baseUrl}/accounts/user/`
    );
    expect(req.request.method).toEqual('PATCH');
    req.flush({});
  });

  // Add more tests for other methods as needed
});
