import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TransactionReportStoreService } from '../transaction-report-store.service';
import { ITransactionDetail } from '../transaction-report.config';

@Component({
  selector: 'app-batch-info',
  templateUrl: './batch-info.component.html',
  styleUrls: ['./batch-info.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class BatchInfoComponent implements OnInit, OnDestroy {
  transactionData: ITransactionDetail;

  sub: Subscription;
  constructor(private store: TransactionReportStoreService) {}

  ngOnInit(): void {
    this.sub = this.store.transactionDetails$.subscribe({
      next: (res: ITransactionDetail) => {
        this.transactionData = res;
      },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
