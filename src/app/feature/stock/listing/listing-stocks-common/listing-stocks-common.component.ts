/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
// components
import { StockTableComponent } from '../stock-table';
import { ListingActionComponent } from '../listing-action';
import { ListingFiltersComponent } from '../listing-filters';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
// constants and models
import {
  INIT_FILTERS,
  INIT_FILTERS_ARCHIVE,
  RESET_FILTER,
  RESET_FILTER_ARCHIVE,
  SEARCHBY_OPTIONS_STOCK,
  TABLE_FILTER_PROPS,
} from '../listing.constants';
import {
  IBatches,
  IFilterParams,
  IFilterToggleItems,
  IListingAPIResponse,
  IStockTableRow,
  ITableAction,
  ITableFilterProps,
} from '../listing.model';
import {
  exportFileType,
  exportType,
} from 'src/app/shared/configs/app.constants';
// services
import { ListingStoreService } from '../listing-store.service';
import { ListingService } from '../listing.service';
import { ExportService, UtilService } from 'src/app/shared/service';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-listing-stocks-common',
  standalone: true,
  imports: [
    CommonModule,
    StockTableComponent,
    ListingActionComponent,
    SearchBoxComponent,
    ListingFiltersComponent,
  ],
  template: '',
})
export class ListingStocksCommonComponent implements OnInit {
  stocks: IStockTableRow[];
  dataLoading = true;
  tableLength: number;
  selectedStocks: IStockTableRow[];
  remainingItems: number;
  entireListFilter: IFilterParams;
  searchOptions = SEARCHBY_OPTIONS_STOCK;
  toggleFilter: boolean;
  clearSearch = false;
  scrollValue = 0;
  pageApis: Subscription[] = [];
  archivePage = false;
  appliedFilterValues: IFilterParams;
  destroy$ = new Subject<void>();

  constructor(
    private service: ListingService,
    public store: ListingStoreService,
    private util: UtilService,
    private exportService: ExportService,
    private router: Router
  ) {
    this.archivePage = this.router.url.includes('archive-stocks');
  }

  ngOnInit(): void {
    // this.clearAndResetToDefault()
    this.initSubscription();
    this.getClaimData();
    this.exportSubscription();
  }

  /* istanbul ignore next */
  exportSubscription(): void {
    const sub = this.service.exportIconClicked().subscribe(res => {
      if (res) {
        this.exportData();
      }
    });
    this.pageApis.push(sub);
  }

  /* istanbul ignore next */
  exportData(): void {
    const params = this.service.formatFilterParams({
      ...this.store.getFilterValues(),
      ...this.store.getTableProps(),
    });

    this.exportService.initExportData({
      export_type: exportType.STOCK,
      filters: JSON.stringify(params),
      file_type: exportFileType.EXCEL,
    });
  }

  getClaimData(): void {
    const api = this.service.getClaims().subscribe(() => {
      const filters = this.archivePage ? INIT_FILTERS_ARCHIVE : INIT_FILTERS;
      this.initApiCall(filters);
    });
    this.pageApis.push(api);
  }

