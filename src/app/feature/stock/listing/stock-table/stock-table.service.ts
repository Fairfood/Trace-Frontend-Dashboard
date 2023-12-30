import { Injectable } from '@angular/core';
import { ListingStoreService } from '..';
import { RouterService, UtilService } from 'src/app/shared/service';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { IStockTableRow, ITableFilterProps } from '../listing.model';
import { IPaginator } from 'fairfood-utils';

@Injectable({
  providedIn: 'root',
})
export class StockTableService {
  constructor(
    private store: ListingStoreService,
    private util: UtilService,
    private router: RouterService
  ) {}

  // navigating to stock detail
  viewDetails(data: any): void {
    if (!data.isExternal) {
      this.navigateToReport(data);
    } else {
      this.util.customSnackBar(
        'This is an external source. Not in trace!',
        ACTION_TYPE.FAILED
      );
    }
  }

  /**
   * Stock detail navigation
   * Stock detail page was there previously now it removed
   * @param data any
   */
  navigateToReport(data: any): void {
    if (data.from.toLowerCase() === 'purchased') {
      this.router.navigateArray([
        'transaction-report',
        'external',
        data.transactionId,
      ]);
    } else {
      this.router.navigateArray([
        'transaction-report',
        'internal',
        data.transactionId,
      ]);
    }
  }

  updateQuanityNeeded(data: IStockTableRow[], row: IStockTableRow): void {
    const foundIndex = data?.findIndex(m => m.itemId === row?.itemId);
    if (foundIndex !== -1) {
      data[foundIndex].quantityNeeded = row.quantityNeeded;
    }
    this.store.updateStateProp<IStockTableRow[]>('selectedStocks', [...data]);
    // check if at least one item is selected
    if (data.length > 0) {
      if (
        row.quantityNeeded > row.quantityAvailable ||
        row.quantityNeeded <= 0
      ) {
        this.store.updateStateProp<boolean>('enableSendStock', false);
      } else {
        this.store.updateStateProp<boolean>('enableSendStock', true);
      }
    } else {
      this.store.updateStateProp<boolean>('enableSendStock', false);
      this.store.updateStateProp<boolean>('stockAction', false);
    }
  }

  sortDataSetter(column: string): string {
    let sortByColumn = '';
    switch (column) {
      case 'number':
        sortByColumn = 'number';
        break;
      case 'product.name':
        sortByColumn = 'product.name';
        break;
      case 'created_on':
        sortByColumn = 'created_on';
        break;
      case 'initial_quantity':
        sortByColumn = 'initial_quantity';
        break;
      default:
        sortByColumn = 'created_on';
        break;
    }

    return sortByColumn;
  }

  preSelectStocks(
    data: IStockTableRow[],
    selectedStocks: IStockTableRow[]
  ): IStockTableRow[] {
    const result = data.map((item: IStockTableRow) => {
      const found = selectedStocks.find(
        (f: IStockTableRow) => f.itemId === item.itemId
      );
      if (found) {
        return {
          ...item,
          quantityNeeded: found.quantityNeeded,
          select: true,
        };
      }
      return {
        ...item,
        select: false,
      };
    });
    return result;
  }

  sortInit(column: string, appliedFilterValues: ITableFilterProps): void {
    const data = {
      orderBy: '',
      sortBy: this.sortDataSetter(column),
    };
    if (appliedFilterValues.sortBy === data.sortBy) {
      data.orderBy = appliedFilterValues.orderBy === 'asc' ? 'desc' : 'asc';
    } else {
      data.orderBy = 'asc';
    }
    this.store.updateStateProp<ITableFilterProps>('tableProps', {
      ...this.store.getTableProps(),
      ...data,
    });
  }

  selectStockAction(stocks: IStockTableRow[]): void {
    this.store.updateStateProp<boolean>('stockAction', stocks.length > 0);
    if (stocks.length) {
      this.store.updateStateProp<boolean>('enableSendStock', true);
    } else {
      this.store.updateStateProp<boolean>('enableSendStock', false);
    }
    this.store.updateStateProp<IStockTableRow[]>('selectedStocks', stocks);
  }

  updatePagination(paginationData: IPaginator): void {
    this.store.updateStateProp<boolean>('selectAll', false);
    this.store.updateStateProp<ITableFilterProps>('tableProps', {
      ...this.store.getTableProps(),
      ...paginationData,
    });
  }
}
