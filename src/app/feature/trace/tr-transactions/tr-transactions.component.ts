/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

// services and configs
import { TraceStoreService } from '../trace-store.service';
import {
  ITransactionFilter,
  ITransactionList,
  TR_COLUMNS,
  TR_TYPES,
} from '../trace.config';
import { MatMenuTrigger } from '@angular/material/menu';
import { ITableColumnHeader } from 'src/app/shared/configs/app.model';

const defaultPagination = {
  offset: 0,
  limit: 10,
};

@Component({
  selector: 'app-tr-transactions',
  templateUrl: './tr-transactions.component.html',
  styleUrls: ['./tr-transactions.component.scss'],
})
export class TrTransactionsComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) dropdownMenuItem: MatMenuTrigger;

  displayedColumns: ITableColumnHeader[] = TR_COLUMNS;
  toggleFilter: boolean;
  tableLoading: boolean;
  tableCount: number;
  appliedFilterValues: ITransactionFilter;
  transactionTypes = TR_TYPES;
  actorData$: Observable<any[]> = this.store.actorsData$;
  productData$: Observable<any[]> = this.store.productData$;
  pageApis: Subscription[] = [];
  dataSource: any;

  constructor(private store: TraceStoreService) {
    this.tableCount = 0;
  }

  ngOnInit(): void {
    const sub1 = this.store.filterValues$.subscribe({
      next: (data: ITransactionFilter) => {
        this.appliedFilterValues = data;
      },
    });
    const sub2 = this.store.tableData$.subscribe({
      next: (res: ITransactionList) => {
        const { count, transactions, tableLoading } = res;
        this.tableLoading = tableLoading;
        this.tableCount = count;
        this.dataSource = transactions;
      },
    });
    this.pageApis.push(sub1);
    this.pageApis.push(sub2);
  }

  /**
   * Search data
   * @param data any
   */
  searchFilter(data: any): void {
    this.store.updateFilter({
      searchString: data,
      ...defaultPagination,
    });
    this.store.resetTableData();
    this.store.fetchActorTractions();
  }

  dateFilter(selected: any): void {
    this.store.updateFilter({
      selectedDate: selected,
      ...defaultPagination,
    });
    this.dropdownMenuItem.closeMenu();
    this.store.resetTableData();
    this.store.fetchActorTractions();
  }

  filterClicked(): void {
    this.toggleFilter = !this.toggleFilter;
    if (!this.toggleFilter) {
      this.resetFilter();
    }
  }

  resetFilter(): void {
    this.store.resetTransactionFilter();
    this.store.resetTableData();
    this.store.fetchActorTractions();
  }

  filterData(newValue: any, label: string): void {
    const selectedFilterValue = newValue.id === 'All' ? '' : newValue.id;
    switch (label) {
      case 'product':
        this.store.updateFilter({
          selectedProduct: selectedFilterValue,
          ...defaultPagination,
        });
        break;
      case 'actor':
        if (!selectedFilterValue) {
          const { actorId } = this.store.retrieveThemeAndBatch();
          this.store.updateFilter({
            selectedActor: actorId,
            ...defaultPagination,
          });
        } else {
          this.store.updateFilter({
            selectedActor: selectedFilterValue,
            ...defaultPagination,
          });
        }

        break;
      default:
        this.store.updateFilter({
          selectedType: selectedFilterValue,
          ...defaultPagination,
        });
        break;
    }
    this.store.resetTableData();
    this.store.fetchActorTractions();
  }

  paginatorEvent(data: any): void {
    const { limit, offset } = data;
    this.store.updateFilter({
      limit,
      offset,
      searchString: '',
    });

    this.store.resetTableData();
    this.store.fetchActorTractions();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
