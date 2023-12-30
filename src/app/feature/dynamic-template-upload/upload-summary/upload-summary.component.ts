/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  LoaderComponent,
  ButtonState,
  ActionButtonsComponent,
} from 'fairfood-utils';
// services
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import { dynamicTemplateType } from 'src/app/shared/configs/app.constants';

@Component({
  selector: 'app-upload-summary',
  standalone: true,
  imports: [CommonModule, ActionButtonsComponent, LoaderComponent],
  templateUrl: './upload-summary.component.html',
  styleUrls: ['./upload-summary.component.scss'],
})
export class UploadSummaryComponent implements OnInit, OnDestroy {
  nextButton: ButtonState = {
    disabled: false,
    buttonText: 'Finalize transaction',
  };
  pageApis: Subscription[] = [];
  templateId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summaryData: any;
  today = new Date();
  loading = true;
  loaderText = 'Fetching summary';
  supplySelection: any[] = [];
  templateType: number;
  readonly dynamicTemplateType = dynamicTemplateType;

  constructor(
    private service: DynamicTemplateUploadService,
    private store: DynamicTemplateStore
  ) {}

  ngOnInit(): void {
    this.templateType = this.store.getCurrentTemplateType();
    const api = this.store.uploadFileData$.subscribe(res => {
      if (res) {
        const { id, latest_upload } = res;
        this.templateId = latest_upload?.id ?? id;
        this.getSummary();
      }
    });
    this.pageApis.push(api);
  }

  getSummary(): void {
    const api = this.service
      .getSummaryOfUpload(this.templateId)
      .subscribe(res => {
        const { summary, product_details, currency } = res;

        if (this.templateType === dynamicTemplateType.CONNECTION) {
          this.summaryData = {
            ...summary,
          };
        } else {
          this.summaryData = {
            ...summary,
            productName: product_details.name,
            currency,
          };
        }
        this.loading = false;
      });
    this.pageApis.push(api);
  }

  buttonAction(type: string): void {
    if (type === 'next') {
      this.loading = true;
      if (this.templateType === dynamicTemplateType.CONNECTION) {
        this.loaderText = 'Creating connections. Please wait';
      } else {
        this.loaderText = 'Creating transactions. Please wait';
      }
      const api = this.service.confirmTransaction(this.templateId).subscribe({
        next: () => {
          if (this.templateType === dynamicTemplateType.CONNECTION) {
            this.service.navigateToConnections();
            this.service.showSuccess(
              'Farmer connections created successfully.'
            );
          } else {
            this.service.navigateToStock();
            this.service.showSuccess('The transactions created successfully.');
            this.service.showSuccess(
              'The stock list would take a few minute to update.'
            );
          }
        },
        error: () => {
          this.service.showError(
            'Transactions creation failed. Please try again later!'
          );
          this.service.navigateToStock();
        },
      });
      this.pageApis.push(api);
    } else {
      this.store.updateStateProp<string>('currentStep', 'verification');
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
