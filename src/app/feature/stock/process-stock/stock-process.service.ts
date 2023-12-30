/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// other services
import { StorageService } from 'src/app/shared/service';
import { NewConnectionFarmerService } from '../../connections/new-connection-farmer/';
// configs
import { quantityRegex } from 'src/app/shared/configs/app.constants';
import { StepValues, StockButtonState } from './process-stock.config';

@Injectable({
  providedIn: 'root',
})
export class StockProcessService {
  inProgressTransaction: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  transactionState: Record<string, any>;

  claimStateData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  claimState: Record<string, any>;

  listingInfo: any;
  summaryData: any;

  constructor(
    private router: Router,
    private storage: StorageService,
    private farmerService: NewConnectionFarmerService,
    private fb: FormBuilder
  ) {
    this.stockStateReset();
    this.claimStateReset();
    this.listingInfo = null;
    this.summaryData = null;
  }

  /**
   * Listing data like selected stock items batches product details
   * @param newData any
   */
  updateListingInfo(newData: any): void {
    this.listingInfo = newData;
  }

  getListingInfo(): any {
    return this.listingInfo;
  }

  /**
   * Summary section in each step
   */
  updateSummaryData(newData: any): void {
    this.summaryData = newData;
  }

  getSummaryData(): any {
    return this.summaryData;
  }

  stockStateReset(): void {
    this.transactionState = null;
  }

  currentTransactionState(): Observable<any> {
    return this.inProgressTransaction.asObservable();
  }

  emitNewTransactionState(): void {
    this.inProgressTransaction.next(this.transactionState);
  }

  updateState(value: any): void {
    this.transactionState = {
      ...value,
    };
    this.emitNewTransactionState();
  }

  /**
   * Claims have seperate state
   */

  claimStateReset(): void {
    this.claimState = {
      claimsList: [],
      companies: [],
    };
  }
  currentClaimState(): Observable<any> {
    return this.claimStateData.asObservable();
  }

  changeClaimData(): void {
    this.claimStateData.next(this.claimState);
  }

  updateClaimState(name: string, value: any): void {
    this.claimState = {
      ...this.claimState,
      [name]: value,
    };
    this.changeClaimData();
  }

  navigateToStockListing(): void {
    this.router.navigateByUrl('stock/listing');
    this.updateListingInfo(null);
    this.updateSummaryData(null);
    this.claimStateReset();
    this.changeClaimData();
    this.stockStateReset();
    this.emitNewTransactionState();
  }

  fetchCurrentUrl(): string {
    return this.router.url;
  }
  navigationFromComponent(url: any[]): void {
    this.router.navigate(url);
  }

  fetchLocalItem(key: string): string {
    return this.storage.retrieveStoredData(key);
  }

  navigateToAddFarmer(data: any): void {
    this.farmerService.connectionInfo$.next(data);
    this.router.navigateByUrl('connections/new-farmer');
  }

  sendStockForm(): FormGroup {
    return this.fb.group({
      node: ['', Validators.required],
      name: ['', Validators.required],
      type: [1],
      product: [''],
      productName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      quantity: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(11),
          Validators.pattern(quantityRegex),
        ],
      ],
      unit: ['1'],
      currency: [''],
      price: [null],
      supply_chain: [''],
      date: [new Date(), Validators.required],
      sellerRefNo: [''],
      buyerRefNo: [''],
    });
  }

  productNameValidation(value: string, products: any[]): any {
    let newProduct: boolean;
    if (value) {
      const found = products.find(
        (p: any) => p.name.toLowerCase() === value.toLowerCase()
      );
      if (found) {
        newProduct = false;
      } else {
        newProduct = true;
      }
    }
    return newProduct;
  }

  mergeStockForm(): FormGroup {
    return this.fb.group({
      type: [3],
      product: ['', Validators.required],
      productName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      quantity: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.pattern(quantityRegex),
        ],
      ],
      unit: ['1'],
      supply_chain: [''],
      date: [new Date(), Validators.required],
    });
  }

  stepOneFormChanges(
    newProduct: boolean,
    val: any,
    buttonText: string
  ): StockButtonState {
    const common = {
      currentStep: StepValues.TRANSACTION,
      buttonText: newProduct ? 'Add product & continue' : buttonText,
    };
    if (val === 'VALID') {
      if (!this.listingInfo) {
        return {
          ...common,
          disabled: true,
          action: 'invalid',
        };
      } else {
        return {
          ...common,
          disabled: false,
          action: 'valid',
        };
      }
    } else {
      return {
        ...common,
        disabled: true,
        action: 'invalid',
      };
    }
  }

  convertStockForm(): FormGroup {
    return this.fb.group({
      productName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      product: [''],
      quantity: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(11),
          Validators.pattern(quantityRegex),
        ],
      ],
      unit: ['1'],
      newProductMessage: [false],
    });
  }
}
