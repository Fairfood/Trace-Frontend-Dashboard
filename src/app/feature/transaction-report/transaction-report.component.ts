/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
// configs
import {
  ITransactionDetail,
  STOCK_LOSS,
  TAB,
} from './transaction-report.config';
import { ICommonObj } from 'src/app/shared/configs/app.model';
// services
import { TransactionReportStoreService } from './transaction-report-store.service';
import { TransactionReportService } from './transaction-report.service';
import { TraceStoreService } from '../trace/trace-store.service';
import { UtilService } from 'src/app/shared/service';

import { TransactionActionsComponent } from '../transaction-actions';
import { ArchiveConfirmationPopupComponent } from 'src/app/shared/components/archive-confirmation-popup';
import { TransactionsService } from '../transactions';
import { Gs1PopupComponent } from './gs1-popup/gs1-popup.component';
import { ACTION_TYPE } from 'fairfood-utils';

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
  tabItems: ICommonObj[] = [];
  activeTab: string;
  transactionType: string;
  private ngUnsubscribe = new Subject<void>();
  batchData: any;
  gtinNumber: any;
  selectedClaim: any;

  constructor(
    public router: Router,
    public routes: ActivatedRoute,
    public transactionService: TransactionReportService,
    public dialog: MatDialog,
    private store: TransactionReportStoreService,
    private traceStore: TraceStoreService,
    private utils: UtilService,
    public trService: TransactionsService
  ) {
    this.theme = this.transactionService.getCiTheme();
  }

  ngOnInit(): void {
    this.initComponent();
    this.router.events.pipe(takeUntil(this.ngUnsubscribe)).subscribe(event => {
      if (event instanceof NavigationStart) {
        const nextRoute = event.url;
        if (
          nextRoute != '/archive-transactions' &&
          nextRoute != '/transactions'
        ) {
          this.trService.resetPaginationStateInternal();
          this.trService.resetPaginationState();
          this.trService.transactionType = 'external';
        }
      }
    });
  }

  initComponent(): void {
    this.memberType = +localStorage.getItem('memberType');
    const { id, transaction } = this.routes.snapshot.params;
    this.transactionType = transaction;
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

        this.gtinNumber = data?.gtin;
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

        this.batchData = batchId;
        if (data.badgeText !== 'Stock loss') {
          this.tabItems = TAB;
          this.traceStore.fetchMapInfo(this.theme, batchId);
          this.traceStore.setThemeBatch(this.theme, batchId);
        } else {
          this.tabItems = STOCK_LOSS;
        }
        const { storyTellingUrl, qrCodeValue } =
          this.transactionService.generateQrcode(
            this.batchData,
            data,
            this.gtinNumber
          );
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
  reloadDetails(event: { reload: boolean; currentClaim: any }): void {
    if (event?.reload) {
      this.pageLoader = true;
      this.getTransactionDetail(
        this.transactionData?.transaction,
        this.transactionData?.id
      );
      this.selectedClaim = event?.currentClaim;
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
      id: this.transactionData?.id,
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
        this.utils.transactionRejectMessage('success');
        this.router.navigateByUrl('/transactions');
      } else {
        this.utils.transactionRejectMessage('fail');
      }
    });
  }

  /**
   * The function `updateArchiveStatus` opens a dialog to confirm moving selected items to either
   * transaction history or archive list based on the type provided.
   */
  updateArchiveStatus(type: string): void {
    const data = {
      selected_items: [this.transactionData?.id],
      is_excluded: false,
      restore: type === 'transaction-list',
    };
    let dialogData;
    if (type === 'transaction-list') {
      dialogData = {
        title: 'Move to transaction history',
        text: 'Are you sure you want to move the selected item to the transaction history?',
        label: 'Once moved, you can access them from the transaction history.',
        type: 'transactions',
        params: data,
        transactionType: this.transactionType,
      };
    } else {
      dialogData = {
        title: 'Move to archive',
        text: 'Are you sure you want to move the selected item to the archive list?',
        label: 'Once moved, you can access them from the archive list.',
        type: 'transactions',
        params: data,
        transactionType: this.transactionType,
      };
    }

    const dialogRef = this.dialog.open(ArchiveConfirmationPopupComponent, {
      width: '35vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.initComponent();
      }
    });
  }

  updateGs1Info(type: string): void {
    if (!this.transactionData?.is_batch_editable) {
      this.utils.customSnackBar(
        'GS1 info cannot be modified for this transaction',
        ACTION_TYPE.FAILED
      );
    } else {
      const dialogRef = this.dialog.open(Gs1PopupComponent, {
        width: '500px',
        data: { id: this.batchData, type: type },
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.pageLoader = true;
          this.ngOnInit();
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
    this.traceStore.resetState();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
