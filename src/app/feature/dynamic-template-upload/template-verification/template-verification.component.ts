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
  errorCount$ = this.store.errorCount$;
  duplicateErrorCount = 0;

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

    const subError = this.errorRow$.subscribe({
      next: errorRows => {
        this.duplicateErrorCount = errorRows.filter(item =>
          item.errors.some(
            (error: any) =>
              error.key === 'duplicate' && error.reason === 'Duplicate Entry'
          )
        ).length;

        console.log(this.duplicateErrorCount);
      },
    });
    this.pageApis.push(subError);

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

  /* istanbul ignore next */
  trackByFn(index: number, item: any): any {
    return item.index;
  }

  validateColumns(item: any): void {
    this.validatingIndex = item.index;
    this.backendValidation(item);
  }

  /**
   * This method is called when the backend validation is done on individual row only
   * ie, each row is validated.
   * @param res any
   * @param index number
   */
  updateTableData(res: any, index: number): void {
    const { data, errors, data_count } = res;

    /**
     * If row is valid error will be empty array
     * so the coresponding index row should be removed from errorRows
     */
    if (errors.length === 0) {
      const newErros = [...this.store.currentErrorState()].filter(
        row => row.index !== index
      );
      const errorCount = this.store.existingErrorCount() - 1;
      this.store.updateStateProp<any>('errorRows', newErros);
      this.store.updateStateProp<any>('errorCount', errorCount);
    } else {
      // otherwise update the errorRows with the new error state from BE
      const existingState = this.store.currentErrorState();
      const foundIndex = existingState.findIndex(
        f => f.index === errors[0].index
      );
      existingState[foundIndex] = errors[0];
      this.store.updateStateProp<any>('errorRows', existingState);
    }
    // data state should be updated if there is any data from BE
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
      this.store.updateStateProp<any>('errorCount', 0);
    } else {
      const error = this.store.currentErrorState();
      const newError = error.filter(
        (row: any, indexF: number) => indexF !== index
      );
      this.store.updateStateProp<any>('errorRows', newError);

      const newErrorCount = this.store.existingErrorCount() - 1;
      this.store.updateStateProp<any>('errorCount', newErrorCount);
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
    this.dropdownMenuItem?.closeMenu();
  }

  formatDate(date: Date): string {
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

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
