/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
// material
import { MatTableDataSource } from '@angular/material/table';

import { saveAs } from 'file-saver';
// config
import {
  IFarmerDetails,
  INIT_TABLE,
  IReference,
} from '../farmer-profile.config';
import {
  ACTION_TYPE,
  exportFileType,
  exportType,
} from 'src/app/shared/configs/app.constants';
// services
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { UtilService } from 'src/app/shared/service';
import { ExportService } from 'src/app/shared/service/export.service';
import { IPaginator } from 'fairfood-utils';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss'],
})
export class IncomeComponent implements OnInit, OnDestroy {
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'references',
    'source',
    'payment',
    'verification',
    'date',
    'amount',
    'receipt',
  ];
  pageApis: Subscription[] = [];
  tableCount: number;
  incomeData: IReference = {
    count: 0,
    loading: true,
    results: [],
  };
  farmerData: IFarmerDetails;
  optionsArray = [
    {
      id: 'name',
      name: 'Source',
    },
  ];

  downloadingId: string;

  constructor(
    private store: FarmerProfileStoreService,
    private utils: UtilService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    const api = this.store.payments$.subscribe({
      next: (data: IReference) => {
        this.incomeData = data;
        const { results, count } = data;
        this.tableCount = count;
        this.dataSource = new MatTableDataSource(results);
      },
    });
    this.pageApis.push(api);
    const sub = this.store.farmerDetails$.subscribe({
      next: (res: IFarmerDetails) => {
        this.farmerData = res;
      },
    });
    this.pageApis.push(sub);
    this.subscribeExportButtonChange();
  }

  subscribeExportButtonChange(): void {
    const exportClicked = this.exportService.exportIconClicked$.subscribe(
      res => {
        if (res) {
          const params = {
            farmer: this.farmerData.id,
          };
          this.exportService.initExportData({
            export_type: exportType.INCOME,
            filters: JSON.stringify(params),
            file_type: exportFileType.EXCEL,
          });
        }
      }
    );
    this.pageApis.push(exportClicked);
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.store.setPayments(INIT_TABLE);
    this.store.getFarmerPayments(this.farmerData.id, '', offset, limit);
  }

  searchFilter(data: string): void {
    this.store.getFarmerPayments(this.farmerData.id, data);
  }

  /**
   * Downloading transaction receipt
   */
  downloadFile(element: any): void {
    if (!this.downloadingId) {
      this.downloadingId = element.id;
      const api = this.utils
        .downloadReceipt(element.invoice)
        .subscribe((result: any) => {
          saveAs(result, element.invoice?.split('/').pop());
          this.downloadingId = '';
        });
      this.pageApis.push(api);
    } else {
      this.utils.customSnackBar(
        'Download in progress. Please try again after some time !',
        ACTION_TYPE.FAILED
      );
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
