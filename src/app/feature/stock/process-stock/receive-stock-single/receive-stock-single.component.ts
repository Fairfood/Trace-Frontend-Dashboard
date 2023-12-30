/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
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
// configs
import {
  ButtonNav,
  StepValues,
  StockButtonState,
  TransactionState,
} from '../process-stock.config';
import { ACTION_TYPE, UNITS } from 'src/app/shared/configs/app.constants';
import { RECEIVE_FORM } from './receive-stock-single.config';
import { CreateRequestComponent } from 'src/app/feature/requests/create-request';

@Component({
  selector: 'app-receive-stock-single',
  templateUrl: './receive-stock-single.component.html',
  styleUrls: ['./receive-stock-single.component.scss'],
})
export class ReceiveStockSingleComponent implements OnInit, OnDestroy {
  @Output() nextPage = new EventEmitter();
  @Output() disableNextTab = new EventEmitter();

  loaderText: string;
  farmerForm: FormGroup;
  pageApis: Subscription[] = [];
  farmerFilterOptions: Observable<any>;
  productFilterOptions: Observable<any>;
  productLoader: boolean;
  units = UNITS;
  maxDate = new Date();
  submitted: boolean;
  newProduct: boolean;
  nextButtonState: StockButtonState;
  products: any;
  claimsInvalid: boolean;
  farmerSearchLoader = false;
  newFarmer: boolean;
  farmers: any[];
  currencies: any[];
  selectedFile: any;

  constructor(
    private stockService: StockService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private processService: StockProcessService,
    private globalStore: GlobalStoreService,
    private utils: UtilService
  ) {
    this.farmerForm = this.fb.group(RECEIVE_FORM);
    this.nextButtonState = {
      action: 'init',
      disabled: true,
      currentStep: StepValues.TRANSACTION,
      buttonText: 'Continue',
    };
  }

  ngOnInit(): void {
    this.farmerDataSubscription();
    this.productSubscription();
    this.getAllFarmersList();
    this.setCurrencies();
    // when navigating between tabs data should be retained
    const dataSub = this.processService
      .currentTransactionState()
      .subscribe((result: TransactionState) => {
        if (result) {
          const { transactionDetails } = result;
          if (transactionDetails) {
            setTimeout(() => {
              this.farmerForm.patchValue(transactionDetails);
            });
            this.nextButtonState.disabled = false;
          }
        }
      });
    this.pageApis.push(dataSub);

    const form = this.farmerForm.statusChanges.subscribe(val => {
      const common = {
        currentStep: StepValues.TRANSACTION,
        buttonText: this.newProduct ? 'Add product & continue' : 'Continue',
      };
      if (val === 'VALID') {
        this.nextButtonState = {
          ...common,
          disabled: false,
          action: 'valid',
        };
      } else {
        this.nextButtonState = {
          ...common,
          disabled: true,
          action: 'invalid',
        };
      }
    });
    this.pageApis.push(form);

    const change2 = this.ccontrol.productName.valueChanges
      .pipe(debounceTime(800), distinctUntilChanged())
      .subscribe(value => {
        if (value) {
          const found = this.products.find(
            (p: any) => p.name.toLowerCase() === value.toLowerCase()
          );
          if (found) {
            this.newProduct = false;
          } else {
            this.newProduct = true;
          }
        }
      });

    this.pageApis.push(change2);
  }

