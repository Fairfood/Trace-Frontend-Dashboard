/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ButtonNav,
  StepValues,
  StockButtonState,
  TransactionState,
} from '../process-stock.config';
import { StockProcessService } from '../stock-process.service';

@Component({
  selector: 'app-transaction-summary',
  templateUrl: './transaction-summary.component.html',
  styleUrls: ['./transaction-summary.component.scss'],
})
export class TransactionSummaryComponent implements OnInit, OnDestroy {
  @Output() nextPage = new EventEmitter();
  transactionSummary: any;
  claimList: any[];
  pageApis: Subscription[] = [];
  batchData: any[] = [];
  formData: any;
  nextButtonState: StockButtonState;
  checkFinalize: boolean;
  currentAction: string;

  constructor(private service: StockProcessService) {
    this.nextButtonState = {
      action: 'init',
      disabled: true,
      currentStep: StepValues.SUMMARY,
      buttonText: 'Finalize transaction',
    };
  }

  ngOnInit(): void {
    this.transactionSummary = this.service.getSummaryData();
    if (this.service.fetchCurrentUrl() === '/stock/process-convert') {
      this.currentAction = 'convert';
    } else if (this.service.fetchCurrentUrl() === '/stock/process-merge') {
      this.currentAction = 'merge';
    } else if (this.service.fetchCurrentUrl() === '/stock/stock-send') {
      this.currentAction = 'send';
    } else {
      this.currentAction = 'receive';
    }
    const listInfo = this.service.getListingInfo();
    this.batchData = listInfo?.selectedStock?.map((st: any) => {
      return `ST-${st.stockId} (${st.quantityAvailable} kg)`;
    });
    this.subscriptionsInit();
  }

  subscriptionsInit(): void {
    const dataSub = this.service.currentClaimState().subscribe(result => {
      if (result) {
        this.claimList = [];
        const { claimsList } = result;
        this.claimList = claimsList
          .filter((c: any) => c.selected)
          .map((c: any) => c.name);
      }
    });
    const transactionSub = this.service
      .currentTransactionState()
      .subscribe((result: TransactionState) => {
        if (result) {
          this.formData = result.transactionDetails;
        }
      });
    this.pageApis.push(transactionSub);
    this.pageApis.push(dataSub);
  }

  finalize(type: ButtonNav): void {
    this.nextPage.emit(type);
  }

  confirmTransaction(val: boolean): void {
    if (val) {
      this.nextButtonState.disabled = false;
    } else {
      this.nextButtonState.disabled = true;
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(sub => sub.unsubscribe());
  }
}
