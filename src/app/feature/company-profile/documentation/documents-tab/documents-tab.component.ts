/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';

import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
// components
import { DocUploadComponent } from '../doc-upload';
import { ProfilePopupComponent } from '../../profile-popup';
// constants
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// services
import { UtilService } from 'src/app/shared/service';
import { DocumentationService } from '../documentation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// components
import {
  ButtonsComponent,
  FfPaginationComponent,
  LoaderComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';

@Component({
  selector: 'app-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatIconModule,
    MatMenuModule,
    LoaderComponent,
    DocUploadComponent,
    FfPaginationComponent,
    TranslateModule,
    ButtonsComponent,
    FfCustomPaginationComponent,
  ],
})
export class DocumentsTabComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  documentList: any;
  sub: Subscription;
  loader = true;
  memberType = +localStorage.getItem('memberType');
  appliedFilter: { limit: number; offset: number };
  claimColumns: string[] = ['name', 'options'];
  documentCount: number;
  downloadSub: Subscription;

  constructor(
    private companyService: DocumentationService,
    private dialog: MatDialog,
    private util: UtilService,
    private translate: TranslateService
  ) {
    this.appliedFilter = {
      limit: 10,
      offset: 0,
    };
  }

  ngOnInit(): void {
    this.getAllDocuments();
  }

  getAllDocuments(): void {
    const { limit, offset } = this.appliedFilter;
    this.sub = this.companyService
      .listDocument(limit, offset)
      .subscribe((apiRes: { results: any[]; count: number }) => {
        const { results, count } = apiRes;
        this.documentList = results || [];
        this.documentCount = count;
        this.loader = false;
      });
  }

  // Document upload Pop-up
  /* istanbul ignore next */
  openDocumentDialog(): void {
    const dialogRef = this.dialog.open(DocUploadComponent, {
      width: '30vw',
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === false) {
          this.util.customSnackBar(
            this.translate.instant('document.addFailed'),
            ACTION_TYPE.FAILED
          );
        } else {
          this.util.customSnackBar(
            this.translate.instant('document.add'),
            ACTION_TYPE.SUCCESS
          );
          this.appliedFilter = {
            limit: 10,
            offset: 0,
          };
          this.loader = true;
          this.getAllDocuments();
        }
      }
    });
  }

  /* istanbul ignore next */
  openDocDeleteDialog(elem: any): void {
    const dialogRef = this.dialog.open(ProfilePopupComponent, {
      width: '30vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: {
        file: elem,
        type: 'deleteDoc',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === false) {
          this.util.customSnackBar(
            this.translate.instant('document.deleteFailed'),
            ACTION_TYPE.FAILED
          );
        } else {
          this.loader = true;
          this.getAllDocuments();
          this.util.customSnackBar(
            this.translate.instant('document.delete'),
            ACTION_TYPE.SUCCESS
          );
        }
      }
    });
  }

  // Method to download company documents
  /* istanbul ignore next */
  downloadDoc(file: any): void {
    this.downloadSub = this.util
      .downloadReceipt(file.file)
      .subscribe((result: any) => {
        saveAs(result, file.name);
      });
  }

  paginatorEvent(data: any): void {
    const { limit, offset } = data;
    this.appliedFilter.limit = limit;
    this.appliedFilter.offset = offset;
    this.loader = true;
    this.getAllDocuments();
  }

  trackByFn(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.downloadSub) {
      this.downloadSub.unsubscribe();
    }
  }
}
