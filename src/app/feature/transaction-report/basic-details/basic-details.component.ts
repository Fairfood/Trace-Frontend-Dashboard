/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// services
import { TransactionReportStoreService } from '../transaction-report-store.service';
// config
import { ITransactionDetail } from '../transaction-report.config';
// components
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet';
@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule, CommonWalletComponent],
})
export class BasicDetailsComponent implements OnInit, OnDestroy {
  transactionData: ITransactionDetail;
  displayedColumns: string[] = [];
  dataSource1: MatTableDataSource<any>;
  dataSource2: MatTableDataSource<any>;

  sub: Subscription;
  constructor(private store: TransactionReportStoreService) {}

  ngOnInit(): void {
    this.sub = this.store.transactionDetails$.subscribe({
      next: (res: ITransactionDetail) => {
        this.transactionData = res;
        if (res.transaction === 'internal') {
          this.displayedColumns = ['number', 'name', 'quantity'];
          this.dataSource1 = new MatTableDataSource();
          this.dataSource1 = res.source_products;
          if (res.type !== 2) {
            this.dataSource2 = new MatTableDataSource();
            this.dataSource2 = res.destination_products;
          }
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
