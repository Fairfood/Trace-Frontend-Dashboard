/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  Output,
  Input,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { TranslateService } from '@ngx-translate/core';

// components and services
import { UploadDocumentComponent } from '../../shared/components/upload-document';
import { UtilService } from 'src/app/shared/service';
// configs
import { IPaginator } from 'fairfood-utils';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { IAttachmentData } from 'src/app/shared/configs/app.model';
import { COMP_IMPORTS } from './attachements-table.config';

@Component({
  selector: 'app-attachments-table',
  templateUrl: './attachments-table.component.html',
  styleUrls: ['./attachments-table.component.scss'],
  standalone: true,
  imports: COMP_IMPORTS,
})
export class AttachementsTableComponent implements OnDestroy {
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

  constructor(
    public dataService: UtilService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  /* istanbul ignore next */
  openDialog(): void {
    const dialog = this.dialog.open(UploadDocumentComponent, {
      width: '35vw',
      panelClass: 'custom-modalbox',
      data: {
        heading: this.translate.instant('attachmentsTable.dialogHeading'),
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
  /* istanbul ignore next */
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
        this.translate.instant('attachmentsTable.dowloadProgress'),
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

  /* istanbul ignore next */
  trackByFn(index: number): number {
    return index;
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.pageApis.forEach((api: Subscription) => api.unsubscribe());
  }
}
