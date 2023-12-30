/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterService } from 'src/app/shared/service';
import { StockProcessService } from './process-stock';
import { ListingStoreService } from './listing/listing-store.service';

const PAGE_HEADING = {
  list: {
    url: '/stock/listing',
    label: 'Stock list',
  },
  receive: {
    url: '/stock/receive-stock',
    label: 'Receive from farm',
  },
  send: {
    url: '/stock/stock-send',
    label: 'Send stock',
  },
  convert: {
    url: '/stock/process-convert',
    label: 'Convert stock',
  },
  merge: {
    url: '/stock/process-merge',
    label: 'Merge stock',
  },
  receiveSingle: {
    url: '/stock/receive',
    label: 'Receive stock',
  },
};

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent implements OnInit, OnDestroy {
  isListing: boolean;
  pageHeading: string;
  toggleHelp: boolean;
  sub: Subscription;

  constructor(
    private routeService: RouterService,
    private processService: StockProcessService,
    private listingStore: ListingStoreService
  ) {}

  ngOnInit(): void {
    this.sub = this.routeService.routeChangeSubject$.subscribe(url => {
      switch (url) {
        case PAGE_HEADING.list.url:
          this.pageHeading = PAGE_HEADING.list.label;
          break;
        case PAGE_HEADING.receive.url:
          this.pageHeading = PAGE_HEADING.receive.label;
          break;
        case PAGE_HEADING.send.url:
          this.pageHeading = PAGE_HEADING.send.label;
          break;
        case PAGE_HEADING.convert.url:
          this.pageHeading = PAGE_HEADING.convert.label;
          break;
        case PAGE_HEADING.receiveSingle.url:
          this.pageHeading = PAGE_HEADING.receiveSingle.label;
          break;
        default:
          this.pageHeading = PAGE_HEADING.merge.label;
          break;
      }
      if (url === PAGE_HEADING.list.url) {
        this.isListing = true;
      } else {
        this.isListing = false;
      }
    });
  }

  showHideHelp(): void {
    this.toggleHelp = !this.toggleHelp;
  }

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

  ngOnDestroy(): void {
    this.resetStock();
    this.listingStore.resetState();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
