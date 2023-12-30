/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';

// services
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';

// configs
import { ButtonState } from 'fairfood-utils';
import {
  ACTION_TYPE,
  dynamicTemplateType,
} from 'src/app/shared/configs/app.constants';
import { SELECTION_IMPORT } from './template-selection.config';

@Component({
  selector: 'app-template-selection',
  standalone: true,
  imports: SELECTION_IMPORT,
  templateUrl: './template-selection.component.html',
  styleUrls: ['./template-selection.component.scss'],
})
export class TemplateSelectionComponent implements OnInit, OnDestroy {
  @ViewChild('templateFileUpload') templateFileUpload!: ElementRef;
  pageApis: Subscription[] = [];
  dataLoaded = false;

  templateSelectionForm: FormGroup;

  newProduct: boolean;

  nextButton: ButtonState;
  downloading = false;
  loaderText = 'Loading templates';
  fileUploaded = false;
  // to distinguish between template selection and custom template upload
  customTemplate: boolean;
  showDownload = false;
  templateType: number;
  readonly dynamicTemplateType = dynamicTemplateType;

  templateForm: FormGroup;
  supplySelection: any[] = [];
  selectedTemplateName: string;

  constructor(
    private service: DynamicTemplateUploadService,
    private routerService: RouterService,
    private store: DynamicTemplateStore,
    private utils: UtilService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.templateType = this.store.getCurrentTemplateType();
    this.nextButton = {
      buttonText: 'Upload template & continue',
      disabled: true,
    };
    this.initForm();
    this.templateChange();
  }

  initForm(): void {
    // to manage template dropdown
    this.templateForm = this.service.templateForm();
    if (this.templateType === dynamicTemplateType.TRANSACTION) {
      // to manage other fields for transactions
      this.templateSelectionForm = this.service.templateDetailsForm();
      this.formValueChangesTransaction();
    } else {
      this.formValueChangesConnection();
      const req: any = {
        limit: 10,
        offset: 0,
        relationship: 2,
        type: 1,
      };
      this.getBuyerApi(req);
    }

    this.initSubscription();
  }

  getBuyerApi(req: any): void {
    const api = this.service.listBuyers(req).subscribe((res: any) => {
      this.supplySelection = res;
      this.dataLoaded = true;
    });
    this.pageApis.push(api);
  }

  formValueChangesTransaction(): void {
    const form = this.templateSelectionForm.statusChanges.subscribe(val => {
      if (val === 'VALID') {
        this.nextButton = {
          ...this.nextButton,
          disabled: false,
        };
      } else {
        this.nextButton = {
          ...this.nextButton,
          disabled: true,
        };
      }
    });
    this.pageApis.push(form);
    this.dataLoaded = true;
  }

  formValueChangesConnection(): void {
    const form = this.templateForm.statusChanges.subscribe(val => {
      if (val === 'VALID') {
        this.nextButton = {
          ...this.nextButton,
          disabled: false,
        };
      } else {
        this.nextButton = {
          ...this.nextButton,
          disabled: true,
        };
      }
    });
    this.pageApis.push(form);
  }

  initSubscription(): void {
    // if upload new is clicked from the dropdown component
    const sub = this.service.templateAction$.subscribe({
      next: (action: any) => {
        if (action === 'new') {
          this.customUpload();
        }
      },
    });
    this.pageApis.push(sub);
  }

  templateChange(): void {
    // if a template is selected from the dropdown
    const sub2 = this.store.templateData$.subscribe({
      next: (template: any) => {
        if (template) {
          this.showDownload = true;
          const { name, id } = template;
          this.selectedTemplateName = name;
          this.templateForm.setValue(
            {
              templateName: name,
              templateId: id,
            },
            { emitEvent: true }
          );
          this.store.updateStateProp<any>('uploadFileData', null);
          this.nextButton.buttonText = 'Upload template & continue';
        } else {
          this.showDownload = false;
        }
      },
    });
    this.pageApis.push(sub2);
  }

  downloadTemplate(): void {
    // Set the loading state to true
    this.downloading = true;
    // Get the selected template ID from the form
    const { templateId } = this.templateForm.value;
    const download = this.service
      .downloadTemplate(templateId, this.selectedTemplateName)
      .pipe(finalize(() => (this.downloading = false)))
      .subscribe();
    this.pageApis.push(download);
  }

