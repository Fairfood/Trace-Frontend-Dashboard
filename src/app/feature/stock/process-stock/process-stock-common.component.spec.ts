/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProcessStockCommonComponent } from './process-stock-common.component';
import { GlobalStoreService } from 'src/app/shared/store';
import { StockService } from '../stock.service';
import { StockProcessService } from './stock-process.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, of } from 'rxjs';

describe('ProcessStockCommonComponent', () => {
  let component: ProcessStockCommonComponent;
  let fixture: ComponentFixture<ProcessStockCommonComponent>;
  let globalStoreServiceSpy: jasmine.SpyObj<GlobalStoreService>;
  let stockProcessServiceSpy: jasmine.SpyObj<StockProcessService>;

  beforeEach(waitForAsync(() => {
    const globalStoreSpy = jasmine.createSpyObj('GlobalStoreService', [
      'supplychainProducts$',
    ]);
    const stockServiceSpyObj = jasmine.createSpyObj('StockService', [
      'searchProduct',
    ]);
    const stockProcessServiceSpyObj = jasmine.createSpyObj(
      'StockProcessService',
      ['productNameValidation']
    );

    TestBed.configureTestingModule({
      imports: [ProcessStockCommonComponent],
      providers: [
        { provide: GlobalStoreService, useValue: globalStoreSpy },
        { provide: StockService, useValue: stockServiceSpyObj },
        { provide: StockProcessService, useValue: stockProcessServiceSpyObj },
      ],
    }).compileComponents();

    globalStoreServiceSpy = TestBed.inject(
      GlobalStoreService
    ) as jasmine.SpyObj<GlobalStoreService>;
    stockProcessServiceSpy = TestBed.inject(
      StockProcessService
    ) as jasmine.SpyObj<StockProcessService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessStockCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProductsList and populate products on initialization', () => {
    const products = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ];
    globalStoreServiceSpy.supplychainProducts$ = of(products);
    component.getProductsList();
    expect(component.products).toEqual(products);
  });

  it('should handle productNameChanges and update newProduct accordingly', () => {
    const productName = 'Test Product';
    const products = [{ id: 1, name: 'Test Product' }];
    stockProcessServiceSpy.productNameValidation.and.returnValue(true);
    component.products = products;
    const formControl = { productName: { valueChanges: of(productName) } };
    component.productNameChanges(formControl);
    expect(component.newProduct).toBeTrue();
  });

  it('should handle selectProduct when item is selected', () => {
    // arrange
    const item = { id: 1, name: 'Test Product' };
    const form = new FormGroup({
      product: new FormControl(null),
    });
    spyOn(form, 'patchValue').and.callThrough();
    const buttonConfig = {
      validText: 'Continue',
      addProduct: 'Add product & continue',
    };
    component.nextButtonState = {
      buttonText: '',
      action: '',
      disabled: false,
      currentStep: '1',
    };
    component.selectProduct(item, form, buttonConfig);
    expect(form.patchValue).toHaveBeenCalledWith({ product: item.id });
    expect(component.newProduct).toBeFalse();
    expect(component.nextButtonState.buttonText).toBe(buttonConfig.validText);
  });

  it('should handle product selection', () => {
    const item: any = null;
    const form = new FormGroup({
      product: new FormControl(null),
    });
    component.nextButtonState = {
      buttonText: '',
      action: '',
      disabled: false,
      currentStep: '1',
    };
    component.selectProduct(item, form, component.buttonConfig);
    expect(form.get('product').value).toBe(-1);
    expect(component.nextButtonState.buttonText).toBe(
      component.buttonConfig.addProduct
    );
  });

  it('should unsubscribe from pageApis on ngOnDestroy', () => {
    component.pageApis = [new Subscription(), new Subscription()];
    spyOn(component.pageApis[0], 'unsubscribe');
    spyOn(component.pageApis[1], 'unsubscribe');
    component.ngOnDestroy();
    expect(component.pageApis[0].unsubscribe).toHaveBeenCalled();
    expect(component.pageApis[1].unsubscribe).toHaveBeenCalled();
  });
});
