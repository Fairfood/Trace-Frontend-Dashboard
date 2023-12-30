/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { MatMenuTrigger } from '@angular/material/menu';
// services and configs
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import { GlobalStoreService } from 'src/app/shared/store';

import { ITableColumnHeader } from 'src/app/shared/configs/app.model';
import { IMPORTS } from './template-verification.config';
import { ButtonState } from 'fairfood-utils';

interface ISpecialColumns extends ITableColumnHeader {
  type: string;
}

@Component({
  selector: 'app-template-verification',
  standalone: true,
  imports: IMPORTS,
  templateUrl: './template-verification.component.html',
  styleUrls: ['./template-verification.component.scss'],
})
export class TemplateVerificationComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) dropdownMenuItem: MatMenuTrigger;
  displayedColumns: ISpecialColumns[];
  pageApis: Subscription[] = [];
  selectedTemplate: any;
  loading = true;
  errorRow$: Observable<any[]> = this.store.errorRows$;
  successData$: Observable<any[]>;
  nextButton: ButtonState = {
    buttonText: 'Continue',
    disabled: true,
  };
  errorForm: FormGroup;
  templateId: string;
  loaderText = 'Loading data';
  validatingIndex: number;
  countryList: any;
  connectionTypes: any[] = [
    {
      id: 'Farmer',
      name: 'Farmer',
    },
    {
      id: 'Collector',
      name: 'Collector',
    },
  ];
  connectionTypeList: any[] = [];
  today = new Date();
  dataCount$ = this.store.dataCount$;

  inputFields = ['float', 'str', 'phone', 'latitude', 'longitude'];

  constructor(
    private store: DynamicTemplateStore,
    private service: DynamicTemplateUploadService,
    private global: GlobalStoreService
  ) {}

  ngOnInit(): void {
    this.initSubscriptions();
    this.getCountries();
  }

  initSubscriptions(): void {
    const sub1 = this.store.templateData$.subscribe(data => {
      if (data) {
        this.selectedTemplate = data;
        this.createColumns(data.field_details);
      }
    });
    this.pageApis.push(sub1);

    this.errorRow$ = this.store.errorRows$;
    this.successData$ = this.store.dataRows$;

    combineLatest([this.errorRow$, this.successData$]).subscribe(
      ([error, data]) => {
        if (error?.length > 0 || data?.length === 0) {
          this.nextButton.disabled = true;
        } else {
          this.nextButton.disabled = false;
        }
      }
    );
    const sub2 = this.store.uploadFileData$.subscribe({
      next: (res: any) => {
        if (res) {
          const { latest_upload, id, field_details } = res;
          this.templateId = latest_upload?.id ?? id;
          if (field_details) {
            this.createColumns(field_details);
          }
        }
      },
    });
    this.pageApis.push(sub2);
  }

  createColumns(fields: any[]): void {
    const columns: any = [];
    fields.forEach(field => {
      const { column_name, name, type } = field;
      columns.push({
        name: column_name,
        class: 'large-column',
        sortKey: name,
        type,
      });
    });
    this.displayedColumns = columns;
    this.loading = false;
  }

  buttonAction(type: string): void {
    if (type === 'next') {
      this.store.goToSummary();
    } else {
      if (this.store.getCurrentTabs().length === 4) {
        this.store.goToLinkFields();
      } else {
        this.removeUploadedFile();
      }
    }
  }

  trackByFn(index: number, item: any): any {
    return item.index;
  }

  validateColumns(item: any): void {
    this.validatingIndex = item.index;
    this.backendValidation(item);
  }

  updateTableData(res: any, index: number): void {
    const { data, errors, data_count } = res;

    if (errors.length === 0) {
      const newErros = [...this.store.currentErrorState()].filter(
        row => row.index !== index
      );
      this.store.updateStateProp<any>('errorRows', newErros);
    } else {
      const existingState = this.store.currentErrorState();
      const foundIndex = existingState.findIndex(
        f => f.index === errors[0].index
      );
      existingState[foundIndex] = errors[0];
      this.store.updateStateProp<any>('errorRows', existingState);
    }
    if (data.length) {
      const newData = [...data];
      this.store.updateStateProp<any>('dataRows', newData);
      this.store.updateStateProp<any>('dataCount', data_count);
    }
  }

  deleteRow(index?: number): void {
    if (index === -1) {
      this.store.updateStateProp<any>('errorRows', []);
      this.store.updateStateProp<any>('dataRows', [
        ...this.store.currentDataState(),
      ]);
    } else {
      const error = this.store.currentErrorState();
      const newError = error.filter(
        (row: any, indexF: number) => indexF !== index
      );
      this.store.updateStateProp<any>('errorRows', newError);
    }
  }

  getCountries(): void {
    const sub2 = this.global.countryList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryList = res;
        }
      },
    });
    this.pageApis.push(sub2);

    this.connectionTypeList = [
      {
        id: 'farmer',
        name: 'Farmer',
      },
      {
        id: 'collector',
        name: 'Collector',
      },
    ];
  }

  dropdownChanged(event: any, item: any, key: string): void {
    this.validatingIndex = item.index;
    const selectedValue = event.id === 'All' ? '' : event.name;
    item[key] = selectedValue;
    this.backendValidation(item);
  }

  dateFilter(event: any, item: any, key: string): void {
    this.validatingIndex = item.index;
    const formattedDate = this.formatDate(event);
    item[key] = formattedDate;
    this.backendValidation(item);
    this.dropdownMenuItem.closeMenu();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  backendValidation(item: any): void {
    const { index, errors, ...others } = item;
    const reqObj = {
      [index]: {
        ...others,
      },
    };
    const validateApi = this.service
      .validateRows(this.templateId, reqObj)
      .subscribe({
        next: (res: any) => {
          this.updateTableData(res, index);
          this.validatingIndex = -1;
        },
        error: (err: any) => {
          this.validatingIndex = -1;
          console.log(err);
        },
      });
    this.pageApis.push(validateApi);
  }

  removeUploadedFile(): void {
    /**
     * Remove template from store and go to step1
     */
    this.store.removeNewUplod();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
