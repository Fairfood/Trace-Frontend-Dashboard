/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ReceiveStockSingleComponent } from './receive-stock-single.component';
import { StockService } from '../../stock.service';
import { StockProcessService } from '../stock-process.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { UtilService } from 'src/app/shared/service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { quantityRegex } from 'src/app/shared/configs/app.constants';
import { ButtonNav, StepValues } from '../process-stock.config';

class MockStockService {
  searchFarmer(): Observable<any> {
    return of([]);
  }
}

class MockStockProcessService {
  currentTransactionState() {
    return of({});
  }

  navigateToStockListing() {
    console.log('Navigating to stock listing');
  }

  updateState() {
    console.log('Updating state');
  }

  updateSummaryData() {
    console.log('Updating summary data');
  }

  getSummaryData() {
    return {};
  }

  navigateToAddFarmer() {
    console.log('Navigating to add farmer');
  }

  fetchLocalItem() {
    return 'test';
  }
}

class MockGlobalStoreService {
  glboalConstants$ = new BehaviorSubject({
    currencies: [
      {
        id: 'USD',
        name: 'USD',
      },
    ],
  });

  supplychainProducts$ = new BehaviorSubject([
    {
      id: '1',
      name: 'Cocoa',
    },
  ]);
}

const RECEIVE_FORM = {
  node: new FormControl('', Validators.required),
  name: new FormControl('', Validators.required),
  type: new FormControl(2),
  product: new FormControl(''),
  productName: new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(50),
  ]),
  quantity: new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(11),
    Validators.pattern(quantityRegex),
  ]),
  unit: new FormControl('1'),
  currency: new FormControl(''),
  price: new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.pattern(quantityRegex),
  ]),
  supply_chain: new FormControl(''),
  date: new FormControl(new Date(), Validators.required),
  receipt: new FormControl(''),
};

