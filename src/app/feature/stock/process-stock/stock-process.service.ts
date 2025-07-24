/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// other services
import { StorageService, UtilService } from 'src/app/shared/service';
import { NewConnectionFarmerService } from '../../connections/new-connection-farmer/';
// configs
import {
  ACTION_TYPE,
  quantityRegex,
} from 'src/app/shared/configs/app.constants';
import { StepValues, StockButtonState } from './process-stock.config';
import { TranslateService } from '@ngx-translate/core';

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
    private fb: FormBuilder,
    private util: UtilService,
    private translate: TranslateService
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

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  currentTransactionState(): Observable<any> {
    return this.inProgressTransaction.asObservable();
  }

  /* istanbul ignore next */
  emitNewTransactionState(): void {
    this.inProgressTransaction.next(this.transactionState);
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  currentClaimState(): Observable<any> {
    return this.claimStateData.asObservable();
  }

  /* istanbul ignore next */
  changeClaimData(): void {
    this.claimStateData.next(this.claimState);
  }

  /* istanbul ignore next */
  updateClaimState(name: string, value: any): void {
    this.claimState = {
      ...this.claimState,
      [name]: value,
    };
    this.changeClaimData();
  }

  /* istanbul ignore next */
  navigateToStockListing(): void {
    this.router.navigateByUrl('stock/listing');
    this.updateListingInfo(null);
    this.updateSummaryData(null);
    this.claimStateReset();
    this.changeClaimData();
    this.stockStateReset();
    this.emitNewTransactionState();
  }

  /* istanbul ignore next */
  fetchCurrentUrl(): string {
    return this.router.url;
  }
  /* istanbul ignore next */
  navigationFromComponent(url: any[]): void {
    this.router.navigate(url);
  }

  /* istanbul ignore next */
  fetchLocalItem(key: string): string {
    return this.storage.retrieveStoredData(key);
  }

  /* istanbul ignore next */
  navigateToAddFarmer(data: any): void {
    this.farmerService.connectionInfo$.next(data);
    this.router.navigateByUrl('connections/new-farmer');
  }
  /* istanbul ignore next */
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
    let newProduct = false;
    if (value) {
      const found = products.find(
        (p: any) => p.name.toLowerCase() === value.toLowerCase()
      );
      if (!found) {
        newProduct = true;
      }
    }
    return newProduct;
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  transactionCreated(actionUrl: string): void {
    if (actionUrl === '/stock/stock-send') {
      this.util.customSnackBar(
        this.translate.instant('processStock.sentSuccess'),
        ACTION_TYPE.SUCCESS
      );
    } else if (actionUrl === '/stock/process-convert') {
      this.util.customSnackBar(
        this.translate.instant('processStock.processSuccess'),
        ACTION_TYPE.SUCCESS
      );
    } else if (actionUrl === '/stock/process-merge') {
      this.util.customSnackBar(
        this.translate.instant('processStock.mergeSuccess'),
        ACTION_TYPE.SUCCESS
      );
    } else {
      this.util.customSnackBar(
        this.translate.instant('processStock.receiveSuccess'),
        ACTION_TYPE.SUCCESS
      );
    }
    this.navigateToStockListing();
  }

  createExternalParams(fnParms: any): any {
    const { formData, batches, changedBatches } = fnParms;
    const summary = this.getSummaryData();
    const {
      node,
      date,
      type,
      product,
      unit,
      price,
      quantity,
      sellerRefNo,
      buyerRefNo,
    } = formData;

    const params: any = {
      node,
      created_on: Math.floor(new Date(date).getTime() / 1000),
      type,
      product,
      quantity,
      unit,
      price,
      select_all_batches: summary.selectAll,
      buyer_ref_number: buyerRefNo,
      seller_ref_number: sellerRefNo,
      batches: summary.selectAll ? changedBatches : batches,
      supply_chain: this.storage.retrieveStoredData('supplyChainId'),
    };
    return params;
  }
}
