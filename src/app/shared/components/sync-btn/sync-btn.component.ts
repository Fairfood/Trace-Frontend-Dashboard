import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';

import { ACTION_TYPE } from '../../configs/app.constants';
import { StorageService, UtilService } from '../../service';
import { SyncBtnService } from './sync-btn.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-sync-btn',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    NgIf,
    AsyncPipe,
    MatTooltipModule,
    NgClass,
  ],
  templateUrl: './sync-btn.component.html',
  styleUrls: ['./sync-btn.component.scss'],
})
export class SyncBtnComponent implements OnDestroy {
  @ViewChild('tooltip') tooltip: MatTooltip;
  @Input() showConnectBtn = true;
  @Input() showNavigateBtn = true;
  nodeId: string;
  supplyChainId: string;
  navigateSyncing = false;
  connectSyncing = false;
  tooltipContentConnect =
    'Syncing from Connect has started , it might take a few minutes to finish.';
  tooltipContentNavigate =
    'Syncing with Navigate has started , it might take a few minutes to finish.';

  private destroy$ = new Subject<void>();

  private syncService = inject(SyncBtnService);
  private utilService = inject(UtilService);
  private storage = inject(StorageService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    const { nodeId } = JSON.parse(localStorage.getItem('userData'));
    const companyId = localStorage.getItem('companyID');
    this.nodeId = nodeId || companyId;
    this.supplyChainId = this.storage.retrieveStoredData('supplyChainId');
  }

  /**
   * The `syncFromConnect` function in TypeScript initiates synchronization with a service and displays
   * corresponding messages based on success or failure.
   */
  syncFromConnect(): void {
    this.connectSyncing = true;
    this.cdr.detectChanges();
    this.showTooltip();
    this.syncService
      .syncWithConnect()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // this.utilService.customSnackBar(
          //   'Syncing started, it will take a few minutes',
          //   ACTION_TYPE.SUCCESS
          // );
          setTimeout(() => {
            this.connectSyncing = false;
          }, 3000);
        },
        error: (error: any) => {
          console.log(error, 'e');

          const message =
            error?.error?.detail?.detail ||
            error?.detail?.detail ||
            error?.detail ||
            'Something went wrong!';
          this.utilService.customSnackBar(message, ACTION_TYPE.FAILED);
          setTimeout(() => {
            this.connectSyncing = false;
          }, 3000);
        },
      });
  }

  /**
   * The `syncWithNavigate` function synchronizes data with navigation and displays corresponding
   * messages based on success or failure.
   */
  syncWithNavigate(): void {
    this.navigateSyncing = true;
    this.cdr.detectChanges();
    this.showTooltip();
    const params = {
      node: this.nodeId,
      supply_chain: this.supplyChainId,
    };
    this.syncService
      .syncWithNavigate(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // this.utilService.customSnackBar(
          //   'Syncing started, it will take a few minutes',
          //   ACTION_TYPE.SUCCESS
          // );
          setTimeout(() => {
            this.navigateSyncing = false;
          }, 3000);
        },
        error: (error: any) => {
          const message =
            error?.error?.detail?.detail ||
            error?.detail?.detail ||
            'Something went wrong!';
          this.utilService.customSnackBar(message, ACTION_TYPE.FAILED);
          setTimeout(() => {
            this.navigateSyncing = false;
          }, 3000);
        },
      });
  }

  /**
   * The function `showTooltip` displays a tooltip if a condition is met and hides it after 3 seconds.
   */
  showTooltip() {
    this.tooltip.show();
    setTimeout(() => {
      this.tooltip.hide();
    }, 3000); // Hide tooltip after 2 seconds
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
