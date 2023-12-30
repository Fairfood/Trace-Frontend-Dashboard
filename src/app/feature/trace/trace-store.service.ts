/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { IStage, ITransactionFilter, ITransactionList } from './trace.config';
import { environment } from 'src/environments/environment';
import { BaseStoreService } from 'src/app/shared/store/base-store.service';
import {
  convertDateStringToTimestamp,
  headerOptions,
} from 'src/app/shared/configs/app.methods';
import { HTTP_OPTION_3 } from 'src/app/shared/configs/app.constants';

const BASE_URL = environment.baseUrl;
interface ITransactionState {
  actors: any[];
  product: any[];
  transactionType: any[];
  appliedFilterValues: ITransactionFilter;
  tableData: ITransactionList;
  mapData: any[];
  stages: IStage;
  theme: string;
  batchId: string;
  selectedActorId: string;
}

const initialState: ITransactionState = {
  actors: [],
  product: [],
  transactionType: [],
  appliedFilterValues: {
    selectedProduct: '',
    selectedType: '',
    selectedDate: '',
    selectedActor: '',
    offset: 0,
    limit: 10,
    searchString: '',
  },
  tableData: {
    count: 0,
    transactions: [],
    tableLoading: true,
  },
  mapData: [],
  stages: {
    activeStage: 0,
    stageList: [],
  },
  theme: '',
  batchId: '',
  selectedActorId: '',
};

@Injectable({
  providedIn: 'root',
})
export class TraceStoreService extends BaseStoreService<ITransactionState> {
  actorsData$: Observable<any[]> = this.select(
    (state: ITransactionState) => state.actors
  ).pipe(shareReplay(2));

  mapCordinates$: Observable<any[]> = this.select(
    (state: ITransactionState) => state.mapData
  );

  transactionStages$: Observable<IStage> = this.select(
    (state: ITransactionState) => state.stages
  );

  productData$: Observable<any[]> = this.select(
    (state: ITransactionState) => state.product
  );

  tableData$: Observable<ITransactionList> = this.select(
    (state: ITransactionState) => state.tableData
  ).pipe(shareReplay(2));

  filterValues$: Observable<ITransactionFilter> = this.select(
    (state: ITransactionState) => state.appliedFilterValues
  );

  constructor(private http: HttpClient) {
    super(initialState);
  }

  // getting the current state filter snapshot
  getFilterValueSnapshot(): ITransactionFilter {
    return this.state.appliedFilterValues;
  }

  updateActors(data: any[]): void {
    this.setState({
      actors: [...data],
    });
  }

  updateProducts(data: any[]): void {
    this.setState({
      product: [...data],
    });
  }

  // updating filter state
  updateFilter(filter: Partial<ITransactionFilter>): void {
    this.setState({
      appliedFilterValues: {
        ...this.state.appliedFilterValues,
        ...filter,
      },
    });
  }

  updateTableData(data: Partial<ITransactionList>): void {
    this.setState({
      tableData: {
        ...this.state.tableData,
        ...data,
      },
    });
  }
  updateMapData(data: any[]): void {
    this.setState({
      mapData: data,
    });
  }

  updateStages(activeStage: number, data?: any[]): void {
    if (data) {
      this.setState({
        stages: {
          activeStage,
          stageList: data,
        },
      });
    } else {
      this.setState({
        stages: {
          ...this.state.stages,
          activeStage,
        },
      });
    }
  }

  setActorId(actorId: string): void {
    this.setState({
      selectedActorId: actorId,
    });
  }

  setThemeBatch(theme: string, batchId: string): void {
    this.setState({
      theme,
      batchId,
    });
  }

  retrieveThemeAndBatch(): any {
    const theme = this.state.theme;
    const batchId = this.state.batchId;
    const actorId = this.state.selectedActorId;
    return {
      theme,
      batchId,
      actorId,
    };
  }

  resetTransactionFilter(): void {
    const { actorId } = this.retrieveThemeAndBatch();
    this.updateFilter({
      selectedProduct: '',
      selectedActor: actorId,
      selectedType: '',
      offset: 0,
      limit: 10,
      searchString: '',
      selectedDate: '',
    });
  }

  resetState(): void {
    this.setState(initialState);
  }
  resetTableData(): void {
    this.updateTableData({ tableLoading: true, count: 0, transactions: [] });
  }

  /**
   * API CALLS
   */

  fetchMapInfo(theme: string, id: string): void {
    this.http
      .get(
        `${BASE_URL}/products/map/${id}/report/?theme=${theme}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        tap((res: any) => {
          const { data, success } = res;
          if (success) {
            const { map } = data;
            this.updateMapData(map);
            return data;
          }
        })
      )
      .subscribe({
        next: () => {
          this.fetchTransactionStages(theme, id);
        },
        error: () => {
          this.fetchTransactionStages(theme, id);
        },
      });
  }

  fetchTransactionStages(theme: string, id: string): void {
    this.http
      .get(
        `${BASE_URL}/products/stage/${id}/report/?theme=${theme}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        tap((res: any) => {
          const { data, success } = res;
          if (success) {
            this.updateStages(data.length - 1, data);
          }
        })
      )
      .subscribe();
  }

  refactorDateTime(dateInput: any): any {
    const givenDate = new Date(dateInput);
    const currentDateTime = new Date().toLocaleString();
    const dateTimeString =
      givenDate.toLocaleDateString() + ' ' + currentDateTime.split(',')[1];

    return dateTimeString;
  }

  fetchActorTractions(): void {
    const {
      selectedProduct,
      selectedType,
      offset,
      limit,
      selectedActor,
      selectedDate,
      searchString,
    } = this.getFilterValueSnapshot();
    const { theme, batchId } = this.retrieveThemeAndBatch();
    let formattedDate: number;
    if (selectedDate) {
      const dateToFormat = this.refactorDateTime(selectedDate);
      formattedDate = convertDateStringToTimestamp(dateToFormat);
    }

    // product_name, type, date
    const url1 = `${BASE_URL}/products/transaction/${batchId}/report/?theme=${theme}&actor=${selectedActor}`;
    const url2 = `&product_name=${selectedProduct}&type=${selectedType}&offset=${offset}&limit=${limit}`;
    const url3 = `&date=${
      selectedDate ? formattedDate : ''
    }&search=${searchString}`;
    this.http
      .get(url1 + url2 + url3, headerOptions(HTTP_OPTION_3))
      .pipe(
        tap((res: any) => {
          const { data, success } = res;
          if (success) {
            const { count, transactions } = data;
            this.updateTableData({ count, transactions, tableLoading: false });
          }
        })
      )
      .subscribe();
  }
}
