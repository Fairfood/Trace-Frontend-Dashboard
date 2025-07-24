/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
// config
import {
  ButtonNav,
  StepValues,
  TransactionState,
} from '../process-stock.config';
import { UNITS } from 'src/app/shared/configs/app.constants';
import { MERGE_CONFIG } from './stock-merge.config';
// services
import { StockProcessService } from '../stock-process.service';
import { ProcessStockCommonComponent } from '../process-stock-common.component';

@Component({
  selector: 'app-stock-merge',
  templateUrl: './stock-merge.component.html',
  styleUrls: ['./stock-merge.component.scss'],
  standalone: true,
  imports: MERGE_CONFIG,
})
export class StockMergeComponent
  extends ProcessStockCommonComponent
  implements OnInit
{
  @Output() nextPage = new EventEmitter();
  // units = UNITS;
  maxDate = new Date();
  mergeForm: FormGroup = this.processService.mergeStockForm();
  listingInfo: any;
  buttonConfiguration = {
    validText: 'Merge stock',
    addProduct: 'Add product & Merge stock',
  };

  constructor(public processService: StockProcessService) {
    super();
    this.nextButtonState = {
      action: 'init',
      disabled: true,
      currentStep: StepValues.TRANSACTION,
      buttonText: 'Merge stock',
    };
  }

  ngOnInit(): void {
    this.getProductsList('merge');
    this.productSubscription(this.mergeForm.controls);
    this.productNameChanges(this.mergeForm.controls);
    this.formChanges();
    this.dataChanges();
    this.listingInfo = this.processService.getListingInfo();
  }

  formChanges(): void {
    const form = this.mergeForm.statusChanges.subscribe(val => {
      this.nextButtonState = this.processService.stepOneFormChanges(
        this.newProduct,
        val,
        'Merge stock'
      );
    });
    this.pageApis.push(form);
  }

  dataChanges(): void {
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
  }

  get ccontrol() {
    return this.mergeForm.controls;
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
      this.resetNewProduct();
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
        .subscribe({
          next: (data: any) => {
            if (data) {
              this.mergeForm.patchValue({
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
      this.nextPage.emit();
    }
  }
}
