/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
// services
import { BaseStoreService } from 'src/app/shared/store';
// models and constants
import {
  IFilterToggleItems,
  IListingState,
  IProgressBar,
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
  progressBarDetails: {
    progress: false,
    value: 0,
  },
  viewSelected: false,
  enableSendStock: false,
  toggle: false,
  claimData: [],
  selectingOptions: null,
};

@Injectable({
  providedIn: 'root',
})
export class ListingStoreService extends BaseStoreService<IListingState> {
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

  progressBarData$: Observable<IProgressBar> = this.select(
    (state: IListingState) => state.progressBarDetails
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

  hidePagination$: Subject<boolean> = new Subject<boolean>();

  selectOptions$: Observable<string | null> = this.select(
    (state: IListingState) => state.selectingOptions
  );

  constructor() {
    super(initialState);
  }

  updateStateProp<T>(key: string, value: T): void {
    this.setState({ [key]: value });
  }

  getTableProps(): ITableFilterProps {
    return this.state.tableProps;
  }

  getFilterValues(): IFilterToggleItems {
    return this.state.filters;
  }

  getSelectedStocks(): IStockTableRow[] {
    return this.state.selectedStocks;
  }

  resetState(): void {
    this.setState(initialState);
  }
}
