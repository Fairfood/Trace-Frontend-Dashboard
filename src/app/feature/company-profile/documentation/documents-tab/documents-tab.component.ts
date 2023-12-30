/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';

import { DocUploadComponent } from '../doc-upload/doc-upload.component';
import { ProfilePopupComponent } from '../../profile-popup/profile-popup.component';

import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { UtilService } from 'src/app/shared/service';
import { DocumentationService } from '../documentation.service';

@Component({
  selector: 'app-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss'],
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
    private util: UtilService
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
  openDocumentDialog(): void {
    const dialogRef = this.dialog.open(DocUploadComponent, {
      width: '30vw',
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        if (result === false) {
          this.util.customSnackBar('Document added failed', ACTION_TYPE.FAILED);
        } else {
          this.util.customSnackBar(
            'Document added successfully',
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
          const message = 'Document delete failed';
          this.util.customSnackBar(message, ACTION_TYPE.FAILED);
        } else {
          const message = 'Document deleted successfully';
          this.loader = true;
          this.getAllDocuments();
          this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
        }
      }
    });
  }

  // Method to download company documents
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

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    if (this.downloadSub) {
      this.downloadSub.unsubscribe();
    }
  }
}
