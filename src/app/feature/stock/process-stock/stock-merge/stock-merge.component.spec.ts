import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { StockMergeComponent } from './stock-merge.component';
import { StockService } from '../../stock.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { StockProcessService } from '../stock-process.service';
import { BehaviorSubject, of } from 'rxjs';

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

describe('StockMergeComponent', () => {
  let component: StockMergeComponent;
  let fixture: ComponentFixture<StockMergeComponent>;
  let processServiceSpy: jasmine.SpyObj<StockProcessService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;

  beforeEach(async () => {
    processServiceSpy = jasmine.createSpyObj('StockProcessService', [
      'getListingInfo',
      'currentTransactionState',
      'mergeStockForm',
      'updateState',
      'getSummaryData',
      'updateSummaryData',
      'stepOneFormChanges',
      'navigateToStockListing',
      'fetchCurrentUrl',
    ]);

    processServiceSpy.currentTransactionState.and.returnValue(
      of({
        transactionDetails: {
          date: new Date(),
          name: '12345',
        },
      })
    );

    stockServiceSpy = jasmine.createSpyObj('StockService', ['createProduct']);
    stockServiceSpy.createProduct.and.returnValue(of({ id: 'newProductId' }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, StockMergeComponent],
      providers: [
        { provide: StockProcessService, useValue: processServiceSpy },
        { provide: GlobalStoreService, useClass: MockGlobalStoreService },
        { provide: StockService, useValue: stockServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockMergeComponent);
    component = fixture.componentInstance;
    // Initialize the form controls
    const formBuilder = TestBed.inject(FormBuilder);
    component.mergeForm = formBuilder.group({
      productName: ['', Validators.required],
      product: [''],
      quantity: [''],
      date: [''],
      unit: [''],
      type: [3],
      supply_chain: [''],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call formChanges and dataChanges methods on ngOnInit', () => {
    // Arrange
    spyOn(component, 'formChanges');
    spyOn(component, 'dataChanges');

    // Act
    component.ngOnInit();

    // Assert
    expect(component.formChanges).toHaveBeenCalled();
    expect(component.dataChanges).toHaveBeenCalled();
  });

  it('should update state and summary data and emit nextPage event on formSubmit when form is valid', () => {
    // Arrange
    component.mergeForm.setValue({
      quantity: 10,
      productName: 'Product A',
      date: new Date(),
      product: `1`,
      unit: 'kg',
      type: 3,
      supply_chain: '12345',
    });

    processServiceSpy.getSummaryData.and.returnValue({});
    spyOn(component.nextPage, 'emit');

    // Act
    component.formSubmit();

    // Assert
    expect(processServiceSpy.updateState).toHaveBeenCalled();
    expect(processServiceSpy.updateSummaryData).toHaveBeenCalled();
    expect(component.nextPage.emit).toHaveBeenCalled();
  });

  it('should not update state, summary data, or emit nextPage event on formSubmit when form is invalid', () => {
    // Arrange
    spyOn(component.nextPage, 'emit');

    // Act
    component.formSubmit();

    // Assert
    expect(processServiceSpy.updateState).not.toHaveBeenCalled();
    expect(processServiceSpy.updateSummaryData).not.toHaveBeenCalled();
    expect(component.nextPage.emit).not.toHaveBeenCalled();
  });

  describe('navigationOutOfComponent', () => {
    it('should call addNewProduct and formSubmit methods when navigating next and new product is selected', () => {
      // Arrange
      component.newProduct = true;
      spyOn(component, 'addNewProduct');
      spyOn(component, 'formSubmit');

      // Act
      component.navigationOutOfComponent('next');

      // Assert
      expect(component.addNewProduct).toHaveBeenCalled();
      expect(component.formSubmit).not.toHaveBeenCalled();
    });

    it('should call addNewProduct and formSubmit methods when navigating next and new product is false', () => {
      // Arrange
      component.newProduct = false;
      spyOn(component, 'addNewProduct');
      spyOn(component, 'formSubmit');

      // Act
      component.navigationOutOfComponent('next');

      // Assert
      expect(component.formSubmit).toHaveBeenCalled();
      expect(component.addNewProduct).not.toHaveBeenCalled();
    });

    it('should call navigateToStockListing method when navigating back', () => {
      // Act
      component.navigationOutOfComponent('prev');

      // Assert
      expect(
        component.processService.navigateToStockListing
      ).toHaveBeenCalled();
    });
  });

  describe('addNewProduct', () => {
    it('should call createProduct method and submit form when form is valid', () => {
      // Arrange
      const productNameControl = component.mergeForm.controls['productName'];
      productNameControl.setValue('New Product');
      productNameControl.markAsTouched();
      component.mergeForm.controls['product'].setValue('Existing Product'); // Simulating an existing product selected

      spyOn(component, 'formSubmit');

      // Act
      component.addNewProduct();

      // Assert
      expect(stockServiceSpy.createProduct).toHaveBeenCalledWith('New Product');
      expect(component.mergeForm.value.product).toEqual('newProductId');
      expect(component.formSubmit).toHaveBeenCalled();
    });

    it('should not call createProduct method or submit form when form is invalid', () => {
      // Arrange
      const productNameControl = component.mergeForm.controls['productName'];
      productNameControl.setValue(''); // Making form invalid by not providing a product name
      spyOn(component, 'formSubmit');

      // Act
      component.addNewProduct();

      // Assert
      expect(stockServiceSpy.createProduct).not.toHaveBeenCalled();
      expect(component.formSubmit).not.toHaveBeenCalled();
    });
  });
});
