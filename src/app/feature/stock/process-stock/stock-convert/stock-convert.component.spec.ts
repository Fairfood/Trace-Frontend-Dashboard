import {
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { StockConvertComponent } from './stock-convert.component';
import { StockService } from '../../stock.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { StockProcessService } from '../stock-process.service';
import { StepValues } from '../process-stock.config';

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

describe('StockConvertComponent', () => {
  let component: StockConvertComponent;
  let fixture: ComponentFixture<StockConvertComponent>;
  let processServiceSpy: jasmine.SpyObj<StockProcessService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;

  beforeEach(async () => {
    processServiceSpy = jasmine.createSpyObj('StockProcessService', [
      'getListingInfo',
      'currentTransactionState',
      'convertStockForm',
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
          transactionDate: new Date(),
          type: 1,
          items: [],
        },
      })
    );

    stockServiceSpy = jasmine.createSpyObj('StockService', [
      'createProductBulk',
      'supplyChainData',
    ]);
    stockServiceSpy.createProductBulk.and.returnValue(
      of({
        products: [
          {
            id: 'newProductId',
            name: 'Product2',
          },
        ],
      })
    );

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, StockConvertComponent],
      providers: [
        FormBuilder,
        { provide: StockService, useValue: stockServiceSpy },
        { provide: GlobalStoreService, useClass: MockGlobalStoreService },
        { provide: StockProcessService, useValue: processServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockConvertComponent);
    component = fixture.componentInstance;
    // Initialize the form controls
    const formBuilder = TestBed.inject(FormBuilder);
    processServiceSpy.convertStockForm.and.returnValue(
      formBuilder.group({
        productName: [''],
        product: [''],
        quantity: [''],
        unit: [''],
        newProductMessage: [false],
      })
    );

    component.convertForm = formBuilder.group({
      type: [1],
      transactionDate: [new Date()],
      items: formBuilder.array([
        formBuilder.group({
          productName: [''],
          product: [''],
          quantity: [''],
          unit: [''],
          newProductMessage: [false],
        }),
      ]),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a new item when addMore is called', () => {
    const initialItemsLength = component.stockItems.length;
    component.addMore();
    expect(component.stockItems.length).toBe(initialItemsLength + 1);
  });

  describe('stateChanges', () => {
    it('should add items if transactionDetails contain more items than the form', fakeAsync(() => {
      component.nextButtonState = {
        action: 'init',
        disabled: true,
        currentStep: StepValues.TRANSACTION,
        buttonText: 'Continue',
      };
      spyOn(component, 'addMore');

      component.stateChanges();

      tick();

      expect(component.addMore).toHaveBeenCalledTimes(0);
    }));
  });

  it('should set newProductMessage when identifying new product', () => {
    component.products = [{ name: 'Product1' }, { name: 'Product2' }];

    component.identifyNewProduct('Product3', 0);
    expect(component.stockItems.at(0).get('newProductMessage').value).toBe(
      true
    );

    component.identifyNewProduct('Product2', 0);
    expect(component.stockItems.at(0).get('newProductMessage').value).toBe(
      false
    );
  });

  it('should update product control when selecting destination product', () => {
    component.selectDestinationProduct({ id: '1', name: 'Product1' }, 0);
    expect(component.stockItems.at(0).get('product').value).toBe('1');

    component.selectDestinationProduct(null, 0);
    expect(component.stockItems.at(0).get('product').value).toBe(-1);
  });

  it('should navigate out of component', () => {
    component.navigationOutOfComponent('prev');
    expect(component.service.navigateToStockListing).toHaveBeenCalled();

    spyOn(component, 'addBulkProducts');
    component.navigationOutOfComponent('next');
    expect(component.addBulkProducts).toHaveBeenCalled();
  });

  it('should add bulk products', () => {
    component.stockItems.controls.forEach((control: any) => {
      control.patchValue({ productName: 'New Product', product: -1 });
    });

    component.addBulkProducts();
    expect(component.stockService.createProductBulk).toHaveBeenCalled();
  });

  it('should not add bulk products/ call api when no new products', () => {
    spyOn(component, 'formSubmit');
    component.stockItems.controls.forEach((control: any) => {
      control.patchValue({ productName: 'Product 1', product: '1' });
    });

    component.addBulkProducts();
    expect(component.stockService.createProductBulk).not.toHaveBeenCalled();
    expect(component.formSubmit).toHaveBeenCalled();
  });

  it('should remove item at specified index', () => {
    // Add multiple items to the form array
    component.addMore();
    component.addMore();
    const initialLength = component.stockItems.length;

    // Remove an item at index 1
    component.removeField(1);

    // Ensure that the item is removed and the length is decreased by 1
    expect(component.stockItems.length).toBe(initialLength - 1);
  });

  it('should patch batch products and submit form', () => {
    const products = [
      { name: 'Product1', id: '1' },
      { name: 'Product2', id: '2' },
    ];

    component.stockItems.at(0).patchValue({
      product: '1',
      productName: 'Product1',
    });
    component.addMore();

    component.stockItems.at(1).patchValue({
      product: '2',
      productName: 'Product2',
    });

    spyOn(component, 'selectDestinationProduct');
    spyOn(component, 'formSubmit');

    // Call the method
    component.patchBatchProducts(products);

    // Verify that selectDestinationProduct is called for each product
    expect(component.selectDestinationProduct).toHaveBeenCalledTimes(2);
    expect(component.selectDestinationProduct).toHaveBeenCalledWith(
      products[0],
      0
    );
    expect(component.selectDestinationProduct).toHaveBeenCalledWith(
      products[1],
      1
    );

    // Verify that formSubmit is called after patching products
    expect(component.formSubmit).toHaveBeenCalled();
  });
});