describe('ReceiveStockSingleComponent', () => {
  let component: ReceiveStockSingleComponent;
  let fixture: ComponentFixture<ReceiveStockSingleComponent>;
  let mockMatDialog: Partial<MatDialog>;

  beforeEach(waitForAsync(() => {
    const utilSpyObj = jasmine.createSpyObj('UtilService', ['customSnackBar']);
    // Mock data for testing
    mockMatDialog = {};

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        ReceiveStockSingleComponent,
      ],
      providers: [
        { provide: StockService, useClass: MockStockService },
        { provide: StockProcessService, useClass: MockStockProcessService },
        { provide: GlobalStoreService, useClass: MockGlobalStoreService },
        { provide: UtilService, useValue: utilSpyObj },
        { provide: MatDialog, useValue: mockMatDialog },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiveStockSingleComponent);
    component = fixture.componentInstance;
    component.farmerForm = new FormGroup(RECEIVE_FORM);
    component.newProduct = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call respective methods when calling ngOnInit', () => {
    // arrange
    spyOn(component, 'farmerDataSubscription');
    spyOn(component, 'productSubscription');
    spyOn(component, 'getAllFarmersList');
    spyOn(component, 'setCurrencies');
    spyOn(component, 'formChanges');
    spyOn(component, 'dataPersistanceSub');
    spyOn(component, 'productNameChanges');
    // act
    component.ngOnInit();

    expect(component.farmerDataSubscription).toHaveBeenCalled();
    expect(component.productNameChanges).toHaveBeenCalled();
    expect(component.dataPersistanceSub).toHaveBeenCalled();
    expect(component.formChanges).toHaveBeenCalled();
    expect(component.setCurrencies).toHaveBeenCalled();
    expect(component.getAllFarmersList).toHaveBeenCalled();
    expect(component.productSubscription).toHaveBeenCalled();
  });

  it('should patch form values and update next button state when selecting a product', () => {
    // Arrange
    const mockItem = { id: 1 }; // Example mock item
    spyOn(component.farmerForm, 'patchValue').and.callThrough();

    // Act
    component.selectProduct(mockItem, component.farmerForm, {
      validText: 'Continue',
      addProduct: 'Add product & continue',
    });

    // Assert
    expect(component.farmerForm.patchValue).toHaveBeenCalledWith({
      product: 1,
    });
    expect(component.newProduct).toBe(false);
    expect(component.nextButtonState.buttonText).toBe('Continue');
  });

  it('should patch form values and update next button state when no product is selected', () => {
    // Arrange
    spyOn(component.farmerForm, 'patchValue').and.callThrough();

    // Act
    component.selectProduct(null, component.farmerForm, {
      validText: 'Continue',
      addProduct: 'Add product & continue',
    });

    // Assert
    expect(component.farmerForm.patchValue).toHaveBeenCalledWith({
      product: -1,
    });
    expect(component.newProduct).toBe(true);
    expect(component.nextButtonState.buttonText).toBe('Add product & continue');
  });

  it('should set newFarmer flag to true when the provided name does not match any farmer', () => {
    component.farmers = [{ first_name: 'John', last_name: 'Doe' }];

    component.checkFarmerName('Alice Smith');

    expect(component.newFarmer).toBe(true);
  });

  it('should set newFarmer flag to false when the provided name matches an existing farmer', () => {
    component.farmers = [{ first_name: 'John', last_name: 'Doe' }];

    component.checkFarmerName('John Doe');

    expect(component.newFarmer).toBe(false);
  });

  it('should set newFarmer flag to false when an empty value is provided', () => {
    component.farmers = [{ first_name: 'John', last_name: 'Doe' }];

    component.checkFarmerName('');

    expect(component.newFarmer).toBe(false);
  });

  it('should populate currencies array when global constants are received', () => {
    component.setCurrencies();

    expect(component.currencies).toEqual([
      {
        id: 'USD',
        name: 'USD',
      },
    ]);
  });

  it('should set the value of receipt form control to null', () => {
    spyOn(component.ccontrol.receipt, 'setValue');

    component.removeFile();

    expect(component.ccontrol.receipt.setValue).toHaveBeenCalledWith(null);
  });

  it('should set the value of receipt form control to the uploaded file', () => {
    // Arrange
    const file = new File(['file content'], 'test.jpg', { type: 'image/jpeg' });
    const event = {
      target: {
        files: [file],
      },
    };
    spyOn(component.ccontrol.receipt, 'setValue');

    // Act
    component.fileUpload(event);

    // Assert
    expect(component.ccontrol.receipt.setValue).toHaveBeenCalledWith(file);
  });

  describe('navigationOutOfComponent', () => {
    it('should set submitted to true, add new product if newProduct is true, and call formSubmit if newProduct is false when type is next', () => {
      // Arrange
      component.newProduct = true;
      spyOn(component, 'addNewProduct');
      spyOn(component, 'formSubmit');
      const type: ButtonNav = 'next';

      // Act
      component.navigationOutOfComponent(type);

      // Assert
      expect(component.submitted).toBeTrue();
      expect(component.addNewProduct).toHaveBeenCalled();
      expect(component.formSubmit).not.toHaveBeenCalled();
    });

    it('should set submitted to true, add new product if newProduct is false, and call formSubmit if newProduct is false when type is next', () => {
      component.newProduct = false;
      spyOn(component, 'addNewProduct');
      spyOn(component, 'formSubmit');
      const type: ButtonNav = 'next';

      // Act
      component.navigationOutOfComponent(type);

      // Assert
      expect(component.submitted).toBeTrue();
      expect(component.formSubmit).toHaveBeenCalled();
      expect(component.addNewProduct).not.toHaveBeenCalled();
    });

    it('should call processService.navigateToStockListing when type is prev', () => {
      spyOn(component.processService, 'navigateToStockListing');
      const type: ButtonNav = 'prev';

      component.navigationOutOfComponent(type);

      expect(
        component.processService.navigateToStockListing
      ).toHaveBeenCalled();
    });
  });

  describe('setCurrency', () => {
    it('should patch the currency value to the farmerForm', () => {
      const data = { id: 'USD' }; // Sample data
      spyOn(component.farmerForm, 'patchValue');

      component.setCurrency(data);

      expect(component.farmerForm.patchValue).toHaveBeenCalledWith({
        currency: 'USD',
      });
    });

    it('should patch an empty string if the id is All', () => {
      const data = { id: 'All' }; // Sample data
      spyOn(component.farmerForm, 'patchValue');

      component.setCurrency(data);

      expect(component.farmerForm.patchValue).toHaveBeenCalledWith({
        currency: '',
      });
    });
  });

  it('should set products and patch currency value when the observable emits', () => {
    spyOn(component.farmerForm, 'patchValue');

    component.getProductsList();

    expect(component.products).toEqual([
      {
        id: '1',
        name: 'Cocoa',
      },
    ]);
  });

  describe('formSubmit', () => {
    it('should update state, update summary data, and emit nextPage event when the form is valid', () => {
      // Arrange
      const mockFormValue = {
        node: 'node',
        name: 'name',
        type: 2,
        product: 'product',
        productName: 'productName',
        quantity: 10,
        unit: 'unit',
        currency: 'USD',
        price: 100,
        supply_chain: 'supply_chain',
        date: new Date(),
        receipt: 'receipt',
      };
      component.farmerForm.setValue(mockFormValue);

      spyOn(component.processService, 'updateState');
      spyOn(component.processService, 'getSummaryData').and.returnValue({}); // Mock summary data
      spyOn(component.processService, 'updateSummaryData');
      spyOn(component.nextPage, 'emit');

      // Act
      component.formSubmit();

      // Assert
      expect(component.processService.updateState).toHaveBeenCalledWith({
        transactionDetails: mockFormValue,
        requestedData: null,
      });
      expect(component.processService.updateSummaryData).toHaveBeenCalledWith({
        currentStep: StepValues.CLAIMS,
        totalQuantity: mockFormValue.quantity,
        product: mockFormValue.productName,
        transactionDate: mockFormValue.date,
        farmerName: mockFormValue.name,
        currency: mockFormValue.currency,
        totalPrice: mockFormValue.price,
      });
      expect(component.nextPage.emit).toHaveBeenCalledWith();
    });

    it('should not perform any action when the form is invalid', () => {
      component.farmerForm.setValue({
        node: 'node',
        name: '',
        type: 2,
        product: '',
        productName: '',
        quantity: 10,
        unit: 'unit',
        currency: 'USD',
        price: null,
        supply_chain: '',
        date: new Date(),
        receipt: 'receipt',
      });
      // Arrange
      spyOn(component.processService, 'updateState');
      spyOn(component.processService, 'updateSummaryData');
      spyOn(component.nextPage, 'emit');

      // Act
      component.formSubmit();

      // Assert
      expect(component.processService.updateState).not.toHaveBeenCalled();
      expect(component.processService.updateSummaryData).not.toHaveBeenCalled();
      expect(component.nextPage.emit).not.toHaveBeenCalled();
    });
  });

  it('should update form with farmer values', () => {
    // Arrange
    const mockFarmer = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      node: 'node',
    };
    spyOn(component.farmerForm, 'patchValue');

    // Act
    component.selectFarmer(mockFarmer);

    // Assert
    expect(component.farmerForm.patchValue).toHaveBeenCalledWith({
      node: '1',
      name: 'John Doe',
    });
  });

  it('should construct data object and navigate to add farmer without farmer name if newFarmer is false', () => {
    spyOn(component.processService, 'fetchLocalItem');

    component.addConnection();

    expect(component.processService.fetchLocalItem).toHaveBeenCalledTimes(3);
  });

  describe('getAllFarmersList', () => {
    it('should set farmers property and call getProductsList when isUpdateList is false', () => {
      // Arrange
      const mockCurrencyId = 'USD';
      component.currencies = [{ id: 'USD', name: 'USD' }];
      const mockRes = [
        { id: 1, name: 'Farmer 1' },
        { id: 2, name: 'Farmer 2' },
      ];
      spyOn(component.stockService, 'searchFarmer').and.returnValue(
        of(mockRes)
      );
      spyOn(component, 'getProductsList');
      spyOn(component.farmerForm, 'patchValue');

      // Act
      component.getAllFarmersList();

      // Assert
      expect(component.stockService.searchFarmer).toHaveBeenCalledWith('');
      expect(component.farmers).toEqual(mockRes);
      expect(component.loaderText).toBe('Loading products');
      expect(component.getProductsList).toHaveBeenCalled();

      expect(component.farmerForm.patchValue).toHaveBeenCalledWith({
        currency: mockCurrencyId,
      });
    });

    it('should set farmers property and call selectFarmer with found farmer when isUpdateList is true', () => {
      // Arrange
      const mockRes = [
        { id: 1, name: 'Farmer 1' },
        { id: 2, name: 'Farmer 2' },
      ];
      const newFarmerId = 1;
      spyOn(component.stockService, 'searchFarmer').and.returnValue(
        of(mockRes)
      );
      spyOn(component, 'selectFarmer');

      // Act
      component.getAllFarmersList(true, newFarmerId);

      // Assert
      expect(component.stockService.searchFarmer).toHaveBeenCalledWith('');
      expect(component.farmers).toEqual(mockRes);
      expect(component.selectFarmer).toHaveBeenCalledWith(mockRes[0]);
    });
  });
});
