/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, filter, tap } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';

// services
import { DynamicTemplateStore, DynamicTemplateUploadService } from '../';
// configs
import { ButtonState } from 'fairfood-utils';
import { MAP_IMPORTS } from './template-mapping.config';
import { dynamicTemplateType } from 'src/app/shared/configs/app.constants';

@Component({
  selector: 'app-template-mapping',
  standalone: true,
  imports: MAP_IMPORTS,
  templateUrl: './template-mapping.component.html',
  styleUrls: ['./template-mapping.component.scss'],
})
export class TemplateMappingComponent implements OnInit, OnDestroy {
  pageApis: any[] = [];
  templateSelectionForm: FormGroup;
  schemaFields$: Observable<any>;
  loading = true;
  nextButton: ButtonState;
  isValid: boolean;
  loaderText = 'Loading file data';
  uploadStarted = false;
  templateType: number;
  readonly dynamicTemplateType = dynamicTemplateType;
  // if link fields are accessed again: when updating template
  // delete file from server
  deleteFile = false;

  constructor(
    private store: DynamicTemplateStore,
    private service: DynamicTemplateUploadService
  ) {}

  ngOnInit(): void {
    this.templateType = this.store.getCurrentTemplateType();
    if (this.templateType === dynamicTemplateType.TRANSACTION) {
      this.templateSelectionForm = this.service.linkFieldForm();
    } else {
      this.templateSelectionForm = this.service.linkFieldFormConnection();
    }
    this.templateAction();
    this.getUploadedFileData();
    this.formValueChanges();
    this.nextButton = {
      buttonText: 'Continue',
      disabled: true,
    };
    this.templateSelectionForm.updateValueAndValidity({ emitEvent: true });
    /**
     * Validating every required column is mapped
     * isValid property is set to true if all required columns are mapped
     */
    this.schemaFields$ = this.store.schemaArray$.pipe(
      tap((res: any) => {
        const valid = res
          ?.filter((s: any) => s.required)
          .every((element: any) => element.selected);
        this.isValid = valid;
      })
    );
  }

  formValueChanges(): void {
    const sub = this.templateSelectionForm
      .get('saveTemplate')
      .valueChanges.subscribe((selected: boolean) => {
        const name = this.templateSelectionForm.get('templateName');
        if (selected) {
          name.enable();
          name.setValidators(Validators.required);
        } else {
          name.disable();
          name.clearValidators();
        }
        name.updateValueAndValidity({ onlySelf: true });
      });
    this.pageApis.push(sub);

    const sub2 = this.templateSelectionForm
      .get('title')
      .valueChanges.pipe(
        filter(() => this.templateSelectionForm.get('title').valid)
      )
      .subscribe((res: any) => {
        this.templateSelectionForm.patchValue({
          dataRow: parseInt(res) + 1,
        });
        this.service.updateRowIndex$.next({
          title: parseInt(res),
          dataRow: parseInt(res) + 1,
        });
      });

    this.pageApis.push(sub2);

    const sub3 = this.templateSelectionForm.statusChanges.subscribe(
      (val: string) => {
        if (val === 'VALID') {
          this.nextButton.disabled = false;
        } else {
          this.nextButton.disabled = true;
        }
      }
    );
    this.pageApis.push(sub3);

    const sub4 = this.templateSelectionForm
      .get('dataRow')
      .valueChanges.pipe(
        filter(() => this.templateSelectionForm.get('dataRow').valid)
      )
      .subscribe((res: any) => {
        const currentTitle = +this.templateSelectionForm.get('title').value;
        if (+res <= currentTitle) {
          const message = `Data row should be greater than title row. Updating data row to ${
            currentTitle + 1
          }`;
          this.service.showError(message);

          this.templateSelectionForm.patchValue(
            {
              dataRow: currentTitle + 1,
            },
            { onlySelf: true }
          );
        }
      });

    this.pageApis.push(sub4);
  }

  templateAction(): void {
    const sub2 = this.service.templateAction$.subscribe({
      next: (action: any) => {
        if (action === 'remove') {
          /**
           * Remove template from store and go to step1
           */
          this.store.removeNewUplod();
        }
      },
    });
    this.pageApis.push(sub2);
  }

  /**
   * on init get uploaded file data
   * and form value updation
   */
  getUploadedFileData(): void {
    const api = this.store.uploadFileData$.subscribe(res => {
      if (res) {
        if (!this.uploadStarted) {
          const { title_row, field_details, id, latest_upload } = res;

          this.commonPatch(res);
          if (this.templateType === dynamicTemplateType.TRANSACTION) {
            this.transactionPatch(res);
          }
          this.service.updateRowIndex$.next({
            title: parseInt(title_row) + 1,
            dataRow: parseInt(title_row) + 2,
          });
          this.loaderText = 'Constructing table preview';
          this.fetchTemplatePreview(id, field_details);
          if (latest_upload?.id) {
            this.deleteFile = true;
          } else {
            this.deleteFile = false;
          }
        }
      }
    });

    this.pageApis.push(api);
  }

