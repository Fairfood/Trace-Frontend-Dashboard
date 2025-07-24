/* eslint-disable @typescript-eslint/no-explicit-any */
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
// services and other components
import { StockProcessService } from './process-stock';
import { RouterService } from 'src/app/shared/service';
import { ListingStoreService } from './listing/listing-store.service';
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { RouterModule } from '@angular/router';
import { ButtonsComponent } from 'fairfood-utils';
import { RESET_FILTER, TABLE_FILTER_PROPS } from './listing/listing.constants';
import {
  IStockTableRow,
  IBatches,
  IFilterToggleItems,
  ITableFilterProps,
} from './listing/listing.model';

/* istanbul ignore next */
const PAGE_HEADING = {
  list: '/stock/listing',
  receive: '/stock/receive-stock',
  send: '/stock/stock-send',
  convert: '/stock/process-convert',
  merge: '/stock/process-merge',
  receiveSingle: '/stock/receive',
  archiveStocks: '/stock/archive-stocks',
};

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ExportIconComponent,
    TranslateModule,
    RouterModule,
    ButtonsComponent,
  ],
})
export class StockComponent implements OnInit, OnDestroy {
  isListing: boolean;
  pageHeading: string;
  toggleHelp: boolean;
  sub: Subscription;
  archiveStocksPage = false;

  constructor(
    private routeService: RouterService,
    private processService: StockProcessService,
    private listingStore: ListingStoreService,
    private translate: TranslateService
  ) {}

  /* istanbul ignore next */
  ngOnInit(): void {
    this.sub = this.routeService.routeChangeSubject$.subscribe(url => {
      this.archiveStocksPage = false;
      switch (url) {
        case PAGE_HEADING.list:
          this.pageHeading = this.translate.instant('stock.listingHeading');
          break;
        case PAGE_HEADING.receive:
          this.pageHeading = this.translate.instant('stocks.receiveFromFarm');
          break;
        case PAGE_HEADING.send:
          this.pageHeading = this.translate.instant('button.sendStock');
          break;
        case PAGE_HEADING.convert:
          this.pageHeading = this.translate.instant('stock.convert');
          break;
        case PAGE_HEADING.receiveSingle:
          this.pageHeading = this.translate.instant('stock.receiveStock');
          break;
        case PAGE_HEADING.archiveStocks:
          this.archiveStocksPage = true;
          this.pageHeading = this.translate.instant('stock.listingHeading');
          break;
        default:
          this.pageHeading = this.translate.instant(
            'transaction.internalType3'
          );
          break;
      }
      if (url === PAGE_HEADING.list) {
        this.isListing = true;
      } else {
        this.isListing = false;
      }
    });
  }

  showHideHelp(): void {
    this.toggleHelp = !this.toggleHelp;
  }

  /* istanbul ignore next */
  resetStock(): void {
    if (this.processService.transactionState) {
      this.processService.stockStateReset();
      this.processService.emitNewTransactionState();
    }
    this.processService.claimStateReset();
    this.processService.changeClaimData();
    if (this.processService.listingInfo) {
      this.processService.updateListingInfo(null);
    }
    if (this.processService.summaryData) {
      this.processService.updateSummaryData(null);
    }
  }

  /**
   * The `goToPage` method in the `StockComponent` class is responsible for updating the state
   *  properties in the `listingStore` service and navigating to a specific page based on the `type`
   * parameter passed to the method.
   * @param type string
   */
  goToPage(type: string): void {
    localStorage.removeItem('listingState');
    this.listingStore.updateStateProp<boolean>('selectAll', false);
    this.listingStore.updateStateProp<IStockTableRow[]>('selectedStocks', []);
    this.listingStore.updateStateProp<IBatches[]>('changedBatches', []);
    this.listingStore.updateStateProp<IBatches[]>('batches', []);
    this.listingStore.updateStateProp<boolean>('toggle', false);
    this.listingStore.updateStateProp<IFilterToggleItems>(
      'filters',
      RESET_FILTER
    );
    this.listingStore.updateStateProp<ITableFilterProps>(
      'tableProps',
      TABLE_FILTER_PROPS
    );
    this.listingStore.updateStateProp<string>('selectingOptions', null);
    this.listingStore.updateStateProp<boolean>('viewSelected', false);
    if (type === 'archive') {
      this.routeService.navigateArray(['/stock/archive-stocks']);
    } else {
      this.routeService.navigateArray(['/stock/listing']);
    }
  }

  ngOnDestroy(): void {
    this.resetStock();
    this.listingStore.resetState();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
