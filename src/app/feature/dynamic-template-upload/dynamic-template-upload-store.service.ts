/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseStoreService } from 'src/app/shared/store';

import { ITabItem } from 'src/app/shared/configs/app.model';
import {
  TRACE_TEMPLATE,
  getTemplateTabs,
} from './dynamic-template-upload.constants';

interface ITemplateState {
  selectedTemplateData: any;
  dataRows: any[];
  errorRows: any[];
  dataCount: number;
  errorCount: number;
  currentStep: string;
  tabGroup: ITabItem[];
  uploadFileData: any;
  schemaFields: any[];
  templateType: number;
  templatePreview: any[];
}

/**
 * selectedTemplateData - selected dropdown data step1
 * dataRows: data rows for verification step after uploading the excel file it returns the data
 * errorRows: excel upload error rows
 * currentStep: string to track the current step
 * tabGroup: how many tabs are there
 * uploadFileData: to keep track of the current upload file data. Also used to get the summary of the upload
 * schemaFields: schema fields for the selected template. Generated from the BE. Used in link field step
 * templateType: 1 for transactions, 2 for connections
 * templatePreview: When custom template is uploded its 2d preview
 */
const initialState: ITemplateState = {
  selectedTemplateData: null,
  dataRows: null,
  errorRows: null,
  dataCount: 0,
  errorCount: 0,
  currentStep: TRACE_TEMPLATE[0].id,
  tabGroup: getTemplateTabs('trace'),
  uploadFileData: null,
  schemaFields: null,
  templateType: null,
  templatePreview: null,
};
// this is a state service
@Injectable({
  providedIn: 'root',
})
export class DynamicTemplateStore extends BaseStoreService<ITemplateState> {
  /* istanbul ignore next */
  templateData$: Observable<any> = this.select(
    (state: ITemplateState) => state.selectedTemplateData
  );

  /* istanbul ignore next */
  dataRows$: Observable<any[]> = this.select(
    (state: ITemplateState) => state.dataRows
  );
  /* istanbul ignore next */
  errorRows$: Observable<any[]> = this.select(
    (state: ITemplateState) => state.errorRows
  );
  /* istanbul ignore next */
  tabChanges$: Observable<any[]> = this.select(
    (state: ITemplateState) => state.tabGroup
  );
  /* istanbul ignore next */
  currentStep$: Observable<string> = this.select(
    (state: ITemplateState) => state.currentStep
  );
  /* istanbul ignore next */
  uploadFileData$: Observable<any> = this.select(
    (state: ITemplateState) => state.uploadFileData
  );
  /* istanbul ignore next */
  schemaArray$: Observable<any> = this.select(
    (state: ITemplateState) => state.schemaFields
  );
  /* istanbul ignore next */
  templatePreview$: Observable<any> = this.select(
    (state: ITemplateState) => state.templatePreview
  );
  /* istanbul ignore next */
  dataCount$: Observable<number> = this.select(
    (state: ITemplateState) => state.dataCount
  );
  /* istanbul ignore next */
  errorCount$: Observable<number> = this.select(
    (state: ITemplateState) => state.errorCount
  );

  constructor() {
    super(initialState);
  }

  /* istanbul ignore next */
  getCurrentTemplateType(): number {
    return this.state.templateType;
  }

  /* istanbul ignore next */
  getCurrentTabs(): any[] {
    return this.state.tabGroup;
  }

  /* istanbul ignore next */
  getCurrentStep(): string {
    return this.state.currentStep;
  }

  /* istanbul ignore next */
  updateStateProp<T>(key: string, value: T): void {
    this.setState({ [key]: value });
  }

  /* istanbul ignore next */
  currentDataState(): any[] {
    return this.state.dataRows;
  }

  /* istanbul ignore next */
  currentErrorState(): any[] {
    return this.state.errorRows;
  }

  goToVerification(): void {
    const tabs = this.getCurrentTabs();
    const template: ITabItem[] = [];
    tabs.forEach((item: ITabItem) => {
      if (item.id === 'verification') {
        item.active = true;
      }
      template.push(item);
    });
    this.updateStateProp<ITabItem[]>('tabGroup', [...template]);
    this.updateStateProp<string>('currentStep', 'verification');
  }

  goToSummary(): void {
    const tabs = this.getCurrentTabs();
    const template = tabs.map((item: ITabItem) => {
      if (item.id === 'summary') {
        item.active = true;
      }
      return item;
    });
    this.updateStateProp<ITabItem[]>('tabGroup', template);
    this.updateStateProp<string>('currentStep', 'summary');
  }

  goToLinkFields(): void {
    this.updateStateProp<ITabItem[]>('tabGroup', getTemplateTabs('custom'));
    this.updateStateProp<string>('currentStep', 'linkFields');
    this.updateStateProp<any>('selectedTemplateData', null);
  }

  /* istanbul ignore next */
  fromMappingToVerification(): void {
    const template = getTemplateTabs('custom').map((item: ITabItem) => {
      if (item.id === 'verification') {
        item.active = true;
      }
      return item;
    });
    this.updateStateProp<ITabItem[]>('tabGroup', [...template]);
    this.updateStateProp<string>('currentStep', 'verification');
  }

  /* istanbul ignore next */
  resetState(): void {
    const state = {
      ...initialState,
      tabGroup: getTemplateTabs('trace'),
    };
    this.setState(state);
  }

  /* istanbul ignore next */
  removeNewUplod(): void {
    const state: any = {
      selectedTemplateData: null,
      dataRows: null,
      errorRows: null,
      currentStep: TRACE_TEMPLATE[0].id,
      tabGroup: getTemplateTabs('trace'),
      uploadFileData: null,
      schemaFields: null,
      templatePreview: null,
    };
    this.setState(state);
  }

  validationApiSuccess(res: any): void {
    const { data, errors, data_count, errors_count } = res;
    this.updateStateProp<any>('dataRows', data);
    this.updateStateProp<any>('errorRows', errors);
    this.updateStateProp<any>('dataCount', data_count);
    this.updateStateProp<any>('errorCount', errors_count);
  }

  /* istanbul ignore next */
  existingDataCount(): number {
    return this.state.dataCount;
  }

  /* istanbul ignore next */
  existingErrorCount(): number {
    return this.state.errorCount;
  }
}