  commonPatch(res: any): void {
    const { title_row, name, id, latest_upload } = res;
    /**
     * title_row: title row index when showing in table +1 added
     */
    this.templateSelectionForm.patchValue({
      title: parseInt(title_row) + 1,
      dataRow: parseInt(title_row) + 2,
      templateName: '',
      templateId: id,
      fileName: name,
      latestUpload: latest_upload?.id ?? '',
    });
    this.templateSelectionForm.get('fileName').disable();
  }

  transactionPatch(res: any): void {
    const { unit, currency, product_details } = res;
    this.templateSelectionForm.patchValue({
      unit: unit.toString(),
      product: product_details?.id ?? '',
      currency: currency ?? '',
      productName: product_details?.name ?? '',
    });
  }

  /**
   * List some rows inside the template 2d array
   * @param id string
   */
  fetchTemplatePreview(id: string, fields: any[]): void {
    const api = this.service.getPreviewOfUploadedTemplate(id).subscribe({
      next: (res: any) => {
        this.store.updateStateProp<any>('templatePreview', res);
        this.loaderText = 'Fetching required fields';
        // fetching template schema. What are the fields required for this template
        this.fetchTemplateSchema(fields);
      },
      error: () => {
        this.handleUploadError();
      },
    });
    this.pageApis.push(api);
  }

  fetchTemplateSchema(fields: any[]): void {
    const api = this.service
      .templateSchemaFields(this.store.getCurrentTemplateType())
      .subscribe({
        next: (res: any) => {
          this.loaderText = 'Done. Please map the fields';
          const schema = this.service.mapSchemaFields(res, fields);
          this.store.updateStateProp<any>('schemaFields', schema);
          this.loading = false;
        },
        error: () => {
          this.handleUploadError();
        },
      });
    this.pageApis.push(api);
  }

  /**
   * next or back button action
   * next: validate column mapping
   * @param type string
   */
  buttonAction(type: string): void {
    if (type === 'next') {
      this.validateColumnMapping();
    } else {
      this.service.templateAction$.next('remove');
    }
  }

  validateColumnMapping(): void {
    if (this.isValid) {
      this.loading = true;
      this.loaderText = 'Saving template';
      this.patchTemplate();
    } else {
      this.service.showError('Please map all required fields');
    }
  }

  /**
   * Updating template data with product, currency and unit
   * Along with mapped columns
   */
  patchTemplate(): void {
    const { templateId, saveTemplate, templateName, title, dataRow } =
      this.templateSelectionForm.getRawValue();
    const fields: any[] = [];
    const sub = this.store.schemaArray$
      .pipe(
        tap((res: any) => {
          res?.forEach((element: any) => {
            const {
              name,
              field_type,
              required,
              columnIndex,
              columnName,
              selected,
            } = element;
            if (selected) {
              fields.push({
                name,
                type: field_type,
                required,
                column_pos: columnIndex,
                column_name: columnName,
              });
            }
          });
        })
      )
      .subscribe();
    this.pageApis.push(sub);
    //  value of title and data row is row 1 minus from form value
    const reqObj: any = {
      title_row: title - 1,
      data_row: dataRow - 1,
      visibility: saveTemplate ? 2 : 3,
      fields,
      is_active: true,
    };
    if (this.templateType === dynamicTemplateType.TRANSACTION) {
      const { unit, currency, product } = this.templateSelectionForm.value;
      reqObj.unit = unit;
      reqObj.currency = currency;
      reqObj.product = product;
    }
    if (saveTemplate) {
      reqObj.name = templateName;
    }
    this.uploadStarted = true;
    if (this.deleteFile) {
      this.deleteUploadedFile(templateId, reqObj);
    } else {
      this.patchTemplateApi(templateId, reqObj);
    }
  }

  /**
   * Intermediate flow
   * @param templateId string
   * @param reqObj any
   */
  deleteUploadedFile(templateId: string, reqObj: any): void {
    const { latestUpload } = this.templateSelectionForm.getRawValue();
    const api = this.service
      .deleteUploadedFile(latestUpload ?? templateId)
      .subscribe({
        next: () => {
          this.patchTemplateApi(templateId, reqObj);
        },
        error: (err: any) => {
          this.service.showError(err.detail[0]);
          this.loading = false;
        },
      });
    this.pageApis.push(api);
  }

  patchTemplateApi(templateId: string, reqObj: any): void {
    const api = this.service.patchTemplate(templateId, reqObj).subscribe({
      next: (res: any) => {
        this.store.updateStateProp<any>('uploadFileData', res);
        const { latest_upload } = res;
        this.loaderText = 'Validating template';
        this.verifyApi(latest_upload.id);
      },
      error: (err: any) => {
        this.service.showError(err.detail[0]);
        this.loading = false;
      },
    });
    this.pageApis.push(api);
  }

  /**
   * After template is updated verify the data in the uploaded file/template
   * @param templateId string
   */
  verifyApi(templateId: string): void {
    const api = this.service.verifyUpload(templateId).subscribe({
      next: (res: any): void => {
        this.store.validationApiSuccess(res);
        this.uploadSuccess();
      },
      error: (err: any): void => {
        this.loading = false;
        this.handleUploadError(err);
      },
    });
    this.pageApis.push(api);
  }

  handleUploadError(err?: any): void {
    const errorMessage = err?.detail[0] || 'Error while updating template';
    this.service.showError(errorMessage);
  }

  uploadSuccess(): void {
    this.store.fromMappingToVerification();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
