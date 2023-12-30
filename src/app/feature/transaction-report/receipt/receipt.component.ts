/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
// services
import { TransactionReportService } from '../transaction-report.service';
import { UtilService } from 'src/app/shared/service';
// configs and other modules
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { AttachementsTableModule } from '../../attachments-table/attachments-table.module';

const TABLE_COLUMNS: any[] = [
  {
    name: 'Added by',
    class: 'normal-column',
  },
  {
    name: 'Added on',
    class: 'normal-column',
  },
  {
    name: 'Description',
    class: 'large-column',
  },
  {
    name: 'File',
    class: 'large-column',
  },
];

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
  standalone: true,
  imports: [CommonModule, AttachementsTableModule],
})
export class ReceiptComponent implements OnInit, OnDestroy {
  @Input() transactionId: string;

  displayedColumns: any[] = TABLE_COLUMNS;
  dataSource: any;
  pageApis: Subscription[] = [];
  tableLength: number;
  loading = true;
  downloadingId: string;
  appliedFilters: any;

  constructor(
    private service: TransactionReportService,
    private dataService: UtilService
  ) {
    this.appliedFilters = {
      limit: 10,
      offset: 0,
    };
  }

  ngOnInit(): void {
    this.getAttachments();
  }

  /**
   * Get all the attachments for the transaction
   */
  getAttachments(): void {
    this.dataSource = [];
    const sub = this.service
      .getTransactionAttachments(
        this.transactionId,
        this.appliedFilters.limit,
        this.appliedFilters.offset
      )
      .subscribe(res => {
        const { count, results } = res;
        this.tableLength = count;
        this.dataSource = results.map((m: any) => {
          return {
            ...m,
            addedBy: m.node_name,
            addedOn: m.created_on,
            file: m.attachment || '',
          };
        });
        this.loading = false;
      });
    this.pageApis.push(sub);
  }

  /**
   * Pagination filter applied
   * @param param { limit: number; offset: number }
   */
  filterApplied(param: { limit: number; offset: number }): void {
    this.loading = true;
    this.appliedFilters = param;
    this.getAttachments();
  }

  fileUploadStarted(data: { file: any; fileName: string }): void {
    this.loading = true;
    const { file, fileName } = data;
    if (file) {
      const formData = new FormData();
      formData.append('name', fileName);
      formData.append('transaction', this.transactionId ?? '');
      formData.append('attachment', file ?? '');
      const api = this.service
        .addAttachements(this.transactionId, formData)
        .subscribe((result: any) => {
          if (result) {
            this.dataService.customSnackBar(
              'Receipt successfully uploaded',
              ACTION_TYPE.SUCCESS
            );
            this.filterApplied({
              limit: 10,
              offset: 0,
            });
          }
        });
      this.pageApis.push(api);
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
