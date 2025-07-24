/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';

// configs
import {
  OPTIONS_NEEDED,
  STOCK_ACTIONS_LOSS,
  STOCK_ACTIONS_MERGED,
  STOCK_ACTIONS_PROCESSED,
  STOCK_ACTION_TYPES,
  TRANSACTION_COLUMNS,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_FILTER,
} from '../transactions.constants';

import {
  IAddionalFilter,
  ICommonAPIResponse,
  ICommonIdName,
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';
import {
  FilterParams,
  IAppliedFilterTransaction,
  IStockActionTable,
  ITrListFilterMaster,
  ITransactionData,
} from '../transactions.model';
import { IPaginator } from 'fairfood-utils';
import { ITeamMember } from '../../company-profile/team-members/team-members.config';
import { getAdditionalFilters } from 'src/app/shared/configs/app.methods';
import { TR_IMPORTS } from '../transactions.config';

import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';
import { TransactionsService } from '../transactions.service';
import { GlobalStoreService } from 'src/app/shared/store';

import { TransactionActionsComponent } from '../../transaction-actions';
import { ArchiveConfirmationPopupComponent } from 'src/app/shared/components/archive-confirmation-popup';

@Component({
  selector: 'app-transactions-common',
  standalone: true,
  imports: [TR_IMPORTS],
  template: '',
})
export class TransactionsCommonComponent {
  transactionType = 'external';
  toggleFilter: boolean;
  availableFilters: IAddionalFilter[];

  // contains all the master data
  transactionListFilter: ITrListFilterMaster;
  pageApis: Subscription[] = [];
  appliedFilterValues: IAppliedFilterTransaction;
  dataLoading = true;
  dataSource: any[] = [];
  tableLength: number;
  displayedColumns: ITableColumnHeader[] = TRANSACTION_COLUMNS;
  transactionTypesOptions = TRANSACTION_TYPES;
  stockActionTypes = STOCK_ACTION_TYPES;
  byStockAction = 1;
  stockActionFilterValues: any;
  additionalColumns: IAddionalFilter[] = OPTIONS_NEEDED;
  exportText = 'Export';
  memberType: number;
  paginationReset: IPaginator;
  selectedItems: any[] = [];
  allSelected = false;
  selectedOption: any;
  entireListSelected = false;
  activeUrl = '';
  pageType = '';
  selectAllChecked = false;
  pageSelected: boolean;
  externalId$: Observable<boolean>;
  linkNavigate = false;
  linkConnect = false;
  customPageSize: { limit: any; offset: any };
  filters: any;

  ngUnsubscribe = new Subject<void>();
  filtersInternal: any;
  toggleFilterInternal: boolean;
  presetDate: {
    selectedType: number;
    selectedDate: Date;
    start: Date;
    end: Date;
  };

  constructor(
    public trService: TransactionsService,
    public routeService: RouterService,
    public utils: UtilService,
    public dialog: MatDialog,
    public global: GlobalStoreService,
    public router: Router,
    private storage: StorageService
  ) {
    this.byStockAction = this.trService.stockTransactionType;
    this.trService.paginationState$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(state => {
        if (this.trService.transactionType === 'external') {
          this.setFilters(state, 'external');
        }
      });

    this.trService.paginationStateInternal$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(state => {
        if (this.trService.transactionType === 'internal') {
          this.setFilters(state, 'internal');
        }
      });

    this.externalId$ = this.utils.externalId;
    this.linkNavigate =
      this.storage.retrieveStoredData('link_navigate') === 'true';
    this.linkConnect =
      this.storage.retrieveStoredData('link_connect') === 'true';
    this.activeUrl = this.router.url;
    this.transactionListFilter = {
      transactionFilterTypes: TRANSACTION_TYPE_FILTER,
      companyData: [],
      productData: [],
      teamMembers: [],
    };
    // this.additionalFilterSetting();
    this.memberType = +this.trService.memberType();
  }

  initCalls(type: string): void {
    this.pageType = type;
    // this.toggleFilter = false;
    this.dataLoading = true;
    this.displayedColumns = TRANSACTION_COLUMNS;
    this.transactionType = this.trService.transactionType;
    // this.additionalFilterSetting();
    this.getAllProductsList();
    this.loadCompany();
    if (this.trService.transactionType == 'internal') {
      this.resetStockActionFilterValues();
      this.constructingTableData();
    } else {
      this.resetFilter();
      this.loadMembers();
    }
  }

  resetFilter(searchString?: string): void {
    this.appliedFilterValues = this.filters;
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
    // this.appliedFilterValues.searchString = searchString || ''
    if (this.pageType == 'archived' && this.appliedFilterValues) {
      this.appliedFilterValues.archived = true;
    } else {
      this.appliedFilterValues.archived = false;
    }
  }

  /* istanbul ignore next */
  additionalFilterSetting(): void {
    const filterArray: IAddionalFilter[] = getAdditionalFilters(true);
    this.availableFilters = JSON.parse(JSON.stringify([...filterArray]));
  }
  /* istanbul ignore next */
  getAllProductsList(): void {
    const API_CALL = this.global.supplychainProducts$.subscribe({
      next: (res: ICommonObj[]) => {
        if (res) {
          this.transactionListFilter.productData = res;
        }
      },
    });
    this.pageApis.push(API_CALL);
  }
  /* istanbul ignore next */
  loadCompany(): void {
    const API_CALL = this.global.latestConnectionDetails$.subscribe({
      next: (res: ICommonObj[]) => {
        if (res) {
          this.transactionListFilter.companyData = res;
        }
      },
      error: () => {
        this.dataLoading = false;
      },
    });

    this.pageApis.push(API_CALL);
  }
  /* istanbul ignore next */
  loadMembers(): void {
    const API_CALL = this.trService
      .loadTeamMembers({
        limit: 100,
        offset: 0,
      })
      .subscribe((res: ICommonAPIResponse<ITeamMember>) => {
        const { results } = res;
        this.transactionListFilter.teamMembers = results?.map(
          (member: Partial<ITeamMember>) => {
            const { first_name, last_name, user_id } = member;
            return {
              id: user_id,
              name: `${first_name} ${last_name}`,
            };
          }
        );
        this.getTransactionHistory();
      });

    this.pageApis.push(API_CALL);
  }
  /* istanbul ignore next */
  getTransactionHistory(): void {
    this.dataLoading = true;
    this.dataSource = [];
    const api = this.trService
      .getTransactionHistory(this.appliedFilterValues)
      .subscribe((response: ICommonAPIResponse<ITransactionData>) => {
        const { count, results } = response;
        this.tableLength = count;
        this.dataLoading = false;
        const formatedData: any = this.trService.configureTableData(results);
        this.dataSource = formatedData || [];
        this.setSelecteItems();
      });
    this.pageApis.push(api);
  }

  /* istanbul ignore next */
  searchFilter(search: string): void {
    this.appliedFilterValues.limit = 10;
    this.appliedFilterValues.offset = 0;
    if (this.transactionType === 'external') {
      this.appliedFilterValues.searchString = search;
      // this.resetFilter(search);
      this.getTransactionHistory();
    } else {
      this.stockActionFilterValues.searchString = search;
      // this.resetStockActionFilterValues(search);
      this.loadInternalTransactions();
    }
    this.trService.setPaginationState(this.appliedFilterValues);
  }
  /* istanbul ignore next */
  resetStockActionFilterValues(searchString?: string): void {
    this.stockActionFilterValues = this.filtersInternal;
    this.customPageSize = {
      limit: this.stockActionFilterValues?.limit,
      offset: this.stockActionFilterValues?.offset,
    };
    // this.appliedFilterValues.searchString = searchString || ''
    if (this.pageType == 'archived' && this.stockActionFilterValues) {
      this.stockActionFilterValues.archived = true;
    } else {
      this.stockActionFilterValues.archived = false;
    }
  }
  /* istanbul ignore next */
  loadInternalTransactions(): void {
    this.dataLoading = true;
    this.dataSource = [];
    const api = this.trService
      .getStockactionsList(this.byStockAction, this.stockActionFilterValues)
      .subscribe(resposne => {
        const { count, results } = resposne;
        this.tableLength = count;
        const stockData: IStockActionTable[] =
          this.trService.configureInternalTransaction(
            results,
            this.byStockAction
          );
        this.dataSource = stockData || [];
        this.setSelecteItems();
        this.dataLoading = false;
      });
    this.pageApis.push(api);
  }
  /* istanbul ignore next */
  filterClicked(): void {
    this.toggleFilter = !this.toggleFilter;
    if (!this.toggleFilter) {
      this.trService.resetPaginationState();
      this.trService.resetPaginationStateInternal();
      this.additionalFilterSetting();
      if (this.transactionType === 'external') {
        this.resetFilter();
        this.getTransactionHistory();
      } else {
        this.resetStockActionFilterValues();
        this.loadInternalTransactions();
      }
    }
  }

  /* istanbul ignore next */
  filterTransactionList(selectedObj: any, label: string): void {
    // this.paginator.pageIndex = 0;
    // external and internal Transactions have diff API calls
    const selectedValue = selectedObj.id === 'All' ? '' : selectedObj.id;
    if (this.transactionType === 'external') {
      this.appliedFilterValues.limit = 10;
      if (this.pageType == 'archived' && this.appliedFilterValues) {
        this.appliedFilterValues.archived = true;
      } else {
        this.appliedFilterValues.archived = false;
      }
      this.appliedFilterValues.offset = 0;
      if (label === 'product') {
        this.appliedFilterValues.selectedProduct = selectedValue;
      } else if (label === 'company') {
        this.appliedFilterValues.selectedCompany = selectedValue;
      } else if (label === 'creator') {
        this.appliedFilterValues.creator = selectedValue;
      } else {
        this.appliedFilterValues.transactionType = selectedValue;
      }
      this.getTransactionHistory();
    } else {
      this.stockActionFilterValues.limit = 10;
      if (this.pageType == 'archived' && this.stockActionFilterValues) {
        this.stockActionFilterValues.archived = true;
      } else {
        this.stockActionFilterValues.archived = false;
      }
      this.stockActionFilterValues.offset = 0;
      if (label === 'destProduct') {
        this.stockActionFilterValues.selectedDestinationProduct = selectedValue;
      } else if (label === 'sourceProduct') {
        this.stockActionFilterValues.selectedSourceProduct = selectedValue;
      } else if (label === 'creator') {
        this.stockActionFilterValues.creator = selectedValue;
      } else {
        this.stockActionFilterValues.selectedSourceProduct = selectedValue;
      }
      this.loadInternalTransactions();
    }
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
  }

  /* istanbul ignore next */
  filterByAdditional(data: any): void {
    if (this.transactionType === 'external') {
      this.appliedFilterValues = {
        ...this.appliedFilterValues,
        ...data,
      };
      this.getTransactionHistory();
    } else {
      this.stockActionFilterValues = {
        ...this.stockActionFilterValues,
        ...data,
      };
      this.loadInternalTransactions();
    }
  }

  /* istanbul ignore next */
  showFilter(item: IAddionalFilter): void {
    item.visible = !item.visible;
    if (this.transactionType === 'external') {
      if (item.id === 'date' && !item.visible) {
        this.appliedFilterValues.dateOn = '';
        this.appliedFilterValues.dateFrom = '';
        this.appliedFilterValues.dateTo = '';
        this.getTransactionHistory();
      } else if (item.id === 'quantity' && !item.visible) {
        this.appliedFilterValues.quantityFrom = '';
        this.appliedFilterValues.quantityTo = '';
        this.getTransactionHistory();
      }
    } else {
      if (item.id === 'date' && !item.visible) {
        this.stockActionFilterValues.dateOn = '';
        this.stockActionFilterValues.dateFrom = '';
        this.stockActionFilterValues.dateTo = '';
      } else if (item.id === 'quantity' && !item.visible) {
        this.stockActionFilterValues.quantityFrom = '';
        this.stockActionFilterValues.quantityTo = '';
      }
      this.loadInternalTransactions();
    }
  }

  paginationChange(pageData: IPaginator): void {
    const { limit, offset } = pageData;
    if (this.transactionType === 'external') {
      this.appliedFilterValues.limit = limit;
      if (this.pageType == 'archived' && this.appliedFilterValues) {
        this.appliedFilterValues.archived = true;
      } else {
        this.appliedFilterValues.archived = false;
      }
      this.appliedFilterValues.offset = offset;
      this.getTransactionHistory();
    } else {
      this.stockActionFilterValues.limit = limit;
      this.stockActionFilterValues.archived = this.pageType === 'archived';
      this.stockActionFilterValues.offset = offset;
      this.loadInternalTransactions();
    }
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
  }

  /* istanbul ignore next */
  sortData(column: string): void {
    let sortByColumn = '';

    switch (column) {
      case 'sourcequantity':
        sortByColumn = 'source_quantity';
        break;
      case 'connection':
        sortByColumn = 'connection.name';
        break;
      case 'id':
        sortByColumn = 'number';
        break;
      case 'created':
        sortByColumn = 'date';
        break;
      default:
        sortByColumn = column;
        break;
    }

    if (this.appliedFilterValues.sortBy === sortByColumn) {
      this.appliedFilterValues.orderBy =
        this.appliedFilterValues.orderBy === 'asc' ? 'desc' : 'asc';
    } else {
      this.appliedFilterValues.orderBy = 'asc';
    }
    this.appliedFilterValues.sortBy = sortByColumn;
    if (this.transactionType === 'external') {
      this.getTransactionHistory();
    } else {
      this.loadInternalTransactions();
    }
  }

  /* istanbul ignore next */
  selectTransaction(data: any): void {
    if (this.transactionType == 'external') {
      this.trService.setPaginationState(this.appliedFilterValues);
    } else {
      this.trService.setPaginationStateInternal(this.stockActionFilterValues);
    }
    this.routeService.navigateArray([
      'transaction-report',
      this.transactionType,
      data.itemId,
    ]);
  }

  // transactions can be rejected
  /* istanbul ignore next */
  rejectTransactionDialog(item: any): void {
    const data = {
      id: item.itemId,
      params: item,
      type: 'reject',
    };
    const dialogRef = this.dialog.open(TransactionActionsComponent, {
      disableClose: true,
      width: '581px',
      height: 'auto',
      data,
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resetFilter();
        this.getTransactionHistory();
        this.utils.transactionRejectMessage('success');
      } else {
        this.utils.transactionRejectMessage('fail');
      }
    });
  }

  // navigate to consumer interface
  /* istanbul ignore next */
  viewDetails(el: any): void {
    this.trService.setPaginationState(this.appliedFilterValues);
    this.trService.traceSource(el);
  }

  /* istanbul ignore next */
  changeHistoryTab({ id }: ICommonObj): void {
    this.transactionType = id;
    this.trService.transactionType = this.transactionType;
    this.trService.resetPaginationState();
    this.trService.resetPaginationStateInternal();
    this.clearPageSelection();
    this.paginationReset = {
      limit: 10,
      offset: 0,
    };
    if (this.transactionType === 'internal') {
      this.byStockAction = 1;
      this.resetStockActionFilterValues();
      this.constructingTableData();
    } else {
      this.displayedColumns = TRANSACTION_COLUMNS;
      this.additionalColumns = OPTIONS_NEEDED;
      this.resetFilter();
      this.getTransactionHistory();
    }
    this.toggleFilter = false;
    this.toggleFilterInternal = false;
    this.additionalFilterSetting();
  }

  /**
   * The function `clearPageSelection` resets all selected items and options in a TypeScript class.
   */
  clearPageSelection(): void {
    this.allSelected = false;
    this.selectedItems = [];
    this.selectedOption = '';
    this.entireListSelected = false;
    this.selectAllChecked = false;
    this.pageSelected = false;
    this.dataSource.forEach(item => {
      item.selected = false;
    });
  }

  /* istanbul ignore next */
  constructingTableData(): void {
    this.dataLoading = true;
    if (this.byStockAction === 1) {
      this.displayedColumns = STOCK_ACTIONS_PROCESSED;
    } else if (this.byStockAction === 3) {
      this.displayedColumns = STOCK_ACTIONS_MERGED;
    } else {
      this.displayedColumns = STOCK_ACTIONS_LOSS;
    }
    this.loadInternalTransactions();
  }

  // change stock action types, ie: Processed or merge or loss radio buttons selection
  /* istanbul ignore next */
  changeStockType({ id }: ICommonIdName): void {
    this.clearPageSelection();
    this.byStockAction = id;
    this.trService.stockTransactionType = id;
    this.resetStockActionFilterValues();
    this.toggleFilter = false;
    this.constructingTableData();
  }

  updateColumns(item: any): void {
    item.visible = !item.visible;
    this.displayedColumns = TRANSACTION_COLUMNS.map((column: any) => {
      if (column.name === item.name) {
        column.isColumnVisible = item.visible;
      }
      return column;
    });
  }

  exportData(): void {
    if (this.transactionType === 'external') {
      this.trService.exportData(this.transactionType, this.appliedFilterValues);
    } else {
      this.trService.exportData(
        this.transactionType,
        this.appliedFilterValues,
        this.byStockAction
      );
    }
  }

  /* istanbul ignore next */
  trackFn(index: number, item: any): any {
    return item.id;
  }

  /* istanbul ignore next */
  trackFnFor(index: number): any {
    return index;
  }

  /**
   * The function `changeSelect` handles the selection and deselection of items based on a checkbox
   * event.
   */
  changeSelect(event: any, item: any): void {
    const index = this.dataSource.findIndex(
      dataItem => dataItem.itemId === item.itemId
    );
    if (index !== -1) {
      this.dataSource[index].selected = event.checked;
    }

    this.selectedOption = '';
    if (event.checked && !this.entireListSelected) {
      const itemExists = this.selectedItems.includes(item.itemId);
      if (!itemExists) {
        this.selectedItems.push(item.itemId);
      }
    } else if (!event.checked && this.entireListSelected) {
      this.selectedItems.push(item.itemId);
    } else {
      const index = this.selectedItems.indexOf(item.itemId);
      if (index !== -1) {
        this.selectedItems.splice(index, 1);
      }
    }

    this.selectAllChecked =
      this.selectedItems.length === this.dataSource.length &&
      !this.entireListSelected;
  }

  /**
   * The radioButtonChanged function updates the selectedItems array based on the value of the event
   * parameter.
   */
  radioButtonChanged(event: any): void {
    this.dataSource.forEach(item => {
      item.selected = true;
    });
    this.selectAllChecked = true;
    if (event.value === 'page') {
      this.pageSelected = true;
      this.entireListSelected = false;
      this.selectedItems = this.dataSource.map(obj => obj.itemId);
    } else if (event.value === 'all') {
      this.pageSelected = false;
      this.entireListSelected = true;
      this.selectedItems = [];
    }
    this.allSelected = true;
  }

  /**
   * The function `moveToTransationHistory` opens a dialog for confirming the move of selected items to
   * transaction history and performs necessary actions based on the user's choice.
   */
  /* istanbul ignore next */
  toggleArchiveStatus() {
    const filters =
      this.transactionType === 'external'
        ? this.appliedFilterValues
        : this.stockActionFilterValues;
    const filterParams: FilterParams = {
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
      date_on: filters.dateOn,
      search: filters.searchString,
      creator: filters.creator,
      quantity_from: filters.quantityFrom,
      quantity_to: filters.quantityTo,
    };

    if (this.transactionType === 'internal') {
      filterParams.type = this.byStockAction;
      filterParams.destination_product = filters.selectedDestinationProduct;
      filterParams.source_product = filters.selectedSourceProduct;
    } else {
      filterParams.product = filters.selectedProduct;
      filterParams.node = filters.selectedCompany;
    }
    const data = {
      selected_items: this.selectedItems,
      is_excluded: this.entireListSelected,
      restore: this.pageType === 'archived',
      filters: filterParams,
    };

    const isArchivedPage = this.pageType === 'archived';
    const itemCount = this.entireListSelected
      ? 'all'
      : this.selectedItems?.length ?? 0;
    const itemText = itemCount === 1 ? 'this' : 'these';
    const pluralSuffix = itemCount === 1 ? '' : 's';
    const itemCountText = data.is_excluded ? 'all' : itemCount;
    const listType = isArchivedPage ? 'transaction history' : 'archive list';

    const dialogRef = this.dialog.open(ArchiveConfirmationPopupComponent, {
      width: '35vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: {
        title: isArchivedPage
          ? 'Move to transaction history'
          : 'Move to archive',
        text: `Are you sure you want to move ${itemText} ${itemCountText} selected item${pluralSuffix} to the ${listType}?`,
        label: `Once moved, you'll be able to access them in the ${listType}.`,
        type: 'transactions',
        params: data,
        transactionType: this.transactionType,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedItems = [];
        if (this.transactionType === 'internal') {
          this.constructingTableData();
        } else {
          this.getTransactionHistory();
        }
        this.clearPageSelection();
      }
    });
  }

  /**
   * The function `setSelecteItems` iterates through a data source and updates the `selected` property
   * of each item based on certain conditions.
   */
  setSelecteItems() {
    this.dataSource.forEach(item => {
      item.selected = this.entireListSelected
        ? !this.selectedItems.includes(item.itemId)
        : this.selectedItems.includes(item.itemId);
    });
  }

  convertToDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined; // Return undefined if empty

    const parts = dateStr.split('/'); // Split "20/11/2025" into ["20", "11", "2025"]
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number); // Convert to numbers
      return new Date(year, month - 1, day); // Month is 0-based in JS
    }

    return undefined; // Return undefined if format is incorrect
  }

  setFilters(state: any, type: string): void {
    const isExternal = type === 'external';
    this[isExternal ? 'filters' : 'filtersInternal'] = state;
    this[isExternal ? 'toggleFilter' : 'toggleFilterInternal'] =
      this.checkToggleFilter(isExternal);
    this.presetDate = this.getPresetDate(isExternal);

    if (!this.availableFilters) {
      this.additionalFilterSetting(); // Set default filters if not available
    }

    this.updateAvailableFilters(isExternal);
    isExternal ? this.resetFilter() : this.resetStockActionFilterValues();
  }

  private checkToggleFilter(isExternal: boolean): boolean {
    const filters = isExternal ? this.filters : this.filtersInternal;
    return !!(
      filters.selectedCompany ||
      filters.selectedProduct ||
      filters.transactionType ||
      filters.creator ||
      filters.quantityFrom ||
      filters.dateFrom ||
      filters.selectedSourceProduct ||
      filters.selectedDestinationProduct
    );
  }

  private getPresetDate(isExternal: boolean): any {
    const filters = isExternal ? this.filters : this.filtersInternal;
    return {
      selectedType: filters?.dateOn ? 2 : 1,
      selectedDate: filters?.dateOn
        ? this.convertToDate(filters.dateOn)
        : undefined,
      start: filters?.dateFrom
        ? this.convertToDate(filters.dateFrom)
        : undefined,
      end: filters?.dateTo ? this.convertToDate(filters.dateTo) : undefined,
    };
  }

  private updateAvailableFilters(isExternal: boolean): void {
    const filters = isExternal ? this.filters : this.filtersInternal;
    this.availableFilters = this.availableFilters?.map((filter: any) => {
      if (filter.id === 'date') {
        filter.visible = !!(
          filters?.dateOn ||
          filters?.dateFrom ||
          filters?.dateTo
        );
      } else if (filter.id === 'quantity') {
        filter.visible = !!(filters?.quantityFrom || filters?.quantityTo);
      }

      return filter;
    });
  }

  get currentFilters() {
    return this.trService.transactionType === 'internal'
      ? this.filtersInternal
      : this.filters;
  }
}
