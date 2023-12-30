/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

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
} from './transactions.constants';
import { getAdditionalFilters } from 'src/app/shared/configs/app.methods';
// models
import { TR_IMPORTS } from './transactions.config';
import {
  IAddionalFilter,
  ICommonAPIResponse,
  ICommonIdName,
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';
import {
  IAppliedFilterTransaction,
  IStockActionTable,
  ITrListFilterMaster,
  ITransactionData,
} from './transactions.model';
import { ITeamMember } from '../company-profile/team-members/team-members.config';
import { IPaginator } from 'fairfood-utils';
// constants
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

// services
import { TransactionsService } from './transactions.service';
import { RouterService, UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
// components
import { TransactionActionsComponent } from '../transaction-actions';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  standalone: true,
  imports: [TR_IMPORTS],
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactionType = 'external';
  toggleFilter: boolean;
  availableFilters: IAddionalFilter[];

  // contains all the master data
  transactionListFilter: ITrListFilterMaster;
  pageApis: Subscription[] = [];
  appliedFilterValues: IAppliedFilterTransaction;
  dataLoading = true;
  dataSource: any;
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

  constructor(
    private trService: TransactionsService,
    private routeService: RouterService,
    private utils: UtilService,
    private dialog: MatDialog,
    private global: GlobalStoreService
  ) {
    this.transactionListFilter = {
      transactionFilterTypes: TRANSACTION_TYPE_FILTER,
      companyData: [],
      productData: [],
      teamMembers: [],
    };
    this.additionalFilterSetting();
    this.memberType = +this.trService.memberType();
  }

  ngOnInit(): void {
    this.initCalls();
    const api = this.utils.supplyChainData$.subscribe(res => {
      if (res) {
        this.initCalls();
      }
    });
    this.pageApis.push(api);

    const exportClicked = this.trService.exportIconClicked().subscribe(res => {
      if (res) {
        this.exportData();
      }
    });
    this.pageApis.push(exportClicked);
  }

  initCalls(): void {
    this.resetFilter();
    this.toggleFilter = false;
    this.dataLoading = true;
    this.displayedColumns = TRANSACTION_COLUMNS;
    this.transactionType = 'external';
    this.additionalFilterSetting();
    this.getAllProductsList();
    this.loadCompany();
    this.loadMembers();
  }

  // method to get all products
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

  // get company
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

  // getting the team members
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

  /**
   * External transacitons list ( paginated )
   */
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
      });
    this.pageApis.push(api);
  }

  searchFilter(search: string): void {
    if (this.transactionType === 'external') {
      this.resetFilter(search);
      this.getTransactionHistory();
    } else {
      this.resetStockActionFilterValues(search);
      this.loadInternalTransactions();
    }
  }

  filterClicked(): void {
    this.toggleFilter = !this.toggleFilter;
    if (!this.toggleFilter) {
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

  /**
   * Filter items with dropdown values
   * @param selectedObj any
   * @param label string
   */
  filterTransactionList(selectedObj: any, label: string): void {
    // this.paginator.pageIndex = 0;
    // external and internal Transactions have diff API calls
    const selectedValue = selectedObj.id === 'All' ? '' : selectedObj.id;
    if (this.transactionType === 'external') {
      this.appliedFilterValues.limit = 10;
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
  }

  /**
   * Filter items with quantity or date
   * @param data any
   */
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

  resetFilter(searchString?: string): void {
    this.appliedFilterValues = {
      selectedProduct: '',
      selectedCompany: '',
      searchString: searchString || '',
      transactionType: '',
      limit: 10,
      offset: 0,
      orderBy: 'desc',
      sortBy: 'date',
      quantityFrom: '',
      quantityTo: '',
      dateOn: '',
      dateTo: '',
      dateFrom: '',
      creator: '',
    };
  }

  /**
   * Show advanced filter
   * @param item any
   */
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
      this.appliedFilterValues.offset = offset;
      this.getTransactionHistory();
    } else {
      this.stockActionFilterValues.limit = limit;
      this.stockActionFilterValues.offset = offset;
      this.loadInternalTransactions();
    }
  }

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

  selectTransaction(data: any): void {
    this.routeService.navigateArray([
      'transaction-report',
      this.transactionType,
      data.itemId,
    ]);
  }

  // transactions can be rejected
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
        const message = 'Transaction rejected successfully';
        this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
      } else {
        const message = 'Failed to reject transaction';
        this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
      }
    });
  }

  // navigate to consumer interface
  viewDetails(el: any): void {
    this.trService.traceSource(el);
  }

  changeHistoryTab({ id }: ICommonObj): void {
    this.transactionType = id;
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
    this.additionalFilterSetting();
  }

  // change stock action types, ie: Processed or merge or loss radio buttons selection
  changeStockType({ id }: ICommonIdName): void {
    this.byStockAction = id;
    this.resetStockActionFilterValues();
    this.toggleFilter = false;
    this.constructingTableData();
  }

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

  /**
   * Stock actions like merge stock loss and processed stock
   * Listing internal transactions
   */
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
        this.dataLoading = false;
      });
    this.pageApis.push(api);
  }

  resetStockActionFilterValues(searchString?: string): void {
    this.stockActionFilterValues = {
      selectedSourceProduct: '',
      selectedDestinationProduct: '',
      searchString: searchString || '',
      limit: 10,
      offset: 0,
      orderBy: 'desc',
      sortBy: 'date',
      quantityFrom: '',
      quantityTo: '',
      dateOn: '',
      dateTo: '',
      dateFrom: '',
      creator: '',
    };
  }

  additionalFilterSetting(): void {
    const filterArray: IAddionalFilter[] = getAdditionalFilters(true);
    this.availableFilters = JSON.parse(JSON.stringify([...filterArray]));
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

  trackFn(index: number, item: any): any {
    return item.id;
  }

  trackFnFor(index: number): any {
    return index;
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
  }
}
