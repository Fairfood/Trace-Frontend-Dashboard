import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// services
import { BaseStoreService } from 'src/app/shared/store';
// models and constants
import {
  IBatches,
  IFilterToggleItems,
  IListingState,
  IStockTableRow,
  ITableFilterProps,
} from './listing.model';
import { RESET_FILTER, TABLE_FILTER_PROPS } from './listing.constants';
import { ICommonObj } from 'src/app/shared/configs/app.model';

const initialState: IListingState = {
  filters: RESET_FILTER,
  tableProps: TABLE_FILTER_PROPS,
  selectAll: false,
  stockAction: false,
  selectedStocks: [],
  viewSelected: false,
  enableSendStock: false,
  toggle: false,
  claimData: [],
  selectingOptions: null,
  hideViewSelected: false,
  changedBatches: [],
  batches: [],
};

@Injectable({
  providedIn: 'root',
})
export class ListingStoreService extends BaseStoreService<IListingState> {
  private scrollValue = new BehaviorSubject<number>(0);
  scrollValue$ = this.scrollValue.asObservable();

  filterValues$: Observable<IFilterToggleItems> = this.select(
    (state: IListingState) => state.filters
  );

  tableFilterValues$: Observable<ITableFilterProps> = this.select(
    (state: IListingState) => state.tableProps
  );

  selectAll$: Observable<boolean> = this.select(
    (state: IListingState) => state.selectAll
  );

  selectedStockItems$: Observable<IStockTableRow[]> = this.select(
    (state: IListingState) => state.selectedStocks
  );

  stockAction$: Observable<boolean> = this.select(
    (state: IListingState) => state.stockAction
  );

  viewSelectedToggle$: Observable<boolean> = this.select(
    (state: IListingState) => state.viewSelected
  );

  sendStock$: Observable<boolean> = this.select(
    (state: IListingState) => state.enableSendStock
  );

  toggle$: Observable<boolean> = this.select(
    (state: IListingState) => state.toggle
  );

  claimMasterData$: Observable<Partial<ICommonObj>[]> = this.select(
    (state: IListingState) => state.claimData
  );

  selectOptions$: Observable<string | null> = this.select(
    (state: IListingState) => state.selectingOptions
  );

  hideViewSelected$: Observable<boolean> = this.select(
    (state: IListingState) => state.hideViewSelected
  );

  changedBatches$: Observable<IBatches[]> = this.select(
    (state: IListingState) => state.changedBatches
  );

  batches$: Observable<IBatches[]> = this.select(
    (state: IListingState) => state.batches
  );

  constructor() {
    super(initialState);
  }

  /* istanbul ignore next */
  updateStateProp<T>(key: string, value: T): void {
    this.setState({ [key]: value });
  }

  /* istanbul ignore next */
  getTableProps(): ITableFilterProps {
    return this.state.tableProps;
  }

  getFilterValues(): IFilterToggleItems {
    return this.state.filters;
  }

  getSelectedStocks(): IStockTableRow[] {
    return this.state.selectedStocks;
  }

  /* istanbul ignore next */
  resetState(): void {
    this.setState(initialState);
  }

  /* istanbul ignore next */
  getChangedBatches(): IBatches[] {
    return this.state.changedBatches;
  }

  /* istanbul ignore next */
  getBatches(): IBatches[] {
    return this.state.batches;
  }

  setScrollValue(value: any) {
    this.scrollValue.next(value);
  }

  getCurrentState(): IListingState {
    return this.state;
  }
}
