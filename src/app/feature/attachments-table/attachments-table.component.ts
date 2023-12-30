/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Output, Input, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';

import { UploadDocumentComponent } from './upload-document/upload-document.component';
import { UtilService } from 'src/app/shared/service';

import { IPaginator } from 'fairfood-utils';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { IAttachmentData } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-attachments-table',
  templateUrl: './attachments-table.component.html',
  styleUrls: ['./attachments-table.component.scss'],
})
export class AttachementsTableComponent {
  @Input() displayedColumns: any[];
  @Input() dataSource: IAttachmentData[];
  @Input() buttonText: string;
  @Input() tableHeading: string;
  @Input() tableLength: number;
  @Input() loading: boolean;
  @Input() showAction: boolean;

  @Output() filterApplied = new EventEmitter();
  @Output() fileUploaded = new EventEmitter();

  pageApis: Subscription[] = [];
  downloadingId: string;

  constructor(public dataService: UtilService, private dialog: MatDialog) {}

  /* istanbul ignore next */
  openDialog(): void {
    const dialog = this.dialog.open(UploadDocumentComponent, {
      width: '35vw',
      panelClass: 'custom-modalbox',
      data: {
        heading: 'Upload document',
      },
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.fileUploaded.emit(result);
      }
    });
  }

  /**
   * Downloading transaction receipt
   */
  downloadFile(element: any): void {
    if (!this.downloadingId) {
      this.downloadingId = element.id;
      const api = this.dataService
        .downloadReceipt(element.attachment)
        .subscribe((result: any) => {
          saveAs(result, element.attachment?.split('/').pop());
          this.downloadingId = '';
        });
      this.pageApis.push(api);
    } else {
      this.dataService.customSnackBar(
        'Download in progress. Please try again after some time !',
        ACTION_TYPE.FAILED
      );
    }
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.filterApplied.emit({
      limit,
      offset,
    });
  }
}
