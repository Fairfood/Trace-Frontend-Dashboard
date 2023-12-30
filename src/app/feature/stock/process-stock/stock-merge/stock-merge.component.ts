/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';

import {
  ButtonNav,
  StepValues,
  StockButtonState,
  TransactionState,
} from '../process-stock.config';
import { UNITS } from 'src/app/shared/configs/app.constants';
// services
import { StockService } from '../../stock.service';
import { StockProcessService } from '../stock-process.service';
import { GlobalStoreService } from 'src/app/shared/store';
@Component({
  selector: 'app-stock-merge',
  templateUrl: './stock-merge.component.html',
  styleUrls: ['./stock-merge.component.scss'],
})
export class StockMergeComponent implements OnInit {
  @Output() nextPage = new EventEmitter();
  loader = true;
  units = UNITS;
  maxDate = new Date();
  mergeForm: FormGroup = this.processService.mergeStockForm();
  productLoader: boolean;
  productFilterOptions: Observable<any>;
  nextButtonState: StockButtonState;
  newProduct: boolean;
  pageApis: Subscription[] = [];
  listingInfo: any;
  products: any[];

  constructor(
    private processService: StockProcessService,
    private stockService: StockService,
    private globalStore: GlobalStoreService
  ) {
    this.nextButtonState = {
      action: 'init',
      disabled: true,
      currentStep: StepValues.TRANSACTION,
      buttonText: 'Merge stock',
    };
  }

  ngOnInit(): void {
    this.getProductsList();
    this.listingInfo = this.processService.getListingInfo();
    const form = this.mergeForm.statusChanges.subscribe(val => {
      this.nextButtonState = this.processService.stepOneFormChanges(
        this.newProduct,
        val,
        'Merge stock'
      );
    });
    const change2 = this.ccontrol.productName.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(value => {
        if (value) {
          const found = this.products.find(
            p => p.name.toLowerCase() === value.toLowerCase()
          );
          if (found) {
            this.newProduct = false;
          } else {
            this.newProduct = true;
          }
        }
      });

    // when navigating between tabs data should be retained
    const dataSub = this.processService
      .currentTransactionState()
      .subscribe((result: TransactionState) => {
        if (result) {
          const { transactionDetails } = result;

          if (transactionDetails) {
            setTimeout(() => {
              this.mergeForm.patchValue(transactionDetails);
            });
            this.nextButtonState.disabled = false;
          }
        }
      });
    this.pageApis.push(dataSub);
    this.pageApis.push(form);
    this.pageApis.push(change2);
  }

  // get all available product list
  getProductsList(): void {
    const API_CALL = this.globalStore.supplychainProducts$.subscribe({
      next: (res: any) => {
        this.products = res;
        this.productSubscription();
      },
      error: () => {
        this.products = [];
      },
    });
    this.pageApis.push(API_CALL);
  }

  productSubscription(): void {
    this.loader = false;
    this.productFilterOptions = this.ccontrol.productName.valueChanges.pipe(
      debounceTime(600),
      startWith(''),
      map(val => val ?? ''),
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

  get ccontrol() {
    return this.mergeForm.controls;
  }

  selectProduct(item: any): void {
    if (item) {
      this.mergeForm.patchValue({
        product: item.id,
      });
      this.newProduct = false;
      this.nextButtonState.buttonText = 'Merge stock';
    } else {
      this.mergeForm.patchValue({
        product: -1,
      });
      this.newProduct = true;
      this.nextButtonState.buttonText = 'Add product & Merge stock';
    }
  }

  navigationOutOfComponent(type: ButtonNav): void {
    if (type === 'next') {
      if (this.newProduct) {
        this.addNewProduct();
      } else {
        this.formSubmit();
      }
    } else {
      this.processService.navigateToStockListing();
    }
  }

  /**
   * If the selected product is a new one adding it and continue to step 2
   */
  addNewProduct(): void {
    if (this.mergeForm.valid) {
      // product_name formcontrol value is used
      const api = this.stockService
        .createProduct(this.ccontrol.productName.value)
        .subscribe((res: any) => {
          if (res.success) {
            this.mergeForm.patchValue({
              product: res.data.id,
            });
            this.formSubmit();
          }
        });
      this.pageApis.push(api);
    }
  }

  formSubmit(): void {
    if (this.mergeForm.valid) {
      this.processService.updateState({
        transactionDetails: this.mergeForm.value,
        requestedData: null,
      });
      const { quantity, productName, date } = this.mergeForm.value;
      this.processService.updateSummaryData({
        ...this.processService.getSummaryData(),
        currentStep: StepValues.SUMMARY,
        totalQuantity: quantity,
        product: productName,
        transactionDate: date,
      });
      this.nextPage.emit(true);
    }
  }
}
