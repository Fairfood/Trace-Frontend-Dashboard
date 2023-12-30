/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
// services and configs
import {
  ButtonNav,
  StepValues,
  StockButtonState,
  TransactionState,
} from '../process-stock.config';
import { UNITS } from 'src/app/shared/configs/app.constants';
import { StockService } from '../../stock.service';
import { StockProcessService } from '../stock-process.service';
import { GlobalStoreService } from 'src/app/shared/store';

@Component({
  selector: 'app-stock-convert',
  templateUrl: './stock-convert.component.html',
  styleUrls: ['./stock-convert.component.scss'],
})
export class StockConvertComponent implements OnInit, OnDestroy {
  @Output() nextPage = new EventEmitter();

  nextButtonState: StockButtonState;

  convertFilterProducts: Observable<any[]>[] = [];
  products: any[] = [];
  units = UNITS;
  maxDate = new Date();

  // declare form processing (internal)
  convertForm: FormGroup = this.fb.group({
    type: [1],
    transactionDate: [new Date(), Validators.required],
    items: this.fb.array([this.processService.convertStockForm()]),
  });
  pageApis: Subscription[] = [];
  productLoader: boolean;
  submitted: boolean;
  loader = true;
  listingInfo: any;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private processService: StockProcessService,
    private global: GlobalStoreService
  ) {
    this.nextButtonState = {
      action: 'init',
      disabled: true,
      currentStep: StepValues.TRANSACTION,
      buttonText: 'Continue',
    };
  }

  ngOnInit(): void {
    this.getProductsList();
    this.listingInfo = this.processService.getListingInfo();
    const form = this.convertForm.statusChanges.subscribe(val => {
      this.nextButtonState = this.processService.stepOneFormChanges(
        false,
        val,
        'Continue'
      );
    });

    // when navigating between tabs data should be retained
    const dataSub = this.processService
      .currentTransactionState()
      .subscribe((result: TransactionState) => {
        if (result) {
          const { transactionDetails } = result;
          if (transactionDetails) {
            const { items } = transactionDetails;
            if (this.convertForm.value.items.length !== items.length) {
              if (items.length > 1) {
                for (let index = 0; index < items.length - 1; index++) {
                  this.addMore();
                }
              }
            }
            setTimeout(() => {
              this.convertForm.patchValue(transactionDetails);
            });
            this.nextButtonState.disabled = false;
          }
        }
      });
    this.pageApis.push(dataSub);
    this.pageApis.push(form);
  }

  // get all available product list
  getProductsList(): void {
    const API_CALL = this.global.supplychainProducts$.subscribe({
      next: (res: any) => {
        this.products = res;
        this.formValueChangesConvertStock(0);
        this.loader = false;
      },
      error: () => {
        this.products = [];
      },
    });
    this.pageApis.push(API_CALL);
  }

  get stockItems(): any {
    return this.convertForm.get('items') as FormArray;
  }

  get convertFormControls() {
    return this.convertForm.controls;
  }

  formValueChangesConvertStock(index: number): void {
    this.convertFilterProducts[index] = this.stockItems
      .at(index)
      .get('productName')
      .valueChanges.pipe(
        distinctUntilChanged(),
        debounceTime(1000),
        startWith(''),
        tap((data: string) => {
          if (data) {
            this.identifyNewProduct(data, index);
          }
        }),
        switchMap((value: string) => {
          setTimeout(() => {
            this.productLoader = true;
          });
          return this.productFilter(value);
        })
      );
  }
  private productFilter(keyword: string): any {
    return this.stockService
      .searchProduct(keyword)
      .pipe(finalize(() => (this.productLoader = false)));
  }

  identifyNewProduct(name: string, index: number): void {
    const found = this.products.find(p => p.name === name);

    if (!found && name !== '') {
      this.stockItems.at(index).get('newProductMessage').setValue(true);
    } else {
      this.stockItems.at(index).get('newProductMessage').setValue(false);
    }
  }

  selectDestinationProduct(item: any, index: number): void {
    if (item) {
      this.stockItems.at(index).patchValue({
        product: item.id,
      });
      this.convertForm.updateValueAndValidity();
    } else {
      this.stockItems.at(index).patchValue({
        product: -1,
      });
      this.convertForm.updateValueAndValidity();
    }
  }

  navigationOutOfComponent(type: ButtonNav): void {
    if (type === 'next') {
      this.submitted = true;
      this.addBulkProducts();
    } else {
      this.processService.navigateToStockListing();
    }
  }

  addMore(): void {
    this.stockItems.push(this.processService.convertStockForm());
    this.formValueChangesConvertStock(this.stockItems.value.length - 1);
    this.submitted = false;
  }

  removeField(index: number): void {
    this.stockItems.removeAt(index);
  }

  addBulkProducts(): void {
    const newProducts = this.stockItems.value.filter(
      (e: any) => e.product === -1
    );
    // verifying new products
    newProducts?.map((p: any) => {
      const found = this.products.find(
        list => list.name.toLowerCase() === p.productName.toLowerCase()
      );
      if (found) {
        const index = this.stockItems.value.findIndex(
          (el: any) => el.productName === p.productName
        );
        if (index > -1) {
          this.selectDestinationProduct(found, index);
        }
      }
    });

    if (newProducts.length) {
      const data = {
        supply_chain: this.stockService.supplyChainData(),
        products: newProducts.map((e: any) => e.productName),
      };
      const api = this.stockService
        .createProductBulk(data)
        .subscribe((res: any) => {
          this.patchBatchProducts(res.data.products);
        });
      this.pageApis.push(api);
    } else {
      this.formSubmit();
    }
  }

  patchBatchProducts(products: any[]): void {
    products.forEach(p => {
      const index = this.stockItems.value.findIndex(
        (el: any) => el.productName === p.name
      );
      if (index > -1) {
        this.selectDestinationProduct(p, index);
      }
    });
    this.formSubmit();
  }

  formSubmit(): void {
    if (this.convertForm.valid) {
      const { transactionDate } = this.convertForm.value;
      const destProdArr = this.stockItems.value.map((e: any) => {
        return e.productName;
      });
      this.processService.updateState({
        transactionDetails: this.convertForm.value,
        requestedData: null,
      });
      const destQuantity = this.stockItems.value
        .map((p: any) => parseFloat(p.quantity))
        .reduce((a: number, b: number) => a + b, 0);
      const uniqArr = Array.from(new Set(destProdArr));
      this.processService.updateSummaryData({
        ...this.processService.getSummaryData(),
        currentStep: StepValues.CLAIMS,
        destinationQuantity: destQuantity,
        destinationProducts: uniqArr,
        transactionDate,
      });
      this.nextPage.emit(true);
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
