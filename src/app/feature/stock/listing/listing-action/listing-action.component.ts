/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
// material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
// services
import { ListingStoreService } from '../listing-store.service';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';
import { StockProcessService } from '../../process-stock/stock-process.service';
import { ListingService } from '../listing.service';

// components
import { CreateRequestComponent } from 'src/app/feature/requests/create-request';
import { TransactionActionsComponent } from 'src/app/feature/transaction-actions';
import { ButtonsComponent } from 'fairfood-utils';
// configs
import { IProcessButton, PROCESS_BUTTONS } from './listing-action.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { StepValues } from '../../process-stock/process-stock.config';
import {
  FilterParams,
  IBatches,
  IFilterToggleItems,
  IStockTableRow,
  ITableFilterProps,
} from '../listing.model';
import { RESET_FILTER, TABLE_FILTER_PROPS } from '../listing.constants';
import { ArchiveConfirmationPopupComponent } from 'src/app/shared/components/archive-confirmation-popup/archive-confirmation-popup.component';

@Component({
  selector: 'app-listing-action',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, ButtonsComponent],
  templateUrl: './listing-action.component.html',
  styleUrls: ['./listing-action.component.scss'],
})
export class ListingActionComponent implements OnInit, OnDestroy {
  @Output() getApi: EventEmitter<any> = new EventEmitter();
  @Input() pageType = '';
  sendStock: Observable<boolean>;
  stockAction: Observable<boolean>;

  toggleFilter: boolean;
  processButtons: IProcessButton[] = PROCESS_BUTTONS;
  selectedStocks: any[] = [];
  selectOptions: string;
  changedBatches: IBatches[];
  currentBatches: IBatches[];
  selectedFilters: any;

  destroy$ = new Subject<void>();

  @Output() filterChanged = new EventEmitter();

  constructor(
    public store: ListingStoreService,
    private routerService: RouterService,
    private dialog: MatDialog,
    private utils: UtilService,
    private storage: StorageService,
    private processService: StockProcessService,
    private infoService: ListingService
  ) {}

