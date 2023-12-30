/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
// components
import { StockTableComponent } from './stock-table';
import { ListingActionComponent } from './listing-action';
import { ListingFiltersComponent } from './listing-filters';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
// constants and models
import {
  ENTIRE_LIST_API_LIMIT,
  INIT_FILTERS,
  SEARCHBY_OPTIONS_STOCK,
} from './listing.constants';
import {
  IFilterParams,
  IListingAPIResponse,
  IStockTableRow,
  ITableAction,
} from './listing.model';
// services
import { ListingStoreService } from './listing-store.service';
import { ListingService } from './listing.service';
import { UtilService } from 'src/app/shared/service';

@Component({
  selector: 'app-listing',
  standalone: true,
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [
    CommonModule,
    StockTableComponent,
    ListingActionComponent,
    SearchBoxComponent,
    ListingFiltersComponent,
  ],
})
export class ListingComponent implements OnInit, OnDestroy {
  stocks: IStockTableRow[];
  dataLoading = true;
  tableLength: number;
  selectedStocks: IStockTableRow[];
  private destroy$ = new Subject<void>();
  remainingItems: number;
  entireListFilter: IFilterParams;
  searchOptions = SEARCHBY_OPTIONS_STOCK;
  toggleFilter: boolean;
  apiCallNumber = 0;
  clearSearch = false;
  constructor(
    private service: ListingService,
    private store: ListingStoreService,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    this.initSubscription();
    this.getClaimData();
  }

  getClaimData(): void {
    this.service
      .getClaims()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.initApiCall(INIT_FILTERS);
      });
  }

  initApiCall(filters: IFilterParams): void {
    this.stocks = [];
    this.tableLength = 0;
    this.service
      .searchStock(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: IListingAPIResponse) => {
        const { count, results } = res;
        this.stocks = results;
        this.tableLength = count;
        this.dataLoading = false;
      });
  }

  initSubscription(): void {
    this.store.selectedStockItems$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any[]) => {
        this.selectedStocks = res;
      },
    });

    this.store.toggle$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: boolean) => {
        this.toggleFilter = val;
      });

    this.util.supplyChainData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.dataLoading = true;
          this.getClaimData();
          this.store.resetState();
        }
      });
  }

  rowSelectionCondition(event: ITableAction): void {
    const { action, data } = event;
    if (action === 'page') {
      if (data === 'all') {
        this.selectCurrentPageItems();
      } else {
        this.clearCurrentPageItems();
      }
    } else {
      if (data === 'none') {
        this.clearAllSelectionAndReset();
      } else {
        this.selectEntireList();
      }
    }
  }

  clearAllSelectionAndReset(): void {
    this.dataLoading = true;
    this.store.updateStateProp<boolean>('selectAll', false);
    this.store.updateStateProp<boolean>('stockAction', false);
    this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
    this.stocks = [];
    this.initApiCall(INIT_FILTERS);
  }

  selectCurrentPageItems(): void {
    this.store.updateStateProp<boolean>('selectAll', true);
    this.stocks = this.stocks.map(e => ({ ...e, select: true }));
    const selectedStocks = this.service.removeDuplicates([
      ...this.stocks,
      ...this.store.getSelectedStocks(),
    ]);
    this.store.updateStateProp<IStockTableRow[]>(
      'selectedStocks',
      selectedStocks
    );
    this.store.updateStateProp<boolean>('stockAction', true);
    this.store.updateStateProp<boolean>('enableSendStock', true);
  }

  clearCurrentPageItems(): void {
    this.store.updateStateProp<boolean>('selectAll', false);
    this.stocks = this.stocks.map(e => ({ ...e, select: false }));
    this.store.updateStateProp<boolean>('stockAction', false);
    this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
  }

  selectEntireList(): void {
    this.service.resetBeforeEntireList();
    this.stocks = [];
    if (this.tableLength < ENTIRE_LIST_API_LIMIT) {
      this.entireListFilter = {
        ...this.store.getFilterValues(),
        ...this.store.getTableProps(),
        limit: this.tableLength,
      };
      this.remainingItems = this.tableLength;
    } else {
      this.entireListFilter = {
        ...this.store.getFilterValues(),
        ...this.store.getTableProps(),
        limit: ENTIRE_LIST_API_LIMIT,
      };
      this.remainingItems = this.tableLength;
    }
    this.selectStockAPICall();
  }

  selectStockAPICall(): void {
    if (this.remainingItems <= 0) {
      this.handleEndOfListSelection();
      return;
    }
    this.dataLoading = true;
    this.service
      .searchStock(this.entireListFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        this.handleAPICallResponse(res);
      });
  }

  handleEndOfListSelection(): void {
    this.service.updateProgressBarValue({
      value: 100,
      progress: false,
    });
    this.dataLoading = false;
    this.selectCurrentPageItems();
  }

  handleAPICallResponse(res: any): void {
    const { results, count } = res;
    this.tableLength = count;
    if (count >= 0) {
      this.stocks = [...this.stocks, ...results];
    }

    this.remainingItems -= ENTIRE_LIST_API_LIMIT;
    const calculatedItem = Math.floor(
      (this.remainingItems / this.tableLength) * 100
    );
    this.service.updateProgressBarValue({
      value: 100 - calculatedItem,
      progress: true,
    });
    this.entireListFilter.offset += ENTIRE_LIST_API_LIMIT;
    this.selectStockAPICall();
  }

  searchFilter(data: string): void {
    this.dataLoading = true;
    this.initApiCall({
      ...this.store.getTableProps(),
      ...this.store.getFilterValues(),
      searchString: data,
    });
  }

  callStockApi(): void {
    this.dataLoading = true;
    this.store.hidePagination$.next(false);
    this.store.updateStateProp<boolean>('viewSelected', false);
    this.initApiCall({
      ...this.store.getTableProps(),
      ...this.store.getFilterValues(),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.updateStateProp<boolean>('toggleFilter', false);
  }
}
