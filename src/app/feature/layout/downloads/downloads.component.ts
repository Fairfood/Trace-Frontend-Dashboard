/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { saveAs } from 'file-saver';

import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable, Subscription, interval } from 'rxjs';
import { map, mapTo, scan, takeWhile, startWith } from 'rxjs/operators';
// service and config
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { UtilService } from 'src/app/shared/service';
import { ExportService } from 'src/app/shared/service/export.service';

enum EXPORT_STATUS {
  PENDING = 'PEND',
  COMPLETED = 'DONE',
  REVOKED = 'RVKD',
  FAILED = 'FAIL',
}

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss'],
  imports: [CommonModule, MatMenuModule, MatProgressBarModule],
  standalone: true,
})
export class DownloadsComponent implements OnInit, OnDestroy {
  @ViewChild('languageMenuTrigger') languageMenuTrigger: MatMenuTrigger;
  readonly exportStatus = EXPORT_STATUS;
  pageApis: Subscription[] = [];
  recentExports: any[] = [];
  loading = true;
  subscription: Subscription;
  currentDownloadId: string;
  downloading: string;
  constructor(
    private exportService: ExportService,
    // private transactionService: TransactionService,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    const changeCompany = this.util.companyData$.subscribe((result: string) => {
      if (result) {
        this.reportDownloadListing();
      }
    });
    this.pageApis.push(changeCompany);
    const sub = this.exportService
      .hasExportStarted()
      .subscribe((result: any) => {
        this.exportData(result);
      });
    this.pageApis.push(sub);
    this.reportDownloadListing();
  }

  exportData(incomingData: any): void {
    const api = this.exportService.createExport(incomingData).subscribe(res => {
      this.recentExports.unshift({
        ...res,
        status: 'preparing',
      });
      const downloadId = res?.id;
      setTimeout(() => {
        this.exportDataPing(downloadId, res.etc);
      }, 3000);
      this.openMenu();
    });
    this.pageApis.push(api);
  }

  reportDownloadListing(): void {
    const api = this.exportService.reportListing().subscribe({
      next: (res: any) => {
        this.recentExports = res.slice(0, 3).map((item: any) => {
          if (item.status === EXPORT_STATUS.PENDING) {
            item.progress = this.setPending(item.id, item.etc);
          }
          return {
            ...item,
          };
        });

        this.loading = false;
      },
      error: err => {
        console.log(err);
        this.loading = false;
        this.recentExports = [];
      },
    });
    this.pageApis.push(api);
  }

  setPending(downloadId: string, etc: number): void {
    const index = this.recentExports.findIndex((s: any) => s.id === downloadId);
    this.recentExports[index].status = EXPORT_STATUS.PENDING;
    const duration = (etc / 10) * 1000;
    this.recentExports[index].progress = this.autoIncrementVar(duration);
  }

  autoIncrementVar(duration: number): Observable<number> {
    const progress = interval(duration).pipe(
      startWith(0),
      mapTo(10),
      scan((a, b) => a + b),
      takeWhile(value => value < 100, true),
      map(value => (value === 100 ? 100 : value))
    );

    return progress;
  }

  exportDataPing(id: string, etc?: number): void {
    const api = this.exportService.pingAPI(id).subscribe(res => {
      const allowedStatus = [
        EXPORT_STATUS.COMPLETED,
        EXPORT_STATUS.FAILED,
        EXPORT_STATUS.REVOKED,
      ];
      if (allowedStatus.includes(res.status)) {
        this.recentExports = this.recentExports.map(item => {
          if (item.id === id) {
            return {
              ...res,
              status: res.status,
            };
          }
          return item;
        });
      } else {
        if (etc) {
          this.setPending(id, etc);
          setTimeout(() => {
            this.exportDataPing(id);
          }, (etc - 2) * 1000);
        } else {
          setTimeout(() => {
            this.exportDataPing(id);
          }, 5 * 1000);
        }
      }
    });
    this.pageApis.push(api);
  }

  exportFn(index: number, item: any): any {
    return item.id;
  }

  downloadFile(listItem: any): void {
    this.downloading = listItem.id;
    const api = this.util
      .downloadReceipt(listItem.file)
      .subscribe((result: any) => {
        saveAs(result, listItem?.file_name);
        this.downloading = '';
      });
    this.pageApis.push(api);
  }

  cancelExport(id: string): void {
    const api = this.exportService.cancelExport(id).subscribe({
      next: res => {
        if (res) {
          this.loading = true;
          this.reportDownloadListing();
        }
      },
      error: (err: any) => {
        if (err.status === 400) {
          this.util.customSnackBar(
            'File already generated. Cannot cancel',
            ACTION_TYPE.FAILED
          );
        }
      },
    });
    this.pageApis.push(api);
  }

  openMenu(): void {
    this.languageMenuTrigger.openMenu();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