  /**
   * Two action either forward or backward
   * @param type string
   */
  buttonAction(type: string): void {
    if (type === 'next') {
      this.customTemplate = false;
      this.templateFileUpload.nativeElement.click();
    } else {
      this.routerService.navigateUrl('/stock/listing');
    }
  }

  /**
   *  Flow 2 by selecting a template from dropdown
   * @param req any
   */
  createUploadApi(req: any): void {
    this.dataLoaded = false;
    this.loaderText = 'Uploading file';
    const api = this.service.createUploads(req).subscribe({
      next: (res: any) => {
        this.verifyApi(res);
        this.loaderText = 'Validating file content';
      },
      error: (err: any) => {
        this.handleUploadError(err);
      },
    });
    this.pageApis.push(api);
  }

  /**
   * File content validation
   * @param fileData any
   */
  verifyApi(fileData: any): void {
    const api = this.service.verifyUpload(fileData.id).subscribe({
      next: (res: any): void => {
        this.store.updateStateProp<any>('uploadFileData', fileData);
        this.store.validationApiSuccess(res);
        this.store.goToVerification();
      },
      error: (err: any): void => {
        this.handleUploadError(err);
      },
    });
    this.pageApis.push(api);
  }

  handleUploadError(err?: any): void {
    this.nextButton = {
      buttonText: 'Upload template and continue',
      disabled: false,
    };
    const errorMessage = err?.detail[0] || 'Error while uploading template';
    this.utils.customSnackBar(errorMessage, ACTION_TYPE.FAILED);
    this.dataLoaded = true;
  }

  uploadTemplate(data: any): void {
    // upload button clicked from the template selection dropdown / flow 1
    if (this.customTemplate) {
      const reqObj = this.service.customUploadObject(
        data.target.files[0],
        this.store.getCurrentTemplateType()
      );
      this.dataLoaded = false;
      this.loaderText = 'Uploading custom template file';
      this.uploadCustomTemplate(reqObj);
    } else {
      // flow 2 - upload continue with existing template
      this.nextButton = {
        buttonText: 'Uploading template...',
        disabled: true,
      };

      if (this.templateType === dynamicTemplateType.CONNECTION) {
        if (this.templateForm.valid) {
          const req: any = this.service.uploadObject(
            this.templateForm,
            data.target.files[0],
            this.templateType
          );
          this.createUploadApi(req);
        } else {
          this.invalidFormAlert();
        }
      } else {
        if (this.templateSelectionForm.valid) {
          const req: any = this.service.uploadObject(
            this.templateSelectionForm,
            data.target.files[0],
            this.templateType
          );
          this.createUploadApi(req);
        } else {
          this.invalidFormAlert();
        }
      }
    }
  }

  invalidFormAlert(): void {
    this.utils.customSnackBar('Invalid form', ACTION_TYPE.FAILED);
  }

  // new template upload workflow

  /**
   * Custom template upload button clicked
   * On uploading the file, uploadTemplate() will be called
   */
  customUpload(): void {
    this.customTemplate = true;
    this.templateFileUpload.nativeElement.click();
  }

  /**
   * Flow 1 - Upload custom template
   */

  /**
   * Upload new template
   * It will create a new template and fetch the schema
   * For template pre
   * @param req any
   */
  uploadCustomTemplate(req: any): void {
    const api = this.service.createNewTemplate(req).subscribe({
      next: (res: any) => {
        // file is created and its data is saved in store for the link fields tab
        this.store.updateStateProp<any>('uploadFileData', res);
        this.store.goToLinkFields();
      },
      error: (err: any) => {
        this.handleUploadError(err);
      },
    });
    this.pageApis.push(api);
  }

  updateTagging(item: any): void {
    item.selected = !item.selected;
  }

  fetchTaggedItems(): any[] {
    return (this.supplySelection || []).flatMap((e: any) =>
      e.selected ? e.id : []
    );
  }

  ngOnDestroy(): void {
    this.pageApis.forEach((sub: Subscription) => sub.unsubscribe());
  }
}