  farmerDataSubscription(): void {
    const change1 = this.farmerForm.controls.name.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(value => {
        // check if value is a valid farmer
        this.checkFarmerName(value);
      });

    this.pageApis.push(change1);

    this.farmerFilterOptions = this.ccontrol.name.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      startWith(''),
      map(val => val ?? ''),
      switchMap(value => {
        setTimeout(() => {
          this.farmerSearchLoader = true;
        });
        return this.farmerFilter(value);
      })
    );
  }

  private farmerFilter(name: string): any {
    return this.stockService
      .searchFarmer(name)
      .pipe(finalize(() => (this.farmerSearchLoader = false)));
  }

  /**
   * Create a new farmer connection
   */
  addConnection(newFarmer?: boolean): void {
    const data = {
      stock: true,
      farmerName: newFarmer ? this.ccontrol.name.value : '',
      chainName: this.processService.fetchLocalItem('supplyChainName'),
      nodeId: this.processService.fetchLocalItem('companyID'),
      schainId: this.processService.fetchLocalItem('supplyChainId'),
    };
    this.processService.navigateToAddFarmer(data);
  }

  get ccontrol() {
    return this.farmerForm.controls;
  }

  selectFarmer(farmer: any): void {
    this.farmerForm.patchValue({
      node: farmer.id,
      name: farmer.first_name + ' ' + farmer.last_name,
    });
    this.newFarmer = false;
  }

  /**
   * When user typing the name verifiying with existing farmers
   * @param value string
   */
  checkFarmerName(value: string) {
    if (value) {
      const found = this.farmers.find(p => {
        const farmerName = `${p.first_name} ${p.last_name}`;
        return value === farmerName;
      });
      if (!found) {
        this.newFarmer = true;
      } else {
        this.newFarmer = false;
      }
    } else {
      this.newFarmer = false;
    }
  }

  productSubscription(): void {
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

  selectProduct(item: any): void {
    if (item) {
      this.farmerForm.patchValue({
        product: item.id,
      });
      this.newProduct = false;
      this.nextButtonState.buttonText = 'Continue';
    } else {
      this.farmerForm.patchValue({
        product: -1,
      });
      this.newProduct = true;
      this.nextButtonState.buttonText = 'Add product & continue';
    }
  }

  /**
   * If the selected product is a new one adding it and continue to step 2
   */
  addNewProduct(): void {
    if (this.farmerForm.valid) {
      // productName form control value is used
      const api = this.stockService
        .createProduct(this.ccontrol.productName.value)
        .subscribe((res: any) => {
          if (res.success) {
            this.farmerForm.patchValue({
              product: res.data.id,
            });
            this.formSubmit();
          }
        });
      this.pageApis.push(api);
    }
  }

  formSubmit(): void {
    if (this.farmerForm.valid) {
      this.processService.updateState({
        transactionDetails: this.farmerForm.value,
        requestedData: null,
      });
      const { quantity, productName, date, name, currency, price } =
        this.farmerForm.value;
      this.processService.updateSummaryData({
        ...this.processService.getSummaryData(),
        currentStep: StepValues.CLAIMS,
        totalQuantity: quantity,
        product: productName,
        transactionDate: date,
        farmerName: name,
        currency,
        totalPrice: price,
      });
      this.nextPage.emit(true);
    }
  }

  setCurrencies(): void {
    const sub = this.globalStore.glboalConstants$.subscribe({
      next: (res: any) => {
        this.currencies = res?.currencies;
      },
    });
    this.pageApis.push(sub);
  }

  // get all available product list
  getProductsList(): void {
    const API_CALL = this.globalStore.supplychainProducts$.subscribe({
      next: (res: any) => {
        this.products = res;
        this.farmerForm.patchValue({
          currency: this.currencies[0].id,
        });
      },
      error: () => {
        this.products = [];
      },
    });
    this.pageApis.push(API_CALL);
  }

  /**
   * Connected farmers list
   */
  getAllFarmersList(isUpdateList?: boolean, newFarmerId?: any): void {
    const API_CALL = this.stockService
      .searchFarmer('')
      .subscribe((res: any) => {
        this.farmers = res;
        if (!isUpdateList) {
          this.loaderText = 'Loading products';
          this.getProductsList();
        } else {
          const found = res.find((f: any) => f.id === newFarmerId);
          if (found) {
            this.selectFarmer(found);
          }
        }
      });

    this.pageApis.push(API_CALL);
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
    }
  }

  fileUpload(event: any): void {
    this.ccontrol.receipt.setValue(event.target.files[0]);
  }

  removeFile(): void {
    this.ccontrol.receipt.setValue(null);
  }

  setCurrency(data: any): void {
    const selectedValue = data.id === 'All' ? '' : data.id;
    this.farmerForm.patchValue({
      currency: selectedValue,
    });
  }

  // If not stock is available or no connections are there
  requestStock(): void {
    const dialogRef = this.dialog.open(CreateRequestComponent, {
      width: '50vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.success) {
          const message = 'Request sent successfully';
          this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
          this.processService.navigationFromComponent([
            '/requests',
            2,
            result.data.id,
          ]);
        } else {
          const message = 'Failed to send request';
          this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
        }
      }
      localStorage.setItem('fromDashBoardRequest', '');
    });
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
