/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
// services and config
import { TransactionReportStoreService } from '../transaction-report-store.service';
import { TransactionReportService } from '../transaction-report.service';
import { ITransactionDetail } from '../transaction-report.config';
// standalone component
import { LoaderComponent } from 'fairfood-utils';
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet';

@Component({
  selector: 'app-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    LoaderComponent,
    CommonWalletComponent,
  ],
})
export class BatchListComponent implements OnInit, OnDestroy {
  @Output() navigateToTrace = new EventEmitter();
  destination: string;
  batches: any[];
  displayedColumns: string[] = ['number', 'name', 'quantity', 'farmers'];
  dataSource: MatTableDataSource<any>;
  farmersCount: number;
  noSource: boolean;
  stockIds: any[];
  pageApis: Subscription[] = [];
  selectedBatchInfo: any = null;
  loading: boolean;

  constructor(
    private service: TransactionReportService,
    private store: TransactionReportStoreService
  ) {}

  ngOnInit(): void {
    const sub = this.store.transactionDetails$.subscribe({
      next: (res: Partial<ITransactionDetail>) => {
        const { source_batches, destination } = res;
        this.batches = source_batches;
        this.destination = destination?.name || '';
        if (source_batches) {
          if (source_batches.length === 1) {
            this.farmersCount = source_batches[0].total_farmers;
          } else {
            this.farmersCount = source_batches.reduce(
              (a: any, b: any) => a.total_farmers + b.total_farmers,
              0
            );
          }
          this.stockIds = source_batches.map((m: any) => m.number);
          this.dataSource = new MatTableDataSource();
          this.dataSource = source_batches.map((m: any) => {
            return {
              ...m,
              farmers: m.total_farmers,
            };
          });
        } else {
          this.noSource = true;
        }
      },
    });
    this.pageApis.push(sub);
  }

  getBatchInformation(el: any): void {
    const { id, farmers } = el;
    if (farmers > 0) {
      this.loading = true;
      this.selectedBatchInfo = el;
      const api = this.service.fetchBatchInfo(id).subscribe({
        next: (res: any) => {
          const { results } = res;
          this.selectedBatchInfo.farmersList = results;
          this.loading = false;
        },
      });
      this.pageApis.push(api);
    }
  }

  gotoTrace(): void {
    this.navigateToTrace.emit(true);
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
