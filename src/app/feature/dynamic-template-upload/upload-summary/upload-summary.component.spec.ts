import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadSummaryComponent } from './upload-summary.component';
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import { BehaviorSubject, of, throwError } from 'rxjs';

describe('UploadSummaryComponent', () => {
  let component: UploadSummaryComponent;
  let fixture: ComponentFixture<UploadSummaryComponent>;
  let dynamicTemplateUploadServiceSpy: jasmine.SpyObj<DynamicTemplateUploadService>;
  let dynamicTemplateStoreSpy: jasmine.SpyObj<DynamicTemplateStore>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('DynamicTemplateUploadService', [
      'getSummaryOfUpload',
      'confirmTransaction',
      'navigateToConnections',
      'navigateToStock',
      'showSuccess',
      'showError',
    ]);
    const storeSpy = jasmine.createSpyObj('DynamicTemplateStore', [
      'getCurrentTemplateType',
      'uploadFileData$', // Observable
      'updateStateProp',
    ]);
    storeSpy.getCurrentTemplateType.and.returnValue(1); // Assuming template type is TRANSACTION
    const uploadFileData$ = new BehaviorSubject<any>(null);
    storeSpy.uploadFileData$ = uploadFileData$.asObservable();
    TestBed.configureTestingModule({
      imports: [UploadSummaryComponent],
      providers: [
        { provide: DynamicTemplateUploadService, useValue: serviceSpy },
        { provide: DynamicTemplateStore, useValue: storeSpy },
      ],
    }).compileComponents();
    dynamicTemplateUploadServiceSpy = TestBed.inject(
      DynamicTemplateUploadService
    ) as jasmine.SpyObj<DynamicTemplateUploadService>;
    dynamicTemplateStoreSpy = TestBed.inject(
      DynamicTemplateStore
    ) as jasmine.SpyObj<DynamicTemplateStore>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch summary data when uploadFileData$ emits', () => {
      spyOn(component, 'getSummary');
      const testData = {
        id: '123',
        latest_upload: { id: '456' },
      };
      dynamicTemplateStoreSpy.getCurrentTemplateType.and.returnValue(1); // Assuming template type is TRANSACTION

      // Mock the uploadFileData$ observable
      const uploadFileDataSubject = new BehaviorSubject<any>(testData);
      dynamicTemplateStoreSpy.uploadFileData$ =
        uploadFileDataSubject.asObservable();

      component.ngOnInit();

      expect(component.getSummary).toHaveBeenCalled();
      expect(component.templateId).toBe('456');
    });
  });

  describe('getSummary', () => {
    it('should fetch summary data and update component properties: transaction', () => {
      component.templateId = '1234';
      const mockResponse = {
        summary: {
          total_quantity: 100,
          total_price: 1000,
        },
        product_details: {
          name: 'Mock Product Name',
          id: '1234',
        },
        currency: 'USD',
      };

      dynamicTemplateStoreSpy.getCurrentTemplateType.and.returnValue(1); // Assuming template type is TRANSACTION

      dynamicTemplateUploadServiceSpy.getSummaryOfUpload.and.returnValue(
        of(mockResponse)
      );

      // Call the method
      component.getSummary();

      // Expect the service method to have been called with the correct templateId
      expect(
        dynamicTemplateUploadServiceSpy.getSummaryOfUpload
      ).toHaveBeenCalledWith(component.templateId);
      expect(component.loading).toBeFalse();

      expect(component.summaryData).toEqual({
        total_quantity: 100,
        total_price: 1000,
        currency: 'USD',
        productName: 'Mock Product Name',
      });
    });

    it('should fetch summary data and update component properties: connection', () => {
      component.templateId = '1234';
      const mockResponse = {
        summary: {
          farmers_to_add: 10,
        },
      };

      dynamicTemplateStoreSpy.getCurrentTemplateType.and.returnValue(2); // Assuming template type is Connection

      dynamicTemplateUploadServiceSpy.getSummaryOfUpload.and.returnValue(
        of(mockResponse)
      );

      // Call the method
      component.getSummary();

      // Expect the service method to have been called with the correct templateId
      expect(
        dynamicTemplateUploadServiceSpy.getSummaryOfUpload
      ).toHaveBeenCalledWith(component.templateId);
      expect(component.loading).toBeFalse();

      expect(component.summaryData).toEqual({
        farmers_to_add: 10,
        productName: undefined,
        currency: undefined,
      });
    });
  });

  describe('buttonAction', () => {
    it('should call confirmTransaction and navigate to connections for CONNECTION template type', () => {
      component.templateId = '1234';
      component.templateType = 2;
      dynamicTemplateUploadServiceSpy.confirmTransaction.and.returnValue(
        of({
          succcess: true,
        })
      );

      component.buttonAction('next');

      expect(component.loaderText).toBe('Creating connections. Please wait');
      expect(
        dynamicTemplateUploadServiceSpy.confirmTransaction
      ).toHaveBeenCalledOnceWith(component.templateId);
      expect(
        dynamicTemplateUploadServiceSpy.navigateToConnections
      ).toHaveBeenCalled();
    });

    it('should call confirmTransaction and navigate to stock for TRANSACTION template type', () => {
      component.templateId = '1234';
      component.templateType = 1;
      dynamicTemplateUploadServiceSpy.confirmTransaction.and.returnValue(
        of({
          succcess: true,
        })
      );

      component.buttonAction('next');

      expect(
        dynamicTemplateUploadServiceSpy.confirmTransaction
      ).toHaveBeenCalledOnceWith(component.templateId);
      expect(
        dynamicTemplateUploadServiceSpy.navigateToStock
      ).toHaveBeenCalled();
      expect(dynamicTemplateUploadServiceSpy.showError).not.toHaveBeenCalled();
    });

    it('should handle error and navigate to stock for TRANSACTION template type', () => {
      dynamicTemplateStoreSpy.getCurrentTemplateType.and.returnValue(1); // Assuming template type is TRANSACTION
      dynamicTemplateUploadServiceSpy.confirmTransaction.and.returnValue(
        throwError(() => 'error')
      );

      component.buttonAction('next');

      expect(
        dynamicTemplateUploadServiceSpy.confirmTransaction
      ).toHaveBeenCalledOnceWith(component.templateId);
      expect(
        dynamicTemplateUploadServiceSpy.showError
      ).toHaveBeenCalledOnceWith(
        'Transactions creation failed. Please try again later!'
      );
      expect(
        dynamicTemplateUploadServiceSpy.navigateToStock
      ).toHaveBeenCalled();
    });

    it('should handle button action prev', () => {
      component.buttonAction('prev');
      expect(dynamicTemplateStoreSpy.updateStateProp).toHaveBeenCalledWith(
        'currentStep',
        'verification'
      );
    });
  });

  afterEach(() => {
    fixture.destroy();
  });
});
