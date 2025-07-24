import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/shared/service';
import { NewConnectionFarmerService } from '../../connections/new-connection-farmer';
import { StockProcessService } from './stock-process.service';
import { StepValues, StockButtonState } from './process-stock.config';
import { of } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

describe('StockProcessService', () => {
  let service: StockProcessService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStorageService: jasmine.SpyObj<StorageService>;
  let mockFarmerService: jasmine.SpyObj<NewConnectionFarmerService>;
  let mockFormBuilder: jasmine.SpyObj<FormBuilder>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl', 'url']);
    mockStorageService = jasmine.createSpyObj('StorageService', [
      'retrieveStoredData',
    ]);
    mockFarmerService = jasmine.createSpyObj('NewConnectionFarmerService', [
      'connectionInfo$',
    ]);
    mockFormBuilder = jasmine.createSpyObj('FormBuilder', ['group']);

    activatedRouteStub = {
      params: of({}),
      queryParams: of({}),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSnackBarModule, HttpClientModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useValue: mockStorageService },
        { provide: NewConnectionFarmerService, useValue: mockFarmerService },
        { provide: FormBuilder, useValue: mockFormBuilder },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        {
          provide: TranslateService,
          useValue: jasmine.createSpyObj('TranslateService', ['instant']),
        },
      ],
    });
    service = TestBed.inject(StockProcessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update listing info', () => {
    const newData = { key: 'value' };
    service.updateListingInfo(newData);

    expect(service.getListingInfo()).toEqual(newData);
  });

  it('should update summary data', () => {
    const newData = { key: 'value' };
    service.updateSummaryData(newData);

    expect(service.getSummaryData()).toEqual(newData);
  });

  it('should reset transactionState to null', () => {
    // Arrange
    service.transactionState = { someData: 'example' };

    // Act
    service.stockStateReset();

    // Assert
    expect(service.transactionState).toBeNull();
  });

  it('should reset claimState to an empty state', () => {
    // Arrange
    service.claimState = {
      claimsList: [{ claimData: 'example' }],
      companies: [{ companyData: 'example' }],
    };

    // Act
    service.claimStateReset();

    // Assert
    expect(service.claimState).toEqual({
      claimsList: [],
      companies: [],
    });
  });

  it('should return false for an existing product name in the products array', () => {
    // Arrange
    const productName = 'ExistingProduct';
    const products = [{ name: 'ExistingProduct' }, { name: 'AnotherProduct' }];

    // Act
    const result = service.productNameValidation(productName, products);

    // Assert
    expect(result).toBeFalse();
  });

  it('should return true for a new product name not in the products array', () => {
    // Arrange
    const productName = 'NewProduct';
    const products = [{ name: 'ExistingProduct' }, { name: 'AnotherProduct' }];

    // Act
    const result = service.productNameValidation(productName, products);

    // Assert
    expect(result).toBeTrue();
  });

  it('should return true when the products array is empty', () => {
    // Arrange
    const productName = 'NewProduct';
    const products: any[] = [];

    // Act
    const result = service.productNameValidation(productName, products);

    // Assert
    expect(result).toBeTrue();
  });

  it('should return false when the product name is empty', () => {
    // Arrange
    const productName = '';
    const products = [{ name: 'ExistingProduct' }, { name: 'AnotherProduct' }];

    // Act
    const result = service.productNameValidation(productName, products);

    // Assert
    expect(result).toBeFalse();
  });

  it('should return the current value of summaryData', () => {
    // Arrange
    const expectedSummaryData = { key: 'value' };
    service.summaryData = expectedSummaryData;

    // Act
    const result = service.getSummaryData();

    // Assert
    expect(result).toBe(expectedSummaryData);
  });

  it('should return null if summaryData is null', () => {
    // Arrange
    service.summaryData = null;

    // Act
    const result = service.getSummaryData();

    // Assert
    expect(result).toBeNull();
  });

  it('should return StockButtonState for a valid form and listingInfo exists', () => {
    // Arrange
    const newProduct = false;
    const val = 'VALID';
    const buttonText = 'Continue';
    service.listingInfo = { someListingInfo: 'example' };

    // Act
    const result: StockButtonState = service.stepOneFormChanges(
      newProduct,
      val,
      buttonText
    );

    // Assert
    const expectedState: StockButtonState = {
      currentStep: StepValues.TRANSACTION,
      buttonText: buttonText,
      disabled: false,
      action: 'valid',
    };
    expect(result).toEqual(expectedState);
  });

  it('should return StockButtonState for a valid form and listingInfo exists', () => {
    // Arrange
    const newProduct = false;
    const val = 'VALID';
    const buttonText = 'Continue';
    service.listingInfo = null;

    // Act
    const result: StockButtonState = service.stepOneFormChanges(
      newProduct,
      val,
      buttonText
    );

    // Assert
    const expectedState: StockButtonState = {
      currentStep: StepValues.TRANSACTION,
      buttonText: buttonText,
      disabled: true,
      action: 'invalid',
    };
    expect(result).toEqual(expectedState);
  });

  it('should return StockButtonState for an invalid form or no listingInfo', () => {
    // Arrange
    const newProduct = true;
    const val = 'INVALID';
    const buttonText = 'Add product & continue';
    service.listingInfo = null;

    // Act
    const result: StockButtonState = service.stepOneFormChanges(
      newProduct,
      val,
      buttonText
    );

    // Assert
    const expectedState: StockButtonState = {
      currentStep: StepValues.TRANSACTION,
      buttonText: buttonText,
      disabled: true,
      action: 'invalid',
    };
    expect(result).toEqual(expectedState);
  });

  it('should return StockButtonState for an invalid form and listingInfo exists', () => {
    // Arrange
    const newProduct = false;
    const val = 'INVALID';
    const buttonText = 'Continue';
    service.listingInfo = { someListingInfo: 'example' };

    // Act
    const result: StockButtonState = service.stepOneFormChanges(
      newProduct,
      val,
      buttonText
    );

    // Assert
    const expectedState: StockButtonState = {
      currentStep: StepValues.TRANSACTION,
      buttonText: buttonText,
      disabled: true,
      action: 'invalid',
    };
    expect(result).toEqual(expectedState);
  });

  describe('createExternalParams', () => {
    it('should properly create external params when selectAll is true', () => {
      // Mock data
      const fnParms = {
        formData: {
          node: 'node',
          date: new Date(),
          type: 'type',
          product: 'product',
          quantity: 10,
          unit: 'unit',
          price: 100,
          buyerRefNo: 'buyerRefNo',
          sellerRefNo: 'sellerRefNo',
        },
        batches: ['batch1', 'batch2'],
        changedBatches: ['changedBatch1', 'changedBatch2'],
      };

      // Mock the selectAll property in summary
      spyOn(service, 'getSummaryData').and.returnValue({ selectAll: true });

      // Call the method
      const params = service.createExternalParams(fnParms);

      // Assertions
      expect(params.node).toBe('node');
      // Verify other properties...
      expect(params.batches).toEqual(['changedBatch1', 'changedBatch2']);
    });

    it('should properly create external params when selectAll is false', () => {
      // Mock data
      const fnParms = {
        formData: {
          node: 'node',
          date: new Date(),
          type: 'type',
          product: 'product',
          quantity: 10,
          unit: 'unit',
          price: 100,
          buyerRefNo: 'buyerRefNo',
          sellerRefNo: 'sellerRefNo',
        },
        batches: ['batch1', 'batch2'],
        changedBatches: ['changedBatch1', 'changedBatch2'],
      };

      // Mock the selectAll property in summary
      spyOn(service, 'getSummaryData').and.returnValue({ selectAll: false });

      // Call the method
      const params = service.createExternalParams(fnParms);

      // Assertions
      expect(params.node).toBe('node');
      // Verify other properties...
      expect(params.batches).toEqual(['batch1', 'batch2']);
    });
  });
});
