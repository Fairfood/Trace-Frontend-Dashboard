/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  Observable,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { GlobalStoreService } from 'src/app/shared/store';
import { StockService } from '../stock.service';
import { StockProcessService } from './stock-process.service';

import { StockButtonState } from './process-stock.config';
import { UNITS, UNIT_CARBON } from 'src/app/shared/configs/app.constants';

@Component({
  selector: 'app-process-stock-common',
  template: '',
  standalone: true,
})
export class ProcessStockCommonComponent {
  submitted: boolean;
  newProduct: boolean;
  pageApis: Subscription[] = [];
  products: any[] = [];
  productLoader: boolean;
  productFilterOptions: Observable<any>;
  nextButtonState: StockButtonState;
  buttonConfig = {
    validText: 'Continue',
    addProduct: 'Add product & continue',
  };
  nextButtonId = 'continueButton';
  loader = true;
  units = UNITS;

  protected global = inject(GlobalStoreService);
  protected stockService = inject(StockService);
  protected service = inject(StockProcessService);

  // get all available product list
  getProductsList(type?: 'convert' | 'merge'): void {
    const API_CALL = this.global.supplychainProducts$.subscribe({
      next: (res: any) => {
        this.products = res;
        if (type) {
          this.loader = false;
        }
      },
      error: () => {
        this.products = [];
      },
    });
    this.pageApis.push(API_CALL);
  }

  /* istanbul ignore next */
  productSubscription(control: any): void {
    this.productFilterOptions = control.productName.valueChanges.pipe(
      debounceTime(600),
      startWith(''),
      map(val => val ?? ''),
      switchMap((value: string) => {
        setTimeout(() => {
          this.productLoader = true;
        });
        return this.productFilter(value);
      }),
      tap((options: any[]) => {
        const hasCarbonToken = options.some(option => option.unit === 3);
        this.units = hasCarbonToken
          ? (this.units = UNIT_CARBON)
          : (this.units = UNITS);
      })
    );
  }

  /* istanbul ignore next */
  productFilter(keyword: string): any {
    return this.stockService
      .searchProduct(keyword)
      .pipe(finalize(() => (this.productLoader = false)));
  }

  /**
   * When the product name is changed checking for the product name is already exists
   */
  productNameChanges(control: any): void {
    const change2 = control.productName.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe((value: string) => {
        this.newProduct = this.service.productNameValidation(
          value,
          this.products
        );
      });

    this.pageApis.push(change2);
  }

  selectProduct(
    item: any,
    form: FormGroup,
    buttonConfig: {
      validText: string;
      addProduct: string;
    }
  ): void {
    const { validText, addProduct } = buttonConfig;
    if (item) {
      form.patchValue({
        product: item.id,
      });
      this.newProduct = false;
      this.nextButtonState.buttonText = validText;
    } else {
      form.patchValue({
        product: -1,
      });
      this.newProduct = true;
      this.nextButtonState.buttonText = addProduct;
    }
  }

  /* istanbul ignore next */
  trackByFn(index: number): number {
    return index;
  }

  /* istanbul ignore next */
  resetNewProduct(): void {
    this.newProduct = false;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
