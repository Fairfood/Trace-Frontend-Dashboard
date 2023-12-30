/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ListingInfoService } from './listing-info.service';
import { IProgressBar } from '../listing.model';
import { ListingStoreService } from '../';

@Component({
  selector: 'app-listing-info',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    FormsModule,
  ],
  templateUrl: './listing-info.component.html',
  styleUrls: ['./listing-info.component.scss'],
})
export class ListingInfoComponent implements OnDestroy, OnInit {
  showLoader: boolean;
  showInfo: Observable<boolean>;
  selectedInformation: {
    noBatches: number;
    totalQuantity: number;
  };
  progressBarData: {
    progress: boolean;
    value: number;
  };

  private destroy$ = new Subject<void>();

  selectedBatchesOnly: boolean;

  constructor(
    private store: ListingStoreService,
    private service: ListingInfoService
  ) {}

  ngOnInit(): void {
    this.initData();
    this.showHideInfo();
  }

  initData(): void {
    this.store.selectedStockItems$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any[]) => {
        const selected = res;
        this.setInformation(
          selected.length,
          this.service.getSelectedQuantity(res)
        );
      },
    });
  }

  showHideInfo(): void {
    this.showInfo = this.store.stockAction$;
    this.store.progressBarData$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: IProgressBar) => {
        this.progressBarData = res;
      },
    });
  }

  setInformation(noBatches = 0, totalQuantity = 0): void {
    this.selectedInformation = {
      noBatches,
      totalQuantity,
    };
  }

  viewSelected(view: any): void {
    this.store.updateStateProp<boolean>('viewSelected', view.target.checked);
  }

  ngOnDestroy(): void {
    // this.store.updateStateProp<boolean>('toggleFilter', false);
    this.store.updateStateProp<boolean>('stockAction', false);
    // this.store.resetFilter();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
