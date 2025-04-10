import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockSendComponent } from './stock-send.component';
import { StockService } from '../../stock.service';
import { UtilService } from 'src/app/shared/service';
import { CreateRequestService } from 'src/app/feature/requests/create-request';
import { GlobalStoreService } from 'src/app/shared/store';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { StockProcessService } from '../stock-process.service';
import {
  CompanyData,
  StepValues,
  TransactionState,
} from '../process-stock.config';
import { TranslateService } from '@ngx-translate/core';

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

describe('StockSendComponent', () => {
  let component: StockSendComponent;
  let fixture: ComponentFixture<StockSendComponent>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let stockProcesSpy: jasmine.SpyObj<StockProcessService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  let createRequestServiceSpy: jasmine.SpyObj<CreateRequestService>;

  beforeEach(async () => {
    stockProcesSpy = jasmine.createSpyObj('StockProcessService', [
      'getListingInfo',
      'sendStockForm',
      'currentTransactionState',
      'stepOneFormChanges',
      'fetchLocalItem',
      'navigateToStockListing',
      'updateState',
      'getSummaryData',
      'updateSummaryData',
    ]);

    // Assign a custom implementation to fetchLocalItem
    stockProcesSpy.fetchLocalItem.and.callFake((key: string) => {
      // Implement the desired behavior based on the key
      if (key === 'supplyChainName') return 'Test Chain';
      if (key === 'companyID') return '123';
      if (key === 'supplyChainId') return '456';
      // Return a default value or handle other cases as needed
      return null;
    });

    stockProcesSpy.getListingInfo.and.returnValue({
      selectedStock: [{ product: 'Product A', productId: 1, Quan_needed: 10 }],
    });

    createRequestServiceSpy = jasmine.createSpyObj('CreateRequestService', [
      'transparencyRequest',
      'verifyTransactionRequest',
    ]);
    createRequestServiceSpy.transparencyRequest.and.returnValue(of({}));

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    utilServiceSpy = jasmine.createSpyObj('UtilService', ['customSnackBar']);
    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    const activatedRouteStub = {
      params: of({}),
      queryParams: of({}),
    };

    stockServiceSpy = jasmine.createSpyObj('StockService', [
      'createProduct',
      'searchConnectedCompany',
      'searchProduct',
    ]);

    stockServiceSpy.searchProduct.and.returnValue(
      of([
        {
          id: 1,
          name: 'Product A',
        },
      ])
    );

    stockServiceSpy.searchConnectedCompany.and.returnValue(of([]));

    stockServiceSpy.createProduct.and.returnValue(of({ id: '123' }));

    await TestBed.configureTestingModule({
      imports: [StockSendComponent, ReactiveFormsModule, HttpClientModule],
      providers: [
        { provide: StockService, useValue: stockServiceSpy },
        { provide: StockProcessService, useValue: stockProcesSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: CreateRequestService, useValue: createRequestServiceSpy },
        { provide: GlobalStoreService, useClass: MockGlobalStoreService },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: TranslateService, useValue: mockSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockSendComponent);
    component = fixture.componentInstance;
    // Initialize the form controls
    const formBuilder = TestBed.inject(FormBuilder);
    component.sendForm = formBuilder.group({
      productName: ['', Validators.required],
      product: [''],
      quantity: [''],
      date: [''],
      name: [''],
      node: [''],
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up subscriptions and fetch data in ngOnInit', () => {
    // Stub other methods
    spyOn(component, 'companyDataSubscription');
    spyOn(component, 'productSubscription');
    spyOn(component, 'fetchTransparencyRequests');
    spyOn(component, 'formChanges');
    spyOn(component, 'productNameChanges');
    spyOn(component, 'dataChanges');

    // Call ngOnInit
    component.ngOnInit();

    // Assertions
    expect(component.companyDataSubscription).toHaveBeenCalled();
    expect(component.productSubscription).toHaveBeenCalledWith(
      component.sendForm.controls
    );
    expect(component.fetchTransparencyRequests).toHaveBeenCalled();
    expect(component.formChanges).toHaveBeenCalled();
    expect(component.productNameChanges).toHaveBeenCalledWith(
      component.sendForm.controls
    );
    expect(component.dataChanges).toHaveBeenCalled();
    expect(component.listingInfo).toBeTruthy();
    expect(component.ccontrol.productName.value).toEqual('Product A');
    expect(component.ccontrol.product.value).toEqual(1);
    expect(component.ccontrol.quantity.value).toEqual(10);
  });

  it('should retain data when navigating between tabs', () => {
    // Mock data for transaction state
    const mockTransactionState: TransactionState = {
      transactionDetails: {
        date: new Date(),
        name: '12345',
      },
      requestedData: null, // Mock no requested data
    };

    // Create a BehaviorSubject to control emitted values for currentTransactionState
    const transactionStateSubject = new BehaviorSubject<TransactionState>(
      mockTransactionState
    );

    // Spy on currentTransactionState and return the BehaviorSubject
    stockProcesSpy.currentTransactionState.and.returnValue(
      transactionStateSubject.asObservable()
    );

    // Call the method to set up subscriptions
    component.dataChanges();

    // Fast-forward time to trigger setTimeout
    jasmine.clock().install();
    jasmine.clock().tick(1);

    setTimeout(() => {
      // Verify that patchValue is called with the correct transaction details
      expect(component.sendForm.value).toEqual({
        productName: '',
        product: '',
        quantity: '',
        date: mockTransactionState.transactionDetails.date,
        name: mockTransactionState.transactionDetails.name,
        node: '',
      });
    });

    // Fast-forward time by ticking the clock
    jasmine.clock().uninstall();

    // Verify that nextButtonState is updated appropriately
    expect(component.nextButtonState.disabled).toBeFalse();

    // Simulate changes in transaction state by emitting new values
    const updatedTransactionState: TransactionState = {
      transactionDetails: {
        productName: '12345',
        product: 1,
      },
      requestedData: null,
    };

    // Emit the updated transaction state
    transactionStateSubject.next(updatedTransactionState);

    // Fast-forward time to trigger setTimeout
    jasmine.clock().install();
    jasmine.clock().tick(1);

    // Verify that patchValue is called again with the updated transaction details

    setTimeout(() => {
      expect(component.sendForm.value).toEqual({
        productName: '12345',
        product: '1',
        quantity: '',
        date: mockTransactionState.transactionDetails.date,
        name: mockTransactionState.transactionDetails.name,
        node: '',
      });
    });

    // Fast-forward time by ticking the clock
    jasmine.clock().uninstall();

    // Verify that nextButtonState is still updated appropriately
    expect(component.nextButtonState.disabled).toBeFalse();

    spyOn(component, 'linkStockRequest');
    component.linkedData = null;
    const updatedRequestedData: TransactionState = {
      transactionDetails: null,
      requestedData: {
        id: 1,
        data: 'test',
      },
    };

    // Emit the updated transaction state
    transactionStateSubject.next(updatedRequestedData);

    expect(component.linkStockRequest).toHaveBeenCalledOnceWith(
      {
        id: 1,
        data: 'test',
      },
      null
    );
  });

  it('should set up formChanges subscription', () => {
    component.formChanges();
    component.newProduct = false;
    // Emit a status change to the form
    component.sendForm.patchValue({
      productName: 'test',
      product: '1',
      quantity: 10,
    });

    // Expect that the form status change triggered the stepOneFormChanges method
    expect(stockProcesSpy.stepOneFormChanges).toHaveBeenCalledOnceWith(
      false,
      'VALID',
      'Continue'
    );
  });

  it('should call openCreateConnectionPopup with correct data when inviteConnectionPopup called', () => {
    // arrange
    spyOn(component, 'openCreateConnectionPopup');
    component.sendForm.patchValue({
      name: 'Test Company',
    });
    // Call the inviteConnectionPopup method
    component.inviteConnectionPopup({ extraData: 'extra' });

    // Expect that openCreateConnectionPopup is called with the correct data
    expect(component.openCreateConnectionPopup).toHaveBeenCalledOnceWith({
      stock: true,
      stockType: 'company',
      stockInvite: true,
      companyName: 'Test Company',
      chainName: 'Test Chain',
      nodeId: '123',
      schainId: '456',
      extraData: 'extra',
    });
  });

  it('should call openCreateConnectionPopup with correct data when addCompanyPopup called', () => {
    // arrange
    spyOn(component, 'openCreateConnectionPopup');
    component.sendForm.patchValue({
      name: 'Test Company',
    });
    // Call the inviteConnectionPopup method
    component.addCompanyPopup();

    // Expect that openCreateConnectionPopup is called with the correct data
    expect(component.openCreateConnectionPopup).toHaveBeenCalledOnceWith({
      stock: true,
      stockType: 'company',
      stockInvite: false,
      companyName: 'Test Company',
      chainName: 'Test Chain',
      nodeId: '123',
      schainId: '456',
    });
  });

  describe('selectCompany', () => {
    it('should invite connection if company is not connected', () => {
      const companyData: CompanyData = {
        id: '1',
        name: 'Test Company',
        connected: false,
        connectable: true,
        email_sent: false,
        image: 'string',
      };

      spyOn(component, 'inviteConnectionPopup'); // Spy on inviteConnectionPopup method

      // Call the method under test
      component.selectCompany(companyData);

      // Expect inviteConnectionPopup to be called with the correct companyData
      expect(component.inviteConnectionPopup).toHaveBeenCalledWith(companyData);
    });

    it('should patch form value and clear errors if company is connected', () => {
      // arrange
      const companyData: CompanyData = {
        id: '1324',
        name: 'Test Company 2',
        connected: true,
        connectable: true,
        email_sent: true,
        image: 'test_image.png',
      };

      spyOn(component.sendForm, 'patchValue');
      spyOn(component.ccontrol.name, 'setErrors');

      // Call the method under test
      component.selectCompany(companyData);

      // Expect inviteConnectionPopup to be called with the correct companyData
      expect(component.sendForm.patchValue).toHaveBeenCalledWith({
        node: companyData.id,
        name: companyData.name,
      });

      expect(component.ccontrol.name.setErrors).toHaveBeenCalledWith(null);
    });
  });

  describe('addNewProduct', () => {
    it('should call createProduct and patch form value if form is valid', () => {
      // arrange
      component.sendForm.patchValue({
        productName: 'Product A',
        product: 1,
        quantity: 10,
        date: '231',
        name: 'Test',
      });

      spyOn(component.sendForm, 'patchValue');
      spyOn(component, 'formSubmit');

      // Call the method under test
      component.addNewProduct();

      // Expect createProduct to be called with the correct value
      expect(stockServiceSpy.createProduct).toHaveBeenCalledWith(
        component.ccontrol.productName.value
      );

      // Expect sendForm.patchValue to be called with the correct value
      expect(component.sendForm.patchValue).toHaveBeenCalledWith({
        product: '123',
      });
      expect(component.formSubmit).toHaveBeenCalled();
    });

    it('should not call createProduct if form is invalid', () => {
      // arrange
      component.sendForm.patchValue({
        productName: '',
        product: 1,
      });

      // Call the method under test
      component.addNewProduct();

      // Expect createProduct not to be called
      expect(stockServiceSpy.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('navigationOutOfComponent', () => {
    it('should call addNewProduct if newProduct is true on navigationOutOfComponent', () => {
      component.newProduct = true;
      spyOn(component, 'addNewProduct');
      spyOn(component, 'formSubmit');

      // act
      component.navigationOutOfComponent('next');

      expect(component.addNewProduct).toHaveBeenCalled();
      expect(component.formSubmit).not.toHaveBeenCalled();
    });

    it('should call formSubmit if newProduct is false on navigationOutOfComponent', () => {
      component.newProduct = false;
      spyOn(component, 'addNewProduct');
      spyOn(component, 'formSubmit');

      // act
      component.navigationOutOfComponent('next');

      expect(component.formSubmit).toHaveBeenCalled();
      expect(component.addNewProduct).not.toHaveBeenCalled();
    });

    it('should call navigateToStockListing if type is "prev" on navigationOutOfComponent', () => {
      // Call the method under test
      component.navigationOutOfComponent('prev');

      expect(stockProcesSpy.navigateToStockListing).toHaveBeenCalled();
    });
  });

  it('should reset form and properties in removeStockRequest', () => {
    spyOn(component.sendForm, 'patchValue');
    spyOn(component.sendForm, 'updateValueAndValidity');

    component.removeStockRequest();

    // Expect properties to be reset
    expect(component.stockRequestLinked).toBeFalse();
    expect(component.linkedData).toBeNull();

    // Expect sendForm to be patched with the correct values
    expect(component.sendForm.patchValue).toHaveBeenCalledWith({
      node: '',
      name: '',
      product: '',
      productName: '',
      quantity: null,
    });

    // Ensure that updateValueAndValidity method is called
    expect(component.sendForm.updateValueAndValidity).toHaveBeenCalled();

    // Ensure that claimsInvalid property is set to false
    expect(component.claimsInvalid).toBeFalse();
  });

  describe('searchFilter', () => {
    it('should return all linkedRequests if search term is empty', () => {
      const linkedRequests = [
        {
          node: { name: 'Company A' },
          product: { name: 'Product A' },
          number: 1,
        },
        {
          node: { name: 'Company B' },
          product: { name: 'Product B' },
          number: 2,
        },
      ];
      component.linkedRequests = linkedRequests;

      const result = component.searchFilter('');

      expect(result).toEqual(linkedRequests);
    });

    it('should filter linkedRequests based on search term', () => {
      const linkedRequests = [
        {
          node: { name: 'Company A' },
          product: { name: 'Product A' },
          number: 1,
        },
        {
          node: { name: 'Company B' },
          product: { name: 'Product B' },
          number: 2,
        },
      ];
      component.linkedRequests = linkedRequests;

      const result = component.searchFilter('Company A');

      expect(result).toEqual([
        {
          node: { name: 'Company A' },
          product: { name: 'Product A' },
          number: 1,
        },
      ]);
    });
  });

  it('should link stock request and update form with reqData and transactionDetails', () => {
    const reqData = {
      node: { id: 1, name: 'Company A' },
      product: { id: 1, name: 'Product A' },
      quantity: 10,
    };

    spyOn(component.sendForm, 'updateValueAndValidity');
    spyOn(component.sendForm, 'patchValue');
    spyOn(component, 'checkClaims');

    component.linkStockRequest(reqData, null);

    // Expect sendForm to be updated with reqData and transactionDetails
    expect(component.sendForm.patchValue).toHaveBeenCalledWith({
      node: 1,
      name: 'Company A',
      product: 1,
      productName: 'Product A',
      quantity: 10,
    });

    // Expect stockRequestLinked to be true
    expect(component.stockRequestLinked).toBeTrue();
    expect(component.sendForm.updateValueAndValidity).toHaveBeenCalled();
    expect(component.checkClaims).toHaveBeenCalled();
  });

  describe('checkClaims', () => {
    it('should set claimsInvalid to false and enable next button if transaction request is valid', () => {
      // Stub listingInfo with batches
      component.listingInfo = {
        batches: [{ batch: 'batch1' }, { batch: 'batch2' }],
      };

      // Stub verifyTransactionRequest to return valid response
      createRequestServiceSpy.verifyTransactionRequest.and.returnValue(
        of({ data: { valid: true } })
      );

      // Call checkClaims
      component.checkClaims();

      // Expect claimsInvalid to be false
      expect(component.claimsInvalid).toBeFalse();

      // Expect nextButtonState.disabled to be false
      expect(component.nextButtonState.disabled).toBeFalse();
    });

    it('should set claimsInvalid to true, disable next button, and emit disableNextTab event if transaction request is invalid', () => {
      // Stub listingInfo with batches
      component.listingInfo = {
        batches: [{ batch: 'batch1' }, { batch: 'batch2' }],
      };
      spyOn(component.disableNextTab, 'emit');

      // Stub verifyTransactionRequest to return invalid response
      createRequestServiceSpy.verifyTransactionRequest.and.returnValue(
        of({ data: { valid: false } })
      );

      // Call checkClaims
      component.checkClaims();

      // Expect claimsInvalid to be true
      expect(component.claimsInvalid).toBeTrue();

      // Expect nextButtonState.disabled to be true
      expect(component.nextButtonState.disabled).toBeTrue();

      // Expect disableNextTab.emit to have been called
      expect(component.disableNextTab.emit).toHaveBeenCalledWith('disable');
    });

    it('should not make API call if listingInfo is not provided', () => {
      // Call checkClaims without setting listingInfo
      component.checkClaims();

      // Expect verifyTransactionRequest not to have been called
      expect(
        createRequestServiceSpy.verifyTransactionRequest
      ).not.toHaveBeenCalled();
    });
  });

  describe('formSubmit', () => {
    it('should update state, summary data, and emit nextPage event when form is valid', () => {
      // Stub sendForm.valid to return true
      spyOnProperty(component.sendForm, 'valid', 'get').and.returnValue(true);
      const emitSpy = spyOn(component.nextPage, 'emit');

      // Stub sendForm value
      component.sendForm.setValue({
        quantity: 10,
        productName: 'Product A',
        date: new Date(),
        name: 'Company XYZ',
        product: 1,
        node: 1,
      });

      // Call formSubmit
      component.formSubmit();

      // Expect processService.updateState to have been called with the correct data
      expect(stockProcesSpy.updateState).toHaveBeenCalledWith({
        transactionDetails: component.sendForm.value,
        requestedData: component.stockRequestLinked
          ? component.linkedData
          : null,
      });

      // Expect processService.getSummaryData to have been called
      expect(stockProcesSpy.getSummaryData).toHaveBeenCalled();

      // Expect processService.updateSummaryData to have been called with the correct data
      expect(stockProcesSpy.updateSummaryData).toHaveBeenCalledWith({
        currentStep: StepValues.CLAIMS,
        totalQuantity: 10,
        product: 'Product A',
        transactionDate: component.sendForm.value.date,
        companyName: 'Company XYZ',
        requestLinked: component.stockRequestLinked,
        requestedData: component.stockRequestLinked
          ? component.linkedData
          : null,
      });

      // Expect nextPage event to have been emitted with true
      expect(emitSpy).toHaveBeenCalledWith();
    });

    it('should not update state, summary data, or emit nextPage event when form is invalid', () => {
      // Stub sendForm.valid to return false
      spyOnProperty(component.sendForm, 'valid', 'get').and.returnValue(false);
      const emitSpy = spyOn(component.nextPage, 'emit');

      // Call formSubmit
      component.formSubmit();

      // Expect processService.updateState, processService.getSummaryData, and processService.updateSummaryData not to have been called
      expect(stockProcesSpy.updateState).not.toHaveBeenCalled();
      expect(stockProcesSpy.getSummaryData).not.toHaveBeenCalled();
      expect(stockProcesSpy.updateSummaryData).not.toHaveBeenCalled();

      // Expect nextPage event not to have been emitted
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