  /**
   *
   * Type is optional used to determine if the call is for pagination or allPagination or sorting
   *
   * When sorting is called type is not passed so the stocks array is reset
   * Otherwise the stocks array is appended with the new data
   * @param filters IFilterParams
   * @param type string | optional
   */
  initApiCall(filters: IFilterParams, type?: string): void {
    // if type is pagination or allPaingation, append to the stocks array
    const listingState = localStorage.getItem('listingState');
    if (listingState) {
      const parsedData = JSON.parse(listingState);
      filters = {
        ...parsedData.filters,
        ...parsedData.tableProps, // Spread tableProps inside filters
      };
      parsedData.tableProps.offset = 0;
      filters.offset = 0;
      this.store.updateStateProp<boolean>('toggle', parsedData?.toggle);
      this.store.updateStateProp<IFilterToggleItems>(
        'filters',
        parsedData.filters
      );
      this.store.updateStateProp<ITableFilterProps>(
        'tableProps',
        parsedData.tableProps
      );
    } else {
      const sub4 = this.store.toggle$.subscribe((val: boolean) => {
        this.toggleFilter = val;
      });
      this.pageApis.push(sub4);
    }
    if (!type) {
      this.stocks = [];
    }
    // this.tableLength = 0;
    this.appliedFilterValues = filters;
    this.dataLoading = true;
    filters.archived = this.archivePage;
    const apiCall = this.service
      .searchStock(filters)
      .subscribe((res: IListingAPIResponse) => {
        const { count, results } = res;
        if (['pagination', 'allPagination'].includes(type)) {
          this.stocks = [...this.stocks, ...results];
        } else {
          this.stocks = results;
        }
        /**
         * If the call is for allPagination then select everything that is loaded in the page
         */
        if (type === 'allPagination') {
          this.selectCurrentPageItems('all');
        }
        this.tableLength = count;
        // used to limit the load more in the stock-table component
        this.scrollValue = count - filters.limit;
        this.dataLoading = false;
        this.store.updateStateProp<boolean>('selectAll', false);
        localStorage.removeItem('listingState');
        // this.store.updateStateProp<string>('selectingOptions', null);
      });
    this.pageApis.push(apiCall);
  }

