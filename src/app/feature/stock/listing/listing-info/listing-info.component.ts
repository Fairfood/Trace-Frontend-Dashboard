/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// material
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// services and models
import { ListingService, ListingStoreService } from '../';
import { IBatches } from '../listing.model';

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
  @Input() archivePage = false;
  showLoader: boolean;
  showInfo$: Observable<boolean>;
  selectedInformation: {
    noBatches: number;
    totalQuantity: number;
    batches: IBatches[];
  };
  hideViewSelected$: Observable<boolean>;

  destroy$ = new Subject<void>();

  selectedBatchesOnly: boolean;

  infoLoading: boolean;

  constructor(
    private store: ListingStoreService,
    private cdr: ChangeDetectorRef,
    private service: ListingService
  ) {}

  ngOnInit(): void {
    if (!this.archivePage) {
      this.showHideInfo();
    }
    this.fetchBatches();
  }

  fetchBatches(): void {
    this.store.batches$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: IBatches[]) => {
        this.recalCulateSummary(res);
      },
    });
  }

  recalCulateSummary(batches: IBatches[]): void {
    const totalQuantity = this.service.computeSelectedQuantity(batches);
    this.setInformation(batches.length, totalQuantity, batches);
    this.cdr.detectChanges();
  }

  showHideInfo(): void {
    this.showInfo$ = this.store.stockAction$;
    this.hideViewSelected$ = this.store.hideViewSelected$;
  }

  setInformation(
    noBatches: number,
    totalQuantity: any,
    batches: IBatches[] = []
  ): void {
    this.selectedInformation = {
      noBatches,
      totalQuantity,
      batches,
    };
  }

  viewSelected(view: any): void {
    this.store.updateStateProp<boolean>('viewSelected', view.target.checked);
  }

  ngOnDestroy(): void {
    this.store.updateStateProp<boolean>('stockAction', false);
    this.destroy$.next();
    this.destroy$.complete();
  }
}
