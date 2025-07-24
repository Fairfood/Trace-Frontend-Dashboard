/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { BehaviorSubject, Observable, Subject, map, tap } from 'rxjs';
import {
  ACTION_TYPE,
  BASE_URL,
  HTTP_OPTION_3,
  HTTP_OPTION_4,
  dynamicTemplateType,
} from 'src/app/shared/configs/app.constants';
import {
  mapResults,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { FormBuilder, Validators } from '@angular/forms';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';
import { ConnectionService } from '../connections/connections.service';
import { headerOptions } from 'fairfood-utils';

@Injectable({
  providedIn: 'root',
})
export class DynamicTemplateUploadService {
  templateAction$: Subject<any> = new Subject<any>();
  updateRowIndex$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private utils: UtilService,
    private storage: StorageService,
    private routerService: RouterService,
    private connectionService: ConnectionService
  ) {}

  /* istanbul ignore next */
  availableTemplates(type: number, searchKey?: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/bulk-uploads/data-sheet-templates/?is_active=true&type=${type}&search=${
          searchKey || ''
        }`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(mapResults));
  }

  /* istanbul ignore next */
  templateForm(): any {
    return this.fb.group({
      templateId: ['', Validators.required],
      templateName: ['', Validators.required],
    });
  }

  /* istanbul ignore next */
  templateDetailsForm(): any {
    return this.fb.group({
      templateId: ['', Validators.required],
      productName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      product: [''],
      unit: ['', Validators.required],
      currency: ['', Validators.required],
      additionalFields: [false, Validators.required],
    });
  }

  /* istanbul ignore next */
  linkFieldForm(): any {
    return this.fb.group({
      templateId: ['', Validators.required],
      productName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      product: [''],
      unit: ['', Validators.required],
      currency: ['', Validators.required],
      title: [
        '',
        [
          Validators.min(1),
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      dataRow: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      saveTemplate: [true, Validators.required],
      templateName: ['', Validators.required],
      fileName: [''],
      latestUpload: [''],
    });
  }

  /* istanbul ignore next */
  linkFieldFormConnection(): any {
    return this.fb.group({
      templateId: ['', Validators.required],
      title: [
        '',
        [
          Validators.min(1),
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ],
      ],
      dataRow: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      saveTemplate: [true, Validators.required],
      templateName: ['', Validators.required],
      fileName: [''],
      latestUpload: [''],
    });
  }

  uploadObject(form: any, template: File, type: number): any {
    const { unit, product, currency, templateId } = form.value;
    const formData = new FormData();

    formData.append('file', template);
    formData.append('template', templateId);
    formData.append(
      'supply_chain',
      this.storage.retrieveStoredData('supplyChainId')
    );
    if (type === dynamicTemplateType.TRANSACTION) {
      formData.append('unit', unit);
      formData.append('currency', currency);
      formData.append('product', product);
    }

    return formData;
  }

  customUploadObject(template: File, type: number): any {
    const formData = new FormData();
    formData.append('file', template);
    formData.append('name', template.name);
    formData.append('type', type.toString());
    formData.append('visibility', '2');
    formData.append(
      'supply_chain',
      this.storage.retrieveStoredData('supplyChainId')
    );
    return formData;
  }

  /* istanbul ignore next */
  createUploads(params: any): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/bulk-uploads/data-sheet-uploads/`,
        params,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  verifyUpload(id: string): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/bulk-uploads/data-sheet-uploads/${id}/validate/`,
        {},
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Initiates the download of a template file.
   * This function triggers the download of a template file based on the selected template ID.
   * Once the file is received from the server, it is converted to a Blob and saved with an appropriate name.
   * The function also manages the loading state during the download process.
   */
  /* istanbul ignore next */
  downloadTemplate(id: string, name: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/bulk-uploads/data-sheet-templates/${id}/sample-file/?supply_chain=${this.storage.retrieveStoredData(
          'supplyChainId'
        )}`,
        {
          ...headerOptions(HTTP_OPTION_4),
          responseType: 'arraybuffer',
        }
      )
      .pipe(
        tap(res => {
          // Convert the response to a Blob
          const file = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // for the xlxs file format only
          });
          saveAs(file, `${name}_${id}.xlsx`);
        })
      );
  }

  /* istanbul ignore next */
  getSummaryOfUpload(id: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/bulk-uploads/data-sheet-uploads/${id}/`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  confirmTransaction(id: string): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/bulk-uploads/data-sheet-uploads/${id}/confirm/`,
        {},
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Flow 1 starts here
   */

  /**
   * Uploads a new template excel file
   * @param params any
   * @returns Observable
   *
   * it returns the template without field details
   */
  createNewTemplate(params: any): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/bulk-uploads/data-sheet-templates/`,
        params,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Created template id is passed to this endpoint
   * @returns Observable
   */
  templateSchemaFields(type: number): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/bulk-uploads/data-sheet-templates/schema-fields/?type=${type}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Based on the uploaded ID a 2d array of the template is returned
   * @param id string
   */
  /* istanbul ignore next */
  getPreviewOfUploadedTemplate(id: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/bulk-uploads/data-sheet-templates/${id}/preview/?visibility=all`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  patchTemplate(id: string, params: any): Observable<any> {
    return this.http
      .patch(
        `${BASE_URL}/bulk-uploads/data-sheet-templates/${id}/?visibility=all`,
        params,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  validateRows(id: string, params: any): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/bulk-uploads/data-sheet-uploads/${id}/validate-row/`,
        params,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  navigateToStock(): void {
    this.routerService.navigateUrl('/stock/listing');
  }

  navigateToConnections(): void {
    this.routerService.navigateUrl('/connections');
  }

  showError(message: string): void {
    this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
  }

  showSuccess(message: string): void {
    this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
  }

  isMapped(fields: any[], key: string): boolean {
    return fields.some((item: any) => item.name === key);
  }

  mappedColumn(fields: any[], key: string): any {
    const found = fields.find((item: any) => item.name === key);
    return found;
  }

  mapSchemaFields(res: any, fields: any[]): any[] {
    return res.map((item: any) => {
      const { field, required, field_type, label } = item;
      const isMapped = this.mappedColumn(fields, field);
      return {
        id: field,
        name: field,
        required,
        field_type,
        selected: fields.length ? this.isMapped(fields, field) : false,
        columnIndex: fields.length ? isMapped?.column_pos ?? -1 : -1,
        columnName: fields.length ? isMapped?.column_name ?? '' : '',
        label,
      };
    });
  }

  listBuyers(reqObj: any): Observable<any> {
    return this.connectionService.connectionList(reqObj).pipe(
      map(res => {
        const { results } = res;
        const buyers: any = [];
        results.forEach((buyer: any) => {
          const { connection_details, id, full_name } = buyer;
          if (Math.abs(connection_details.tier) === 1) {
            buyers.push({
              id,
              name: full_name,
              tier: connection_details.tier,
            });
          }
        });
        return buyers;
      })
    );
  }

  deleteUploadedFile(id: string): Observable<any> {
    return this.http.delete(
      `${BASE_URL}/bulk-uploads/data-sheet-uploads/${id}/`,
      headerOptions(HTTP_OPTION_3)
    );
  }
}
