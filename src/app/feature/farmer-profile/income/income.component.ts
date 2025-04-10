/* eslint-disable @typescript-eslint/no-explicit-any */
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
// config
import { IFarmerDetails, IReference } from '../farmer-profile.config';
import {
  ACTION_TYPE,
  exportFileType,
  exportType,
} from 'src/app/shared/configs/app.constants';
import { INIT_TABLE } from '../farmer-profile.constants';
// components
import {
  FfPaginationComponent,
  IPaginator,
  LoaderComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
// services
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { ExportService } from 'src/app/shared/service/export.service';
import { UtilService } from 'src/app/shared/service';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FfPaginationComponent,
    LoaderComponent,
    MatTableModule,
    ExportIconComponent,
    SearchBoxComponent,
    FfCustomPaginationComponent,
  ],
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
      name: this.translate.instant('trReport.source'),
    },
  ];

  downloadingId: string;

  constructor(
    private store: FarmerProfileStoreService,
    private utils: UtilService,
    private exportService: ExportService,
    private translate: TranslateService
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
    this.store.updateStateProp<IReference>('payments', INIT_TABLE);

    this.store.getFarmerPayments(this.farmerData.id, '', offset, limit);
  }

  searchFilter(data: string): void {
    this.store.getFarmerPayments(this.farmerData.id, data);
  }

  /**
   * Downloading transaction receipt
   */
  /* istanbul ignore next */
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
        this.translate.instant('attachmentsTable.dowloadProgress'),
        ACTION_TYPE.FAILED
      );
    }
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
