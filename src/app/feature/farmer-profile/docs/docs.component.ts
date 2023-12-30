/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { UtilService } from 'src/app/shared/service';
import { IReference } from '../farmer-profile.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
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
    name: 'Uploader',
    class: 'normal-column',
  },
  {
    name: 'File',
    class: 'large-column',
  },
];
@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
})
export class DocsComponent implements OnInit {
  @Input() farmerId: string;
  @Input() isEditable: boolean;

  displayedColumns: any[] = TABLE_COLUMNS;
  dataSource: any;
  pageApis: Subscription[] = [];
  tableLength: number;
  loading = true;
  downloadingId: string;

  constructor(
    private store: FarmerProfileStoreService,
    private dataService: UtilService
  ) {}

  ngOnInit(): void {
    const api = this.store.attachments$.subscribe({
      next: (data: IReference) => {
        const { count, results } = data;
        this.tableLength = count;
        this.dataSource = results.map(m => {
          const { creator_name, created_on, attachment, node_details } = m;
          return {
            ...m,
            addedBy: creator_name,
            addedOn: created_on,
            file: attachment || '',
            uploader: node_details?.full_name,
          };
        });
        this.loading = false;
      },
    });
    this.pageApis.push(api);
  }

  filterApplied(param: { limit: number; offset: number }): void {
    this.loading = true;
    this.store.fetchFarmerAttachments(this.farmerId, param.offset, param.limit);
  }

  fileUploadStarted(data: { file: any; fileName: string }): void {
    this.loading = true;
    const { file, fileName } = data;
    if (file) {
      const formData = new FormData();
      formData.append('name', fileName);
      formData.append('farmer', this.farmerId ?? '');
      formData.append('attachment', file ?? '');
      const api = this.store
        .addAttachements(formData)
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
}
