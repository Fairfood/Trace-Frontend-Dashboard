import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { TemplateMappingComponent } from './template-mapping.component';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { mockSchema } from '../mapping-table/mapping-table.component.spec';

describe('TemplateMappingComponent', () => {
  let component: TemplateMappingComponent;
  let fixture: ComponentFixture<TemplateMappingComponent>;
  let serviceSpy: jasmine.SpyObj<DynamicTemplateUploadService>;
  let storeSpy: jasmine.SpyObj<DynamicTemplateStore>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('DynamicTemplateUploadService', [
      'linkFieldForm',
      'linkFieldFormConnection',
      'showError',
      'verifyUpload',
      'getPreviewOfUploadedTemplate',
      'templateSchemaFields',
      'mapSchemaFields',
      'deleteUploadedFile',
      'patchTemplate',
      'templateAction$',
      'updateRowIndex$',
    ]);
    serviceSpy.updateRowIndex$ = new BehaviorSubject(null);
    serviceSpy.templateAction$ = new Subject();

    storeSpy = jasmine.createSpyObj('DynamicTemplateStore', [
      'updateStateProp',
      'getCurrentTemplateType',
      'validationApiSuccess',
      'removeNewUplod',
      'uploadFileData$',
      'schemaArray$',
    ]);
    storeSpy.getCurrentTemplateType.and.returnValue(1);
    storeSpy.uploadFileData$ = new Subject();
    storeSpy.schemaArray$ = new Subject();

    await TestBed.configureTestingModule({
      imports: [TemplateMappingComponent],
      providers: [
        {
          provide: DynamicTemplateUploadService,
          useValue: serviceSpy,
        },
        {
          provide: DynamicTemplateStore,
          useValue: storeSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateMappingComponent);
    component = fixture.componentInstance;
    const formBuilder = TestBed.inject(FormBuilder);
    serviceSpy.linkFieldForm.and.returnValue(
      formBuilder.group({
        templateId: [''],
        title: [''],
        dataRow: ['', Validators.required],
        saveTemplate: [true],
        templateName: [''],
        productName: [''],
        product: [''],
        unit: [''],
        currency: [''],
        fileName: [''],
      })
    );

    serviceSpy.linkFieldFormConnection.and.returnValue(
      formBuilder.group({
        templateId: [''],
        title: [''],
        dataRow: ['', Validators.required],
        saveTemplate: [true],
        templateName: [''],
        fileName: [''],
      })
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit', () => {
    it('should initialize the component', () => {
      spyOn(component, 'templateAction');
      spyOn(component, 'getUploadedFileData');
      spyOn(component, 'formValueChanges');
      spyOn(component, 'saveTemplateValueChanges');
      spyOn(component, 'titleValueChanges');

      storeSpy.schemaArray$ = of(mockSchema);

      component.ngOnInit();

      expect(storeSpy.getCurrentTemplateType).toHaveBeenCalled();
      expect(serviceSpy.linkFieldForm).toHaveBeenCalled();
      expect(component.templateAction).toHaveBeenCalled();
      expect(component.getUploadedFileData).toHaveBeenCalled();
      expect(component.formValueChanges).toHaveBeenCalled();
      expect(component.saveTemplateValueChanges).toHaveBeenCalled();
      expect(component.titleValueChanges).toHaveBeenCalled();

      component.schemaFields$.subscribe(data => {
        expect(data).toEqual(mockSchema);
        expect(component.isValid).toBe(false);
      });
    });

    it('should call linkFieldFormConnection when it is on connection page', () => {
      storeSpy.getCurrentTemplateType.and.returnValue(2);
      component.ngOnInit();
      expect(storeSpy.getCurrentTemplateType).toHaveBeenCalled();
      expect(serviceSpy.linkFieldFormConnection).toHaveBeenCalled();
    });
  });

  // Test saveTemplateValueChanges method
  describe('saveTemplateValueChanges', () => {
    it('should handle saveTemplate value changes selected true', () => {
      // Mock necessary form control values
      const saveTemplateControl =
        component.templateSelectionForm.get('saveTemplate');

      component.saveTemplateValueChanges();

      saveTemplateControl.setValue(true); // Or false, based on your test case
      expect(
        component.templateSelectionForm.get('templateName').enabled
      ).toEqual(true);
      expect(component.visibilityOfName).toEqual(true);
    });

    it('should handle saveTemplate value changes selected false', () => {
      // Mock necessary form control values
      const saveTemplateControl =
        component.templateSelectionForm.get('saveTemplate');

      component.saveTemplateValueChanges();
      saveTemplateControl.setValue(false); // Or false, based on your test case

      expect(
        component.templateSelectionForm.get('templateName').enabled
      ).toEqual(false);
      expect(component.visibilityOfName).toEqual(false);
    });
  });

  // Test titleValueChanges method
  describe('titleValueChanges', () => {
    it('should handle title value changes', () => {
      component.titleValueChanges();

      const titleControl = component.templateSelectionForm.get('title');
      titleControl.setValue('1');

      expect(component.templateSelectionForm.get('dataRow').value).toEqual(2);
    });
  });

  describe('formValueChanges', () => {
    it('should update nextButton.disabled based on form status', () => {
      component.formValueChanges();
      const nextButton = { buttonText: 'Continue', disabled: true };
      component.nextButton = nextButton;

      fixture.detectChanges();

      // Simulate form status change to VALID
      component.templateSelectionForm.patchValue({ dataRow: 'some value' });

      // Expect nextButton.disabled to be false
      expect(component.nextButton.disabled).toBe(false);

      component.templateSelectionForm.patchValue({ dataRow: '' });

      // Expect nextButton.disabled to be false
      expect(component.nextButton.disabled).toBe(true);
    });

    it('should handle dataRow value changes', () => {
      component.templateSelectionForm.patchValue({ title: '1' });
      component.formValueChanges();
      // Simulate dataRow value change to be less than title
      component.templateSelectionForm.patchValue({ dataRow: '1' });

      // Expect dataRow to be updated to title + 1
      expect(component.templateSelectionForm.get('dataRow').value).toEqual(2);
      expect(serviceSpy.showError).toHaveBeenCalledWith(
        `Data row should be greater than title row. Updating data row to 2`
      );
    });
  });

  // Test the templateAction method
  describe('templateAction', () => {
    it('should call removeNewUplod when action is "remove"', () => {
      component.templateAction();
      serviceSpy.templateAction$.next('remove');

      expect(storeSpy.removeNewUplod).toHaveBeenCalled();
    });
  });

  describe('getUploadedFileData', () => {
    it('should fetch file data and call necessary methods when uploadStarted is false', () => {
      spyOn(component, 'commonPatch');
      spyOn(component, 'transactionPatch');
      spyOn(component, 'fetchTemplatePreview');
      const responseData: any = {
        title_row: '0',
        field_details: [],
        id: '1',
        latest_upload: { id: '2' },
      };

      component.uploadStarted = false;

      // Mock the uploadFileData$ observable
      const uploadFileDataSubject = new BehaviorSubject<any>(responseData);
      storeSpy.uploadFileData$ = uploadFileDataSubject.asObservable();

      component.getUploadedFileData();

      // Trigger the subscription manually
      uploadFileDataSubject.next(responseData);

      expect(component.commonPatch).toHaveBeenCalledWith(responseData);
      expect(component.transactionPatch).toHaveBeenCalledWith(responseData);
      expect(component.fetchTemplatePreview).toHaveBeenCalledWith(
        responseData.id,
        responseData.field_details
      );
      expect(component.deleteFile).toBeTrue();
    });
  });

  describe('handleUploadError', () => {
    it('should show error message when error is provided', () => {
      const errorMessage = 'Error occurred while updating template';

      component.handleUploadError({ detail: [errorMessage] });

      expect(serviceSpy.showError).toHaveBeenCalledWith(errorMessage);
    });

    it('should show default error message when no error is provided', () => {
      component.handleUploadError();

      expect(serviceSpy.showError).toHaveBeenCalledWith(
        'Error while updating template'
      );
    });
  });

  describe('buttonAction', () => {
    it('should call validateColumnMapping if type is "next"', () => {
      spyOn(component, 'validateColumnMapping');

      component.buttonAction('next');

      expect(component.validateColumnMapping).toHaveBeenCalled();
    });

    it('should call service.templateAction$.next("remove") if type is not "next"', () => {
      spyOn(serviceSpy.templateAction$, 'next');

      component.buttonAction('back');

      expect(serviceSpy.templateAction$.next).toHaveBeenCalledWith('remove');
    });
  });

  describe('validateColumnMapping', () => {
    it('should call patchTemplate if isValid is true', () => {
      spyOn(component, 'patchTemplate');
      component.isValid = true;

      component.validateColumnMapping();

      expect(component.loading).toBeTrue();
      expect(component.loaderText).toEqual('Saving template');
      expect(component.patchTemplate).toHaveBeenCalled();
    });

    it('should call service.showError if isValid is false', () => {
      component.isValid = false;

      component.validateColumnMapping();

      expect(serviceSpy.showError).toHaveBeenCalledWith(
        'Please map all required fields'
      );
    });
  });

  describe('commonPatch', () => {
    it('should patch the form values correctly', () => {
      const testData = {
        title_row: '1',
        name: 'Test Template',
        id: '123',
        latest_upload: { id: '456' },
      };

      component.commonPatch(testData);

      expect(component.templateSelectionForm.value).toEqual({
        templateId: '123',
        title: 2,
        dataRow: 3,
        saveTemplate: true,
        templateName: '',
        productName: '',
        product: '',
        unit: '',
        currency: '',
      });
      expect(
        component.templateSelectionForm.get('fileName').disabled
      ).toBeTrue();
    });
  });

  describe('transactionPatch', () => {
    it('should patch the form values correctly', () => {
      const testData = {
        unit: '100',
        currency: 'USD',
        product_details: { id: '789', name: 'testing' },
      };

      component.transactionPatch(testData);

      expect(component.templateSelectionForm.value).toEqual({
        templateId: '',
        title: '',
        dataRow: '',
        saveTemplate: true,
        templateName: '',
        productName: 'testing',
        product: '789',
        unit: '100',
        currency: 'USD',
        fileName: '',
      });
    });

    it('should handle undefined product_details', () => {
      const testData: any = {
        unit: '100',
        currency: 'USD',
        product_details: undefined,
      };

      component.transactionPatch(testData);

      expect(component.templateSelectionForm.value).toEqual({
        templateId: '',
        title: '',
        dataRow: '',
        saveTemplate: true,
        templateName: '',
        productName: '',
        product: '',
        unit: '100',
        currency: 'USD',
        fileName: '',
      });
    });
  });
});
