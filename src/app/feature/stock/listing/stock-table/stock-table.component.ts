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
import { LISTING_COLUMNS } from '../listing.constants';
import {
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

  @Output() rowSelection = new EventEmitter<ITableAction>();
  @Output() filterChanged = new EventEmitter();

  selectedBatchesOnly = false;
  displayedColumns: ITableColumnHeader[] = LISTING_COLUMNS;
  selectedStocks: IStockTableRow[] = [];
  selectAll$: Observable<boolean>;
  appliedFilterValues: ITableFilterProps;
  savedDataSource: IStockTableRow[];
  private destroy$ = new Subject<void>();
  hidePagination$: Observable<boolean>;
  selectingOptions$: Observable<string>;
  selectOptions: string;

  constructor(
    private store: ListingStoreService,
    private service: StockTableService
  ) {
    this.selectAll$ = this.store.selectAll$;

    this.selectedStockItemInit();
    this.toggleViewSelected();
    this.tableFilterValueChanges();
    this.hidePagination$ = this.store.hidePagination$;
    this.selectingOptions$ = this.store.selectOptions$.pipe(
      tap(res => {
        this.selectOptions = res;
      })
    );
  }

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
  }

  selectedStockItemInit(): void {
    this.store.selectedStockItems$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any[]) => {
        this.selectedStocks = res;
      },
    });
  }

  trackByFn(index: number, item: IStockTableRow): number {
    return item.stockId;
  }

  viewDetails(item: IStockTableRow): void {
    this.service.viewDetails(item);
  }

  changeSelect(event: any, item: IStockTableRow): void {
    item.select = event.checked;
    if (event.checked) {
      item.quantityNeeded = item.quantityAvailable;
    } else {
      item.quantityNeeded = null;
    }
    this.addSelectedStock(item);
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

      this.store.hidePagination$.next(false);
    } else {
      this.store.hidePagination$.next(true);
      this.rowSelection.emit({
        action: 'all',
        data: 'all',
      });
    }
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
    this.store.hidePagination$.next(false);
  }

  sortData(column: string): void {
    if (!this.selectedBatchesOnly) {
      this.service.sortInit(column, this.appliedFilterValues);
      this.filterChanged.emit();
    }
  }

  /**
   * Selected stocks is an array to keep track of the user selection
   * @param stock any
   */
  addSelectedStock(stock: any): void {
    const index = this.selectedStocks.findIndex(e => e.itemId === stock.itemId);
    let stocks: any[] = [];
    if (index > -1) {
      stocks = this.selectedStocks.filter(e => e.itemId !== stock.itemId);
    } else {
      stocks = [...this.selectedStocks, stock];
    }
    this.service.selectStockAction(stocks);
    if (!stocks.length && this.selectedBatchesOnly) {
      this.selectedBatchesOnly = false;
    }
  }

  toggleViewSelected(): void {
    this.store.viewSelectedToggle$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: boolean) => {
        if (res) {
          this.selectedBatchesOnly = true;
          this.savedDataSource = JSON.parse(JSON.stringify(this.stocks));
          this.stocks = this.selectedStocks;
          if (this.selectOptions !== 'all') {
            this.store.hidePagination$.next(true);
          }
        } else if (this.selectedBatchesOnly) {
          this.selectedBatchesOnly = false;
          this.stocks = this.service.preSelectStocks(
            this.savedDataSource,
            this.selectedStocks
          );
          if (this.selectOptions !== 'all') {
            this.store.hidePagination$.next(false);
          }
        }
      },
    });
  }

  paginatorEvent(data: IPaginator): void {
    this.store.updateStateProp<string>('selectingOptions', null);
    this.service.updatePagination(data);
    this.filterChanged.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
