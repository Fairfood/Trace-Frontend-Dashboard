/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { TemplateSelectionComponent } from './template-selection.component';
import { RouterService, UtilService } from 'src/app/shared/service';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

describe('TemplateSelectionComponent', () => {
  let component: TemplateSelectionComponent;
  let fixture: ComponentFixture<TemplateSelectionComponent>;
  let serviceSpy: jasmine.SpyObj<DynamicTemplateUploadService>;
  let storeSpy: jasmine.SpyObj<DynamicTemplateStore>;
  let mockUtil: jasmine.SpyObj<UtilService>;
  let routerSpy: jasmine.SpyObj<RouterService>;

  beforeEach(async () => {
    mockUtil = jasmine.createSpyObj('UtilService', ['customSnackBar']);
    serviceSpy = jasmine.createSpyObj('DynamicTemplateUploadService', [
      'templateForm',
      'templateDetailsForm',
      'listBuyers',
      'templateAction$',
      'createUploads',
      'verifyUpload',
      'customUploadObject',
      'uploadObject',
      'createNewTemplate',
      'downloadTemplate',
    ]);
    serviceSpy.templateAction$ = new Subject();
    serviceSpy.listBuyers.and.returnValue(of([]));
    serviceSpy.downloadTemplate.and.returnValue(
      of({
        success: true,
      })
    );

    storeSpy = jasmine.createSpyObj('DynamicTemplateStore', [
      'updateStateProp',
      'uploadFileData$',
      'templateData$',
      'goToLinkFields',
      'getCurrentTemplateType',
      'validationApiSuccess',
      'goToVerification',
    ]);
    storeSpy.templateData$ = new Subject();

    const activatedRouteStub = { snapshot: { params: { id: 'some_id' } } };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    routerSpy = jasmine.createSpyObj('RouterService', ['navigateUrl']);

    await TestBed.configureTestingModule({
      imports: [TemplateSelectionComponent],
      providers: [
        {
          provide: DynamicTemplateUploadService,
          useValue: serviceSpy,
        },
        {
          provide: DynamicTemplateStore,
          useValue: storeSpy,
        },
        {
          provide: UtilService,
          useValue: mockUtil,
        },
        {
          provide: RouterService,
          useVale: routerSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateSelectionComponent);
    component = fixture.componentInstance;

    const formBuilder = TestBed.inject(FormBuilder);

    serviceSpy.templateForm.and.returnValue(
      formBuilder.group({
        templateId: ['', Validators.required],
        templateName: [''],
      })
    );

    serviceSpy.templateDetailsForm.and.returnValue({
      templateId: [''],
      productName: ['', Validators.required],
      product: [''],
      unit: [''],
      currency: [''],
      additionalFields: [false],
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call initForm', () => {
    spyOn(component, 'initForm');
    spyOn(component, 'templateChange');
    storeSpy.getCurrentTemplateType.and.returnValue(1);
    component.ngOnInit();
    expect(component.templateType).toEqual(1);
    expect(component.initForm).toHaveBeenCalled();
    expect(component.templateChange).toHaveBeenCalled();
  });

  describe('initForm', () => {
    it('should call formValueChangesTransaction', () => {
      spyOn(component, 'formValueChangesTransaction');
      component.templateType = 1;
      component.initForm();
      expect(component.formValueChangesTransaction).toHaveBeenCalled();
    });

    it('should call formValueChangesConnection', () => {
      spyOn(component, 'getBuyerApi');
      spyOn(component, 'formValueChangesConnection');
      component.templateType = 2;
      component.initForm();
      expect(component.formValueChangesConnection).toHaveBeenCalled();
      expect(component.getBuyerApi).toHaveBeenCalled();
    });
  });

  it('should call customUpload', () => {
    component.initSubscription();
    spyOn(component, 'customUpload');
    serviceSpy.templateAction$.next('customUpload');
    expect(component.customUpload).not.toHaveBeenCalled();
    serviceSpy.templateAction$.next('new');
    expect(component.customUpload).toHaveBeenCalled();
  });

  describe('templateChange', () => {
    it('should update form values and enable next button when a template is selected', () => {
      const template = { name: 'Template 1', id: '1' };
      const testSb = new BehaviorSubject<any>(template);
      storeSpy.templateData$ = testSb.asObservable();

      component.templateChange();

      expect(component.showDownload).toBe(true);
      expect(component.selectedTemplateName).toBe(template.name);
      expect(component.templateForm.value).toEqual({
        templateName: template.name,
        templateId: template.id,
      });
      expect(storeSpy.updateStateProp).toHaveBeenCalledWith(
        'uploadFileData',
        null
      );
      expect(component.nextButton.buttonText).toBe(
        'Upload template & continue'
      );
    });

    it('should hide download button when no template is selected', () => {
      const template: any = null;
      const testSb = new BehaviorSubject<any>(template);
      storeSpy.templateData$ = testSb.asObservable();

      component.templateChange();

      expect(component.showDownload).toBe(false);
    });
  });
  describe('downloadTemplate', () => {
    it('should set downloading to true and call downloadTemplate with correct parameters', () => {
      component.templateForm.patchValue({ templateId: '1' });
      component.selectedTemplateName = 'Template 1';

      component.downloadTemplate();

      expect(serviceSpy.downloadTemplate).toHaveBeenCalledWith(
        '1',
        component.selectedTemplateName
      );
    });
  });

  describe('createUploadApi', () => {
    it('should set loading state and call service method with correct parameters', fakeAsync(() => {
      spyOn(component, 'verifyApi');
      const req = {
        success: true,
      };
      serviceSpy.createUploads.and.returnValue(of(req));
      component.createUploadApi(req);
      expect(serviceSpy.createUploads).toHaveBeenCalledWith(req);
      tick();
      expect(component.loaderText).toBe('Validating file content');
      expect(component.verifyApi).toHaveBeenCalledWith(req);
    }));

    it('should set loading state and call service method with correct parameters', fakeAsync(() => {
      spyOn(component, 'handleUploadError');
      spyOn(component, 'verifyApi');
      const req = {
        success: true,
      };
      serviceSpy.createUploads.and.returnValue(
        throwError(() => new Error('error'))
      );
      component.createUploadApi(req);
      tick();
      expect(component.verifyApi).not.toHaveBeenCalledWith(req);
      expect(component.handleUploadError).toHaveBeenCalled();
    }));
  });

  describe('handleUploadError', () => {
    it('should update button state, display error message, and set loading state', () => {
      const mockError = {
        detail: ['Some error'],
      };
      component.handleUploadError(mockError);
      expect(component.nextButton.buttonText).toBe(
        'Upload template and continue'
      );
      expect(component.nextButton.disabled).toBeFalse();
      expect(mockUtil.customSnackBar).toHaveBeenCalledWith(
        'Some error',
        ACTION_TYPE.FAILED
      );
      expect(component.dataLoaded).toBeTrue();
    });

    it('should handle error without detail', () => {
      component.handleUploadError();
      expect(component.nextButton.buttonText).toBe(
        'Upload template and continue'
      );
      expect(component.nextButton.disabled).toBeFalse();
      expect(mockUtil.customSnackBar).toHaveBeenCalledWith(
        'Error while uploading template',
        ACTION_TYPE.FAILED
      );
      expect(component.dataLoaded).toBeTrue();
    });
  });

  describe('uploadTemplate', () => {
    it('should upload custom template file', () => {
      spyOn(component, 'uploadCustomTemplate');
      const mockEvent = {
        target: {
          files: ['test'],
        },
      };
      component.customTemplate = true;
      component.uploadTemplate(mockEvent);
      expect(component.dataLoaded).toBeFalse();
      expect(component.loaderText).toBe('Uploading custom template file');
      expect(component.uploadCustomTemplate).toHaveBeenCalled();
    });

    it('should upload template for flow 2', () => {
      spyOn(component, 'createUploadApi');
      const mockEvent = {
        target: {
          files: [
            new File(['mockFileContent'], 'mockFileName.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
          ],
        },
      };
      component.customTemplate = false;
      component.templateType = 2;
      component.templateForm = serviceSpy.templateForm();
      component.templateForm.patchValue({
        templateId: '1',
      });
      component.uploadTemplate(mockEvent);
      expect(component.nextButton).toEqual({
        buttonText: 'Uploading template...',
        disabled: true,
      });

      expect(component.createUploadApi).toHaveBeenCalled();
    });

    it('should upload template for flow 2 show error', () => {
      spyOn(component, 'createUploadApi');
      spyOn(component, 'invalidFormAlert');
      const mockEvent = {
        target: {
          files: [
            new File(['mockFileContent'], 'mockFileName.xlsx', {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
          ],
        },
      };
      component.customTemplate = false;
      component.templateType = 2;
      component.uploadTemplate(mockEvent);
      expect(component.nextButton).toEqual({
        buttonText: 'Uploading template...',
        disabled: true,
      });

      expect(component.createUploadApi).not.toHaveBeenCalled();
      expect(component.invalidFormAlert).toHaveBeenCalled();
    });
  });

  describe('updateTagging', () => {
    it('should toggle the selected property of the item', () => {
      const item = { id: 1, selected: false };
      component.updateTagging(item);
      expect(item.selected).toBe(true);
      component.updateTagging(item);
      expect(item.selected).toBe(false);
    });
  });

  describe('fetchTaggedItems', () => {
    it('should return an array of selected item IDs', () => {
      component.supplySelection = [
        { id: 1, selected: true },
        { id: 2, selected: false },
        { id: 3, selected: true },
      ];
      const taggedItems = component.fetchTaggedItems();
      expect(taggedItems).toEqual([1, 3]);
    });

    it('should return an empty array if no items are selected', () => {
      component.supplySelection = [
        { id: 1, selected: false },
        { id: 2, selected: false },
        { id: 3, selected: false },
      ];
      const taggedItems = component.fetchTaggedItems();
      expect(taggedItems).toEqual([]);
    });

    it('should return an empty array if supplySelection is undefined', () => {
      const taggedItems = component.fetchTaggedItems();
      expect(taggedItems).toEqual([]);
    });
  });

  it('should call customSnackbar', () => {
    component.invalidFormAlert();
    expect(mockUtil.customSnackBar).toHaveBeenCalledWith(
      'Invalid form',
      ACTION_TYPE.FAILED
    );
  });
  describe('uploadCustomTemplate', () => {
    it('should call createNewTemplate and updateStateProp when API call is successful', () => {
      serviceSpy.createNewTemplate.and.returnValue(
        of({
          success: true,
        })
      );

      component.uploadCustomTemplate({
        test: 'test',
      });

      expect(serviceSpy.createNewTemplate).toHaveBeenCalledWith({
        test: 'test',
      });
      expect(storeSpy.updateStateProp).toHaveBeenCalledWith('uploadFileData', {
        success: true,
      });
      expect(storeSpy.goToLinkFields).toHaveBeenCalled();
    });

    it('should call handleUploadError when API call fails', () => {
      const req = {}; // your request object
      const error = 'Server error';
      serviceSpy.createNewTemplate.and.returnValue(
        throwError(() => 'Server error')
      );

      spyOn(component, 'handleUploadError');

      component.uploadCustomTemplate(req);

      expect(component.handleUploadError).toHaveBeenCalledWith(error);
    });
  });
});