  initSubscription(): void {
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationStart) {
        const nextRoute = event.url;
        console.log(nextRoute, nextRoute !== '/stock/listing');

        if (
          nextRoute !== '/stock/listing' &&
          !nextRoute.startsWith('/transaction-report/') &&
          nextRoute !== '/stock/archive-stocks'
        ) {
          localStorage.removeItem('listingState');
          this.clearAndResetToDefault();
        }
      }
    });
    // subscribe to the selected stock items. Can be updated from various components
    const sub1 = this.store.selectedStockItems$.subscribe({
      next: (res: any[]) => {
        this.selectedStocks = res;
      },
    });
    this.pageApis.push(sub1);
    // filter toggle subscription
    const listingState = localStorage.getItem('listingState');
    const parsedData = JSON.parse(listingState);
    const sub2 = this.store.toggle$.subscribe((val: boolean) => {
      this.toggleFilter = val || parsedData?.toggle;
    });
    this.pageApis.push(sub2);

    // if supply chain is changed reset everything and fetch new data with new supply chain
    const sub3 = this.util.supplyChainData$.subscribe((res: any) => {
      if (res) {
        this.stocks = [];
        this.store.resetState();
        // this.dataLoading = true;
        this.getClaimData();
      }
    });
    this.pageApis.push(sub3);
  }

  /**
   * Selection from the stock-table component checkbox
   * @param event ITableAction
   */
  rowSelectionCondition(event: ITableAction): void {
    const { action, data } = event;
    this.store.updateStateProp<boolean>('hideViewSelected', false);
    if (action === 'page') {
      if (data === 'all') {
        this.selectCurrentPageItems(action);
      } else {
        this.clearAndResetToDefault();
      }
    } else {
      this.store.updateStateProp<boolean>('hideViewSelected', false);
      if (data === 'none') {
        this.clearAndResetToDefault();
      } else {
        this.selectCurrentPageItems(action);
        this.store.updateStateProp<boolean>('hideViewSelected', true);
      }
    }
  }

  /**
   * Clear and reset to default state - clear selection is clicked
   */
  clearAndResetToDefault(): void {
    // this.dataLoading = true;
    const resetFilters = this.archivePage ? RESET_FILTER_ARCHIVE : RESET_FILTER;
    const filters = this.archivePage ? INIT_FILTERS_ARCHIVE : INIT_FILTERS;
    this.store.updateStateProp<boolean>('selectAll', false);
    this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
    this.store.updateStateProp<IBatches[]>('changedBatches', []);
    this.store.updateStateProp<IBatches[]>('batches', []);
    this.disableStockActions();
    this.store.updateStateProp<boolean>('toggle', false);
    this.store.updateStateProp<IFilterToggleItems>('filters', resetFilters);
    this.store.updateStateProp<ITableFilterProps>(
      'tableProps',
      TABLE_FILTER_PROPS
    );
    // this.scrollValue = 0;
    // this.store.setScrollValue(0)
    this.stocks = [];
    this.initApiCall(filters);
  }

  selectCurrentPageItems(action: string): void {
    // set select all checkbox to true
    this.store.updateStateProp<boolean>('selectAll', true);
    // updating all stocks in the page to selected
    this.stocks = this.stocks?.map(e => ({ ...e, select: true }));
    // removing duplicates
    const selectedStocks = this.service.removeDuplicates([
      ...this.stocks,
      ...this.store.getSelectedStocks(),
    ]);
    // updating selected stocks state. Used in multiple components
    this.store.updateStateProp<IStockTableRow[]>(
      'selectedStocks',
      selectedStocks
    );

    if (action === 'page') {
      const batches = selectedStocks.map(e => {
        return {
          batch: e.itemId,
          quantity: e.quantityNeeded,
        };
      });
      this.store.updateStateProp<IBatches[]>('batches', batches);
    } else {
      this.fetchSummaryData();
    }

    this.enableStockActions();
  }

  enableStockActions(): void {
    this.store.updateStateProp<boolean>('stockAction', true);
    this.store.updateStateProp<boolean>('enableSendStock', true);
  }

  disableStockActions(): void {
    this.store.updateStateProp<boolean>('stockAction', false);
    this.store.updateStateProp<boolean>('enableSendStock', false);
  }

  /**
   * Fetch summary data for the entire list with applied filters
   * Used to display the total quantity and number of batches
   * Current list selection is not considered
   */
  fetchSummaryData(): void {
    const api = this.service
      .getBatchSummary({
        ...this.store.getTableProps(),
        ...this.store.getFilterValues(),
      })
      .subscribe({
        next: (res: any) => {
          const { selected_batches } = res;
          this.store.updateStateProp<IBatches[]>('batches', selected_batches);
        },
      });
    this.pageApis.push(api);
  }

  searchFilter(data: string): void {
    this.store.updateStateProp<ITableFilterProps>(
      'tableProps',
      TABLE_FILTER_PROPS
    );
    this.store.updateStateProp<IFilterToggleItems>('filters', {
      ...this.store.getFilterValues(),
      searchString: data || '',
    });
    this.initApiCall({
      ...this.store.getTableProps(),
      ...this.store.getFilterValues(),
      searchString: data || '',
    });
  }

  /**
   * From the child component stock-table
   * When loadmore data is clicked or sorting is done
   * Filters are updated from the stock-table component
   * Call initiated via @Output event from stock-table
   * @param type string  | optional
   */
  /* istanbul ignore next */
  callStockApi(type?: string): void {
    // this.dataLoading = true;
    this.toggleFilter = false;
    this.store.updateStateProp<boolean>('viewSelected', false);
    this.initApiCall(
      {
        ...this.store.getTableProps(),
        ...this.store.getFilterValues(),
      },
      type
    );
  }

  handleSearchByOptionChange(option: any): void {
    const { id } = option;

    id == 'all' ? '' : (this.appliedFilterValues.searchBy = id);
    this.store.updateStateProp<ITableFilterProps>(
      'tableProps',
      TABLE_FILTER_PROPS
    );
    this.store.updateStateProp<IFilterToggleItems>('filters', {
      ...this.store.getFilterValues(),
      searchBy: id || '',
    });
    this.initApiCall({
      ...this.store.getTableProps(),
      ...this.store.getFilterValues(),
      searchBy: id || '',
    });
  }
}
