/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// services
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { UtilService } from 'src/app/shared/service';
// configs
import { IReference } from '../farmer-profile.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// component
import { AttachementsTableComponent } from '../../attachments-table';
@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  standalone: true,
  imports: [CommonModule, AttachementsTableComponent, TranslateModule],
})
export class DocsComponent implements OnInit {
  @Input() farmerId: string;
  @Input() isEditable: boolean;

  displayedColumns: any[] = [
    {
      name: this.translate.instant('newPlot.addedBy'),
      class: 'normal-column',
    },
    {
      name: this.translate.instant('newPlot.addedOn'),
      class: 'normal-column',
    },
    {
      name: this.translate.instant('misc.desc'),
      class: 'large-column',
    },
    {
      name: this.translate.instant('newPlot.uploader'),
      class: 'normal-column',
    },
    {
      name: this.translate.instant('claim.fileHeading'),
      class: 'large-column',
    },
  ];
  dataSource: any;
  pageApis: Subscription[] = [];
  tableLength: number;
  loading = true;
  downloadingId: string;

  constructor(
    private store: FarmerProfileStoreService,
    public dataService: UtilService,
    private translate: TranslateService
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
    const { limit, offset } = param;
    this.store.fetchFarmerAttachments(this.farmerId, offset, limit);
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
              this.translate.instant('transactions.receiptUploaded'),
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