  ngOnInit(): void {
    const listingState = localStorage.getItem('listingState');
    const parsedData = JSON.parse(listingState);
    this.stockAction = this.store.stockAction$;
    this.sendStock = this.store.sendStock$;
    this.store.toggle$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: boolean) => {
        this.toggleFilter = res || parsedData?.toggle;
      },
    });
    this.store.selectOptions$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: string) => {
        this.selectOptions = res;
      },
    });
    this.store.selectedStockItems$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any[]) => {
        this.selectedStocks = res;
        if (this.selectedStocks.length > 1) {
          this.processButtons[1].hidden = false;
        } else {
          this.processButtons[1].hidden = true;
        }
      },
    });

    this.store.changedBatches$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: IBatches[]) => {
        this.changedBatches = res;
      },
    });

    this.store.batches$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: IBatches[]) => {
        this.currentBatches = res;
      },
    });
  }

  filterClicked(): void {
    this.toggleFilter = !this.toggleFilter;
    this.store.updateStateProp<boolean>('toggle', this.toggleFilter);
    if (!this.toggleFilter) {
      this.store.updateStateProp<boolean>('enableSendStock', false);
      this.store.updateStateProp<boolean>('stockAction', false);
      this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
      this.store.updateStateProp<IBatches[]>('changedBatches', []);
      this.store.updateStateProp<IBatches[]>('batches', []);

      this.store.updateStateProp<boolean>('selectAll', false);
      this.store.updateStateProp<string>('selectingOptions', null);
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...RESET_FILTER,
      });
      this.store.updateStateProp<ITableFilterProps>('tableProps', {
        ...TABLE_FILTER_PROPS,
      });
      this.filterChanged.emit();
    }
  }

  buttonAction(type: string): void {
    if (type === 'remove') {
      this.removeStockDialog();
    } else if (type === 'single') {
      this.routerService.navigateArray(['/stock/receive']);
    } else if (type === 'multiple') {
      this.routerService.navigateArray(['/template-upload/transactions']);
    } else {
      this.processStock(type);
    }
  }

  // stock remove option
  removeStockDialog(): void {
    const data: any = {
      element: null,
      batches: this.currentBatches,
      type: '',
    };
    const dialogRef = this.dialog.open(TransactionActionsComponent, {
      disableClose: true,
      width: '676px',
      height: 'auto',
      data,
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
        this.store.updateStateProp<IBatches[]>('changedBatches', []);
        this.store.updateStateProp<IBatches[]>('batches', []);
        this.store.updateStateProp<boolean>('toggle', false);
        this.store.updateStateProp<boolean>('enableSendStock', false);
        this.store.updateStateProp<boolean>('stockAction', false);
        this.filterChanged.emit();
      }
    });
  }

  processStock(type: string): void {
    if (this.selectOptions === 'all') {
      this.updateSummarySelectAll();
    } else {
      this.updateSummarySelectPageItems();
    }

    if (type === 'send') {
      this.routerService.navigateArray(['/stock/stock-send']);
    } else if (type === 'convert') {
      this.routerService.navigateArray(['/stock/process-convert']);
    } else if (type === 'merge') {
      this.routerService.navigateArray(['/stock/process-merge']);
    } else {
      console.log('type', type);
      console.log('Do nothing');
    }
  }

  updateSummarySelectPageItems(): void {
    const info = {
      batches: this.currentBatches,
      selectedStock: this.selectedStocks,
      changedBatches: this.changedBatches,
    };
    this.processService.updateListingInfo(info);
    this.processService.updateSummaryData({
      currentStep: StepValues.TRANSACTION,
      batches: this.currentBatches.length,
      batchQuantity: this.infoService.computeSelectedQuantity(
        this.currentBatches
      ),
      products: this.selectedStocks.map(s => s.product),
      selectAll: false,
    });
  }

  /* istanbul ignore next */
  updateSummarySelectAll(): void {
    const batches = this.infoService.mergeChangedBatches(
      this.currentBatches,
      this.changedBatches
    );
    const info = {
      batches,
      selectedStock: this.selectedStocks,
      changedBatches: this.changedBatches,
    };
    this.processService.updateListingInfo(info);
    const summryData: any = {
      currentStep: StepValues.TRANSACTION,
      batches: batches.length,
      batchQuantity: this.infoService.computeSelectedQuantity(batches),
      products: this.selectedStocks.map(s => s.product),
    };

    const seletectedFilters = this.store.getFilterValues();
    if (seletectedFilters === RESET_FILTER) {
      summryData.selectAll = true;
    } else {
      summryData.selectAll = false;
    }
    this.processService.updateSummaryData(summryData);
  }

  // request stock button is clicked
  /* istanbul ignore next */
  createtransparencyRequest(): void {
    const dialogRef = this.dialog.open(CreateRequestComponent, {
      width: '50vw',
      maxHeight: '90vh',
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.success) {
          const message = 'Request sent successfully';
          this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
          this.routerService.navigateArray(['/requests', 2, result.data.id]);
        } else {
          const message = 'Failed to send request';
          this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
        }
      }
      this.storage.saveInStorage('fromDashBoardRequest', '');
    });
  }

  /**
   * The function `moveToArchive` handles moving selected items to either the archive list or back to
   * the stock list based on the type parameter.
   */
  moveToArchive(type: string) {
    const filters = this.store.getFilterValues();
    const filterParams: FilterParams = {
      product: filters.selectedProduct,
      claim: filters.selectedClaim,
      supplier: filters.selectedSupplier,
      quantity_from: filters.quantityFrom,
      quantity_to: filters.quantityTo,
      quantity_is: filters.quantityIs,
      date_on: filters.dateOn,
      date_to: filters.dateTo,
      date_from: filters.dateFrom,
      search: filters.searchString,
      created_from: filters.createdFrom,
    };
    const stocks = this.selectedStocks.map(stock => stock.itemId);
    const data = {
      selected_items: this.selectOptions === 'all' ? [] : stocks,
      is_excluded: this.selectOptions === 'all',
      restore: type !== 'moveToArchive',
      filters: filterParams,
    };

    const dialogTitle =
      type === 'moveToArchive' ? 'Move to archive' : 'Move back to Stock list';
    const itemCount = data.selected_items.length;
    const itemText = itemCount === 1 ? 'this' : 'these';
    const pluralSuffix = itemCount === 1 ? '' : 's';
    const itemCountText = data.is_excluded ? 'all' : itemCount;
    const listType = type === 'moveToArchive' ? 'archive' : 'stock';

    const dialogText = `Are you sure you want to move ${itemText} ${itemCountText} selected item${pluralSuffix} to the ${listType} list?`;
    const dialogLabel = `Once moved, you'll be able to access them in the ${listType} list.`;

    const dialogRef = this.dialog.open(ArchiveConfirmationPopupComponent, {
      width: '35vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: {
        title: dialogTitle,
        text: dialogText,
        label: dialogLabel,
        type: 'stock',
        params: data,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.updateStateProp<boolean>('viewSelected', false);
        this.store.updateStateProp<string>('selectingOptions', null);
        this.store.updateStateProp<boolean>('selectAll', false);
        this.getApi.emit();
      }
    });
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
