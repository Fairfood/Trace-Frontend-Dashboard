/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';
// services
import { StockProcessService } from '../stock-process.service';
import { StockService } from '../../stock.service';
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { CreateRequestService } from 'src/app/feature/requests/create-request';

// configs
import {
  BatchSummary,
  ButtonNav,
  CompanyData,
  StepValues,
  TransactionState,
} from '../process-stock.config';
import { ACTION_TYPE, UNITS } from 'src/app/shared/configs/app.constants';
import { ADDITIONAL_CONFIG } from './stock-send.config';
// components
import { CreateConnectionPopupComponent } from 'src/app/feature/connections/create-connection-popup';
import { ProcessStockCommonComponent } from '../process-stock-common.component';

@Component({
  selector: 'app-stock-send',
  templateUrl: './stock-send.component.html',
  styleUrls: ['./stock-send.component.scss'],
  standalone: true,
  imports: ADDITIONAL_CONFIG,
})
export class StockSendComponent
  extends ProcessStockCommonComponent
  implements OnInit, OnDestroy
{
  loaderText: string;
  sendForm: FormGroup;
  stockRequestLinked: boolean;
  companyFilterOptions: Observable<any>;
  autocompleteLoader = false;
  connectedList = true;
  // units = UNITS;
  maxDate = new Date();
  batchSummary: BatchSummary;
  linkedRequests: any[] = [];
  filterData: any[] = [];

  requestFilterOptions: Observable<any>;
  requestControl = new FormControl();
  linkedData: any;

  @Output() nextPage = new EventEmitter();
  @Output() disableNextTab = new EventEmitter();

  listingInfo: any;
  claimsInvalid: boolean;

  constructor(
    public dialog: MatDialog,
    public processService: StockProcessService,
    private utils: UtilService,
    private requestService: CreateRequestService
  ) {
    super();
    this.sendForm = this.processService.sendStockForm();
    this.nextButtonState = {
      action: 'init',
      disabled: true,
      currentStep: StepValues.TRANSACTION,
      buttonText: 'Continue',
    };
  }

  ngOnInit(): void {
    this.dataChanges();
    this.formChanges();
    this.companyDataSubscription();
    this.productSubscription(this.sendForm.controls);
    this.fetchTransparencyRequests();
    this.productNameChanges(this.sendForm.controls);
    // getting the listing page data
    this.listingInfo = this.processService.getListingInfo();
    if (this.listingInfo) {
      const { selectedStock } = this.listingInfo;
      if (selectedStock.length === 1) {
        this.ccontrol.productName.setValue(selectedStock[0].product);
        if (selectedStock[0].product.length < 3) {
          this.ccontrol.productName.markAsTouched();
        }
        this.ccontrol.product.setValue(selectedStock[0]?.productId);
        this.ccontrol.quantity.setValue(selectedStock[0].Quan_needed);
      }
    }
  }

  /**
   * Retaining the data when navigating between tabs
   */
  dataChanges(): void {
    // when navigating between tabs data should be retained
    const dataSub = this.processService
      .currentTransactionState()
      .subscribe((result: TransactionState) => {
        if (result) {
          const { transactionDetails, requestedData } = result;

          if (requestedData) {
            this.linkStockRequest(requestedData, transactionDetails);
            this.nextButtonState.disabled = false;
          } else {
            if (transactionDetails) {
              setTimeout(() => {
                this.sendForm.patchValue(transactionDetails);
              });
              this.nextButtonState.disabled = false;
            }
          }
        }
      });
    this.pageApis.push(dataSub);
  }

  formChanges(): void {
    const form = this.sendForm.statusChanges.subscribe(val => {
      this.nextButtonId = this.newProduct ? 'addProductId' : 'continueButton';
      this.nextButtonState = this.processService.stepOneFormChanges(
        this.newProduct,
        val,
        'Continue'
      );
    });
    this.pageApis.push(form);
  }

  /* istanbul ignore next */
  companyDataSubscription(): void {
    this.companyFilterOptions = this.ccontrol.name.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      startWith(''),
      map(val => val ?? ''),
      switchMap(value => {
        setTimeout(() => {
          this.autocompleteLoader = true;
        });

        return this.companyFilter(value);
      })
    );
  }

  /**
   * Filtering the companies from server. If the connected companies are empty while searching
   * Looks for not connected companies
   * @param keyword string
   * @returns any
   */
  /* istanbul ignore next */
  private companyFilter(keyword: string): any {
    return this.stockService.searchConnectedCompany(keyword, true).pipe(
      switchMap(result => {
        if (result.length === 0) {
          // if connected list is empty then checking for not connected companies
          return this.stockService.searchConnectedCompany(keyword, false).pipe(
            map(data => {
              // if both connected and not connected lists are empty showing error message not connected
              if (data.length === 0) {
                this.ccontrol.name.setErrors({ notConnected: true });
              }
              setTimeout(() => {
                this.connectedList = false;
              });
              return data;
            }),
            finalize(() => (this.autocompleteLoader = false))
          );
        } else {
          this.autocompleteLoader = false;
          this.connectedList = true;
          // inside switchmap need to return an observable
          return of(result);
        }
      })
    );
  }

  inviteConnectionPopup(companyData: any): void {
    const data = {
      stock: true,
      stockType: 'company',
      stockInvite: true,
      companyName: this.ccontrol.name.value,
      chainName: this.processService.fetchLocalItem('supplyChainName'),
      nodeId: this.processService.fetchLocalItem('companyID'),
      schainId: this.processService.fetchLocalItem('supplyChainId'),
      ...companyData,
    };
    this.openCreateConnectionPopup(data);
  }

  addCompanyPopup(): void {
    const data = {
      stock: true,
      stockType: 'company',
      stockInvite: false,
      companyName: this.ccontrol.name.value,
      chainName: this.processService.fetchLocalItem('supplyChainName'),
      nodeId: this.processService.fetchLocalItem('companyID'),
      schainId: this.processService.fetchLocalItem('supplyChainId'),
    };
    this.openCreateConnectionPopup(data);
  }

  /* istanbul ignore next */
  openCreateConnectionPopup(data: any): void {
    const dialogRef = this.dialog.open(CreateConnectionPopupComponent, {
      disableClose: true,
      minWidth: '42vw',
      maxWidth: '48vw',
      height: 'auto',
      data,
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.utils.customSnackBar(result.messageBody, result.message);
        if (result.message === ACTION_TYPE.SUCCESS) {
          this.sendForm.patchValue({
            node: result.responseData.id,
            name: result.params.name,
          });
          this.sendForm.updateValueAndValidity();
        } else {
          this.sendForm.patchValue({
            node: '',
            name: '',
          });
          this.ccontrol.name.setErrors({ notConnected: true });
          this.sendForm.updateValueAndValidity();
        }
      }
    });
  }

  /* istanbul ignore next */
  get ccontrol() {
    return this.sendForm.controls;
  }

  selectCompany(companyData: CompanyData): void {
    if (!companyData.connected) {
      this.inviteConnectionPopup(companyData);
    } else {
      this.sendForm.patchValue({
        node: companyData.id,
        name: companyData.name,
      });
      this.ccontrol.name.setErrors(null);
    }
  }

  /**
   * If the selected product is a new one adding it and continue to step 2
   */
  addNewProduct(): void {
    if (this.sendForm.valid) {
      // product_name formcontrol value is used
      const api = this.stockService
        .createProduct(this.ccontrol.productName.value)
        .subscribe({
          next: (data: any) => {
            if (data) {
              this.sendForm.patchValue({
                product: data.id,
              });
              this.formSubmit();
            }
          },
        });
      this.pageApis.push(api);
    }
  }

  formSubmit(): void {
    if (this.sendForm.valid) {
      this.processService.updateState({
        transactionDetails: this.sendForm.value,
        requestedData: this.stockRequestLinked ? this.linkedData : null,
      });
      const { quantity, productName, date, name } = this.sendForm.value;
      this.processService.updateSummaryData({
        ...this.processService.getSummaryData(),
        currentStep: StepValues.CLAIMS,
        totalQuantity: quantity,
        product: productName,
        transactionDate: date,
        companyName: name,
        requestLinked: this.stockRequestLinked,
        requestedData: this.stockRequestLinked ? this.linkedData : null,
      });
      this.nextPage.emit();
    }
  }

  /**
   * Requesting a stock
   */
  /* istanbul ignore next */
  fetchTransparencyRequests(): void {
    this.getProductsList();
    if (this.utils.linkedTransparencyRequestData) {
      this.linkedData = this.utils.linkedTransparencyRequestData;
      this.utils.linkedTransparencyRequestData = null;
      this.stockRequestLinked = true;
    } else {
      this.stockRequestLinked = false;
      const API_CALL = this.requestService
        .transparencyRequest(1)
        .subscribe((res: any) => {
          const { data } = res;
          this.linkedRequests = data?.results
            .filter((r: any) => r.status === 1)
            .map((r: any) => r);
          this.linkRequestSearchSubscription();
        });
      this.sendForm.updateValueAndValidity();
      this.pageApis.push(API_CALL);
    }
  }

  /* istanbul ignore next */
  linkRequestSearchSubscription(): void {
    this.requestFilterOptions = this.requestControl.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      startWith(''),
      map((value: string) => this.searchFilter(value || ''))
    );
  }

  /**
   * Searching inside linked stock request autocomplete
   * If search string is empty master list is updated as filter data
   * @param term string
   */
  searchFilter(term: string): any[] {
    if (!term) {
      return this.linkedRequests;
    }

    const lowerTerm = term.toLowerCase();
    return this.linkedRequests.filter(e => {
      const company = e.node.name.toLowerCase();
      const product = e.product.name.toLowerCase();
      const id = String(e.number);

      return (
        company.includes(lowerTerm) ||
        product.includes(lowerTerm) ||
        id.includes(lowerTerm)
      );
    });
  }

  linkStockRequest(reqData: any, transactionDetails?: any): void {
    this.linkedData = reqData;
    this.sendForm.patchValue({
      node: reqData.node?.id,
      name: reqData.node?.name,
      product: reqData?.product.id,
      productName: reqData?.product.name,
      quantity: reqData?.quantity,
    });
    if (transactionDetails) {
      const { date, sellerRefNo, buyerRefNo } = transactionDetails;
      this.sendForm.patchValue({
        date,
        sellerRefNo,
        buyerRefNo,
      });
    }
    this.sendForm.updateValueAndValidity();
    this.checkClaims();
    this.stockRequestLinked = true;
  }

  // claims related actions
  checkClaims(): void {
    if (this.listingInfo?.batches?.length) {
      const params = {
        transparency_request: this.linkedData?.id || null,
        batches: this.listingInfo.batches.map((e: any) => e.batch),
      };

      const API_CALL = this.requestService
        .verifyTransactionRequest(params)
        .subscribe((res: any) => {
          if (res.data.valid) {
            this.claimsInvalid = false;
            this.nextButtonState.disabled = false;
          } else {
            this.claimsInvalid = true;
            this.nextButtonState.disabled = true;
            this.disableNextTab.emit('disable');
          }
        });
      this.pageApis.push(API_CALL);
    }
  }

  removeStockRequest(): void {
    this.stockRequestLinked = false;
    this.linkedData = null;
    this.sendForm.patchValue({
      node: '',
      name: '',
      product: '',
      productName: '',
      quantity: null,
    });
    this.sendForm.updateValueAndValidity();
    this.claimsInvalid = false;
  }

  navigationOutOfComponent(type: ButtonNav): void {
    if (type === 'next') {
      this.submitted = true;
      if (this.newProduct) {
        this.addNewProduct();
      } else {
        this.formSubmit();
      }
    } else {
      this.processService.navigateToStockListing();
      this.resetNewProduct();
    }
  }
}
