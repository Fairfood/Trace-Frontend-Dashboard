/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Observable, Subject, takeUntil, tap } from 'rxjs';

import { ITableColumnHeader } from 'src/app/shared/configs/app.model';
import { LISTING_COLUMNS, LISTING_COLUMNS_INIT } from '../listing.constants';
import {
  IBatches,
  IStockTableRow,
  ITableAction,
  ITableFilterProps,
} from '../listing.model';

import { ListingStoreService } from '..';
import { IMPORTS } from './stock-table.config';
import { StockTableService } from './stock-table.service';
import { IPaginator } from 'fairfood-utils';

@Component({
  selector: 'app-stock-table',
  standalone: true,
  imports: IMPORTS,
  templateUrl: './stock-table.component.html',
  styleUrls: ['./stock-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockTableComponent implements OnChanges, OnDestroy {
  @Input() stocks: IStockTableRow[];
  @Input() dataLoading: boolean;
  @Input() tableLength: number;
  @Input() scrollValue: number;
  @Input() archivePage = false;

  @Output() rowSelection = new EventEmitter<ITableAction>();
  @Output() filterChanged = new EventEmitter();

  selectedBatchesOnly = false;
  displayedColumns: ITableColumnHeader[] = [];
  selectedStocks: IStockTableRow[] = [];
  selectAll$: Observable<boolean>;
  appliedFilterValues: ITableFilterProps;
  savedDataSource: IStockTableRow[];
  private destroy$ = new Subject<void>();
  selectOptions: string;

  constructor(
    public store: ListingStoreService,
    private service: StockTableService
  ) {
    this.selectAll$ = this.store.selectAll$;

    this.selectedStockItemInit();
    this.toggleViewSelected();
    this.tableFilterValueChanges();
    this.selectingOptionsSub();
  }

  /* istanbul ignore next */
  ngOnChanges(changes: SimpleChanges): void {
    const { stocks } = changes;
    if (!stocks?.firstChange && stocks?.currentValue) {
      const { currentValue } = stocks;
      if (this.selectedStocks.length) {
        this.stocks = this.service.preSelectStocks(
          currentValue,
          this.selectedStocks
        );
        const selectedCount = this.stocks.filter(
          (t: IStockTableRow) => t.select
        ).length;
        if (currentValue.length === selectedCount) {
          this.store.updateStateProp<boolean>('selectAll', true);
        } else {
          this.store.updateStateProp<boolean>('selectAll', false);
        }
      }
    }
    if (this.stocks?.length > 0) {
      this.displayedColumns = LISTING_COLUMNS_INIT;
    } else {
      this.displayedColumns = LISTING_COLUMNS;
    }
  }

  tableFilterValueChanges(): void {
    this.store.tableFilterValues$
      .pipe(
        takeUntil(this.destroy$),
        tap(res => {
          this.appliedFilterValues = res;
        })
      )
      .subscribe();

    this.store.toggle$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: boolean) => {
        if (!res) {
          this.scrollValue = this.tableLength - this.appliedFilterValues.limit;
        }
      },
    });
  }

  selectingOptionsSub(): void {
    this.store.selectOptions$
      .pipe(
        takeUntil(this.destroy$),
        tap(res => {
          this.selectOptions = res;
        })
      )
      .subscribe();
  }

  selectedStockItemInit(): void {
    this.store.selectedStockItems$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any[]) => {
        this.selectedStocks = res;
      },
    });
  }

  changeSelect(event: any, item: IStockTableRow): void {
    item.select = event.checked;
    if (event.checked) {
      item.quantityNeeded = item.quantityAvailable;
    } else {
      if (this.selectOptions === 'page') {
        this.store.updateStateProp<string>('selectingOptions', null);
        this.store.updateStateProp<boolean>('selectAll', false);
      }
      item.quantityNeeded = null;
    }
    this.addSelectedStock(item);
  }

  /**
   * Selected stocks is an array to keep track of the user selection
   * @param stock any
   */
  addSelectedStock(stock: IStockTableRow): void {
    const index = this.selectedStocks.findIndex(e => e.itemId === stock.itemId);
    let stocks: IStockTableRow[] = [];
    if (index > -1) {
      stocks = this.selectedStocks?.filter(e => e.itemId !== stock.itemId);
    } else {
      stocks = [...this.selectedStocks, stock];
    }
    const { itemId, quantityNeeded } = stock;
    const batch = {
      batch: itemId,
      quantity: quantityNeeded,
    };
    if (this.selectOptions === 'all') {
      this.resetSelectEntireListWhenUnselecting();
    }
    this.checkForSelectAll();
    this.service.modifyBatchArray(batch);
    this.service.selectStockAction(stocks);
    if (!stocks.length && this.selectedBatchesOnly) {
      this.store.updateStateProp<boolean>('viewSelected', false);
    }
  }

  /**
   * When user unselects a batch, the entire list should be unselected
   * and the summary should be updated with current selected batches only
   */
  resetSelectEntireListWhenUnselecting(): void {
    const resultBatches: IBatches[] = this.selectedStocks.map(b => {
      return {
        batch: b.itemId,
        quantity: b.quantityNeeded,
      };
    });
    this.store.updateStateProp<IBatches[]>('batches', resultBatches);
    this.store.updateStateProp<string>('selectingOptions', null);
    this.store.updateStateProp<boolean>('selectAll', false);
  }

  /**
   * When current page is selected, and user unselect a batch
   * Then select all should be unselected
   * If user again selects a batch, then check for select all should be enabled or not
   */
  checkForSelectAll(): void {
    const selectedCount = this.stocks?.filter(
      (t: IStockTableRow) => t.select
    ).length;
    if (this.stocks?.length === selectedCount) {
      this.store.updateStateProp<boolean>('selectAll', true);
      this.store.updateStateProp<string>('selectingOptions', 'page');
    } else {
      this.store.updateStateProp<boolean>('selectAll', false);
    }
  }

  updateQuantityValue(item: IStockTableRow): void {
    this.service.updateQuanityNeeded(this.selectedStocks, item);
  }

  radioButtonChanged(event: any): void {
    this.store.updateStateProp<string>('selectingOptions', event.value);
    if (event.value === 'page') {
      this.rowSelection.emit({
        action: 'page',
        data: 'all',
      });
    } else {
      this.rowSelection.emit({
        action: 'all',
        data: 'all',
      });
    }
    this.stocks = this.stocks.map((stock: any) => {
      stock.quantityNeeded = stock.quantityAvailable;
      this.service.updateQuanityNeeded(this.selectedStocks, stock);
      return stock;
    });
  }

  clearPageSelection(): void {
    if (this.selectOptions === 'all') {
      this.rowSelection.emit({
        action: 'all',
        data: 'none',
      });
    } else {
      this.rowSelection.emit({
        action: 'page',
        data: 'none',
      });
    }
    this.store.updateStateProp<string>('selectingOptions', null);
  }

  sortData(column: string): void {
    if (!this.selectedBatchesOnly) {
      this.service.sortInit(column, this.appliedFilterValues);
      this.filterChanged.emit();
    }
  }

  toggleViewSelected(): void {
    this.store.viewSelectedToggle$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: boolean) => {
        if (res) {
          this.selectedBatchesOnly = true;
          this.savedDataSource = JSON.parse(JSON.stringify(this.stocks));
          this.stocks = this.selectedStocks;
        } else if (this.selectedBatchesOnly) {
          this.viewSelectedOff();
        }
      },
    });
  }

  viewSelectedOff(): void {
    this.selectedBatchesOnly = false;
    this.stocks = this.service.preSelectStocks(
      this.savedDataSource,
      this.selectedStocks
    );
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.service.updatePagination({
      limit,
      offset,
    });
    if (this.selectOptions === 'all') {
      this.filterChanged.emit('allPagination');
    } else {
      this.store.updateStateProp<string>('selectingOptions', null);
      this.filterChanged.emit('pagination');
    }
  }

  endOfListCondition(): boolean {
    if (this.scrollValue > 0) {
      return false;
    }
    return true;
  }

  clickAndLoadMore(): void {
    if (!this.endOfListCondition()) {
      this.scrollValue -= this.appliedFilterValues.limit;
      this.store.setScrollValue(this.scrollValue);
      this.paginatorEvent({
        limit: this.appliedFilterValues.limit,
        offset:
          this.appliedFilterValues.offset + this.appliedFilterValues.limit,
      });
    }
  }

  trackByFn(index: number, item: IStockTableRow): number {
    return item.stockId;
  }

  /**
   * Detail page navigation
   * @param item IStockTableRow
   */
  viewDetails(item: IStockTableRow): void {
    const limit = this.tableLength - this.scrollValue;
    const currentState = this.store.getCurrentState();
    currentState.tableProps.limit = limit;
    localStorage.setItem('listingState', JSON.stringify(currentState));
    this.service.viewDetails(item);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
