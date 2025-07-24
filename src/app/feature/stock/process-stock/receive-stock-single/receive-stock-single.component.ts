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
import { Observable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
// services
import { StockProcessService } from '../stock-process.service';
import { UtilService } from 'src/app/shared/service';
// configs
import {
  ButtonNav,
  StepValues,
  TransactionState,
} from '../process-stock.config';
import { ACTION_TYPE, UNITS } from 'src/app/shared/configs/app.constants';
import {
  RECEIVE_FORM,
  RECEIVE_STOCK_CONFIG,
} from './receive-stock-single.config';
import { CreateRequestComponent } from 'src/app/feature/requests/create-request';
import { ProcessStockCommonComponent } from '../process-stock-common.component';

@Component({
  selector: 'app-receive-stock-single',
  templateUrl: './receive-stock-single.component.html',
  styleUrls: ['./receive-stock-single.component.scss'],
  standalone: true,
  imports: RECEIVE_STOCK_CONFIG,
})
export class ReceiveStockSingleComponent
  extends ProcessStockCommonComponent
  implements OnInit, OnDestroy
{
  @Output() nextPage = new EventEmitter();
  @Output() disableNextTab = new EventEmitter();

  loaderText: string;
  farmerForm: FormGroup;
  farmerFilterOptions: Observable<any>;
  // units = UNITS;
  maxDate = new Date();
  claimsInvalid: boolean;
  farmerSearchLoader = false;
  newFarmer: boolean;
  farmers: any[];
  currencies: any[];
  selectedFile: any;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public processService: StockProcessService,
    private utils: UtilService
  ) {
    super();
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
    this.productSubscription(this.ccontrol);
    this.getAllFarmersList();
    this.setCurrencies();
    this.formChanges();
    this.dataPersistanceSub();
    this.productNameChanges(this.ccontrol);
  }

  /* istanbul ignore next */
  dataPersistanceSub(): void {
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
  }

  formChanges(): void {
    const form = this.farmerForm.statusChanges.subscribe(val => {
      const common = {
        currentStep: StepValues.TRANSACTION,
        buttonText: this.newProduct ? 'Add product & continue' : 'Continue',
      };
      /* istanbul ignore next */
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
  }

  /* istanbul ignore next */
  farmerDataSubscription(): void {
    this.farmerFilterOptions = this.ccontrol.name.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      startWith(''),
      map(val => val ?? ''),
      tap(value => {
        this.checkFarmerName(value);
      }),
      switchMap(value => {
        setTimeout(() => {
          this.farmerSearchLoader = true;
        });
        return this.farmerFilter(value);
      })
    );
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
          this.farmerForm.patchValue({
            currency: this.currencies[0].id,
          });
        } else {
          const found = res.find((f: any) => f.id === newFarmerId);
          if (found) {
            this.selectFarmer(found);
          }
        }
      });

    this.pageApis.push(API_CALL);
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
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

  /**
   * If the selected product is a new one adding it and continue to step 2
   */
  /* istanbul ignore next */
  addNewProduct(): void {
    if (this.farmerForm.valid) {
      // productName form control value is used
      const api = this.stockService
        .createProduct(this.ccontrol.productName.value)
        .subscribe({
          next: (data: any) => {
            if (data) {
              this.farmerForm.patchValue({
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
      this.nextPage.emit();
    }
  }

  setCurrencies(): void {
    const sub = this.global.glboalConstants$.subscribe({
      next: (res: any) => {
        this.currencies = res?.currencies;
      },
    });
    this.pageApis.push(sub);
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
  /* istanbul ignore next */
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
}
