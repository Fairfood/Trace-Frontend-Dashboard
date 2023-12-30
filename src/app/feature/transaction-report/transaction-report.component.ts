/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
// configs
import {
  ITransactionDetail,
  STOCK_LOSS,
  TAB,
} from './transaction-report.config';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// services
import { TransactionReportStoreService } from './transaction-report-store.service';
import { TransactionReportService } from './transaction-report.service';
import { TraceStoreService } from '../trace/trace-store.service';
import { UtilService } from 'src/app/shared/service';

import { TransactionActionsComponent } from '../transaction-actions';

@Component({
  selector: 'app-transaction-report',
  templateUrl: './transaction-report.component.html',
  styleUrls: ['./transaction-report.component.scss'],
})
export class TransactionReportComponent implements OnInit, OnDestroy {
  pageLoader = true;
  memberType: any;
  pageApis: Subscription[] = [];
  transactionData: Partial<ITransactionDetail>;
  qrCodeValue: string;
  storyTellingUrl: string;
  rootUrl = window.location.origin;
  theme: string;
  tabItems: ICommonObj[];
  activeTab: string;

  constructor(
    public router: Router,
    public routes: ActivatedRoute,
    public transactionService: TransactionReportService,
    public dialog: MatDialog,
    private store: TransactionReportStoreService,
    private traceStore: TraceStoreService,
    private utils: UtilService
  ) {
    this.theme = this.transactionService.getCiTheme();
  }

  ngOnInit(): void {
    this.memberType = +localStorage.getItem('memberType');
    const { id, transaction } = this.routes.snapshot.params;
    if (transaction && id) {
      this.getTransactionDetail(transaction, id);
    } else {
      this.pageLoader = false;
    }

    this.activeTab = TAB[0].id;

    const sub1 = this.store.transactionDetails$.subscribe({
      next: (data: Partial<ITransactionDetail>) => {
        this.transactionData = data;
      },
    });
    this.pageApis.push(sub1);
  }

  /**
   * Calculate price
   * @param trData Partial<ITransactionDetail>
   */
  calculatePrice(trData: Partial<ITransactionDetail>): void {
    let totalPrice = trData?.premiums?.reduce((sum, val) => {
      return sum + val.amount;
    }, 0);
    let priceText: string;
    if (trData.price) {
      totalPrice += trData.price;
      priceText = `${totalPrice} ${trData.currency}`;
      trData.priceText = priceText;
    } else {
      trData.priceText = '-';
    }
    this.store.updateTransactionDetails(trData);
  }

  /**
   * Fetch data from API
   * @param transaction string
   * @param id string
   */
  getTransactionDetail(transaction: string, id: string): void {
    const api = this.transactionService
      .getInternalTransactionDetail(transaction, id)
      .subscribe((data: Partial<ITransactionDetail>) => {
        data.transaction = transaction;
        data.badgeText = this.transactionService.generateBatchText(
          data.transaction,
          data.type
        );

        let batchId: string;
        // external transaction
        if (data.transaction_type === 1) {
          batchId = data.destination_batches[0].id;
        } else {
          // loss stock type: 2
          if (data.type !== 2) {
            batchId = data.destination_products[0].id;
          }
          data.sourceProductNames = data.source_products
            ?.map((m: any) => m.name)
            ?.join(', ');
          data.destinationProductNames = data.destination_products
            ?.map((m: any) => m.name)
            ?.join(', ');
        }
        if (data.badgeText !== 'Stock loss') {
          this.tabItems = TAB;
          this.traceStore.fetchMapInfo(this.theme, batchId);
          this.traceStore.setThemeBatch(this.theme, batchId);
        } else {
          this.tabItems = STOCK_LOSS;
        }

        const { storyTellingUrl, qrCodeValue } =
          this.transactionService.generateQrcode(batchId, data);
        this.storyTellingUrl = storyTellingUrl;
        this.qrCodeValue = qrCodeValue;
        this.calculatePrice(data);
        this.pageLoader = false;
      });
    this.pageApis.push(api);
  }

  changeTab({ id }: ICommonObj): void {
    this.activeTab = id;
  }

  /**
   * Reload transaction details
   * @param reload boolean
   */
  reloadDetails(reload: boolean): void {
    if (reload) {
      this.pageLoader = true;
      this.getTransactionDetail(
        this.transactionData.transaction,
        this.transactionData.id
      );
    }
  }

  openStoryTelling(): void {
    window.open(this.storyTellingUrl, '_blank');
  }

  gotoClaimTab(): void {
    this.activeTab = TAB[2].id;
  }

  /**
   * Switch to trace tab
   * @param data boolean
   */
  gotoTraceTab(data: boolean): void {
    if (data) {
      this.traceStore.updateStages(0);
      this.activeTab = TAB[1].id;
    }
  }
  /**
   * Reject transaction dialog
   */
  rejectTransactionDialog(): void {
    const data = {
      id: this.transactionData.id,
      type: 'reject',
    };
    const dialogRef = this.dialog.open(TransactionActionsComponent, {
      disableClose: true,
      width: '581px',
      height: 'auto',
      data,
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const message = 'Transaction rejected successfully';
        this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
        this.router.navigateByUrl('/transactions');
      } else {
        const message = 'Failed to reject transaction';
        this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
      }
    });
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
    this.traceStore.resetState();
  }
}
