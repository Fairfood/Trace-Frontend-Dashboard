/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
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
import { ListingInfoService } from '../listing-info';
// components
import { CreateRequestComponent } from 'src/app/feature/requests/create-request';
import { TransactionActionsComponent } from 'src/app/feature/transaction-actions';
import { ButtonsComponent } from 'fairfood-utils';
// configs
import { IProcessButton, PROCESS_BUTTONS } from './listing-action.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { StepValues } from '../../process-stock/process-stock.config';
import {
  IFilterToggleItems,
  IStockTableRow,
  ITableFilterProps,
} from '../listing.model';
import { RESET_FILTER, TABLE_FILTER_PROPS } from '../listing.constants';
@Component({
  selector: 'app-listing-action',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, ButtonsComponent],
  templateUrl: './listing-action.component.html',
  styleUrls: ['./listing-action.component.scss'],
})
export class ListingActionComponent implements OnInit {
  sendStock: Observable<boolean>;
  stockAction: Observable<boolean>;

  toggleFilter: boolean;
  processButtons: IProcessButton[] = PROCESS_BUTTONS;
  sub: Subscription;
  selectedStocks: any[] = [];

  @Output() filterChanged = new EventEmitter();

  constructor(
    private store: ListingStoreService,
    private routerService: RouterService,
    private dialog: MatDialog,
    private utils: UtilService,
    private storage: StorageService,
    private processService: StockProcessService,
    private infoService: ListingInfoService
  ) {}

  ngOnInit(): void {
    this.stockAction = this.store.stockAction$;
    this.sendStock = this.store.sendStock$;
    this.sub = this.store.selectedStockItems$.subscribe({
      next: (res: any[]) => {
        this.selectedStocks = res;
        if (this.selectedStocks.length > 1) {
          this.processButtons[1].hidden = false;
        } else {
          this.processButtons[1].hidden = true;
        }
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
      this.store.updateStateProp<boolean>('selectAll', false);
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
  removeStockDialog() {
    const batches = this.selectedStocks.map(stock => {
      return {
        batch: stock.itemId,
        quantity: stock.quantityNeeded,
      };
    });
    const data: any = {
      element: null,
      batches: batches,
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
        this.utils.customSnackBar(
          'Stock was successfully removed',
          ACTION_TYPE.SUCCESS
        );
        this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
        this.store.updateStateProp<boolean>('toggle', false);
        this.store.updateStateProp<boolean>('enableSendStock', false);
        this.store.updateStateProp<boolean>('stockAction', false);
      } else {
        this.utils.customSnackBar(
          'Failed to remove stocks',
          ACTION_TYPE.FAILED
        );
      }
    });
  }

  processStock(type: string): void {
    const batches = this.selectedStocks.map(stock => {
      return {
        batch: stock.itemId,
        quantity: stock.quantityNeeded,
      };
    });
    const info = {
      batches,
      selectedStock: this.selectedStocks,
      selectAll: false,
    };
    this.processService.updateListingInfo(info);
    this.processService.updateSummaryData({
      currentStep: StepValues.TRANSACTION,
      batches: this.selectedStocks.length,
      batchQuantity: this.infoService.getSelectedQuantity(this.selectedStocks),
      products: this.selectedStocks.map(s => s.product),
    });
    if (type === 'send') {
      this.routerService.navigateArray(['/stock/stock-send']);
    } else if (type === 'convert') {
      this.routerService.navigateArray(['/stock/process-convert']);
    } else {
      this.routerService.navigateArray(['/stock/process-merge']);
    }
  }

  // request stock button is clicked
  createtransparencyRequest(): void {
    const dialogRef = this.dialog.open(CreateRequestComponent, {
      width: '50vw',
      maxHeight: '700px',
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
}
