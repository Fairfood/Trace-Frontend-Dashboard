import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPlotComponent } from './new-plot.component';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { FarmerProfileStoreService } from '../';
import { GlobalStoreService } from 'src/app/shared/store';
import { NewPlotService } from './new-plot.service';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { PLOT_TABS } from '../farmer-profile.constants';
import { PLOT_TYPES } from '../farmer-profile.config';

describe('NewPlotComponent', () => {
  let component: NewPlotComponent;
  let fixture: ComponentFixture<NewPlotComponent>;
  let serviceMock: jasmine.SpyObj<NewPlotService>;
  let globalMock: jasmine.SpyObj<GlobalStoreService>;

  beforeEach(async () => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      // use: () => {},
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    serviceMock = jasmine.createSpyObj('NewPlotService', [
      'createPlot',
      'showErrorMessage',
      'getPlotForm',
      'setFormValidator',
      'setLatitudeValidators',
      'clearValidators',
      'constructApiPayload',
    ]);

    globalMock = jasmine.createSpyObj('GlobalStoreService', ['countryList$']);
    globalMock.countryList$ = of([
      {
        id: 1,
        name: 'India',
        code: 'IN',
      },
    ]);
    await TestBed.configureTestingModule({
      imports: [
        NewPlotComponent,
        CommonModule,
        MatDialogModule,
        MatIconModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatRadioModule,
        HttpClientModule,
        MatSnackBarModule,
      ],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: GlobalStoreService, useValue: globalMock },
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        FarmerProfileStoreService,
        {
          provide: NewPlotService,
          useValue: serviceMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPlotComponent);
    component = fixture.componentInstance;
    const formBuilder = TestBed.inject(FormBuilder);
    serviceMock.getPlotForm.and.returnValue(
      formBuilder.group({
        addressDetails: formBuilder.group({
          plotType: [''],
          plotName: ['', Validators.required],
          street: [''],
          city: [''],
          province: [''],
          country: [''],
          latitude: [''],
          longitude: [''],
          zipcode: [''],
          geoJson: [''],
        }),
        plot: formBuilder.group({
          cropType: ['', Validators.required],
          totalArea: [''],
        }),
        farmer: [''],
      })
    );
    component.nextButtonState = {
      disabled: false,
      buttonText: 'Next',
    };
    component.plotForm = serviceMock.getPlotForm();
    component.farmTypes = PLOT_TYPES;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog', () => {
    spyOn(component.dialogRef, 'close');
    component.close();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  it('createError', () => {
    component.nextButtonState = {
      disabled: false,
      buttonText: 'Next',
    };
    component.createError({ message: 'error' });
    expect(serviceMock.showErrorMessage).toHaveBeenCalled();
  });

  it('createSuccess', () => {
    spyOn(component.dialogRef, 'close');
    spyOn(component.farmerStore, 'updateStateProp');
    component.createSuccess({
      success: true,
    });
    expect(component.dialogRef.close).toHaveBeenCalled();
    expect(component.farmerStore.updateStateProp).toHaveBeenCalled();
  });

  it('enableSecondTab', () => {
    component.tabGroup = PLOT_TABS;
    component.enableSecondTab();
    expect(component.tabGroup[1].active).toBe(true);
  });

  it('ngOnInit', () => {
    spyOn(component, 'setCountryData');
    spyOn(component, 'formValueChangesSubscription');
    component.ngOnInit();

    expect(component.plotForm).toBeTruthy();
    expect(component.setCountryData).toHaveBeenCalled();
    expect(component.formValueChangesSubscription).toHaveBeenCalled();
  });

  describe('nextClicked', () => {
    it('should call with "next"', () => {
      // arrange
      spyOn(component, 'createPlot');
      component.currentStep = 'plot';
      component.nextClicked('next');

      expect(component.createPlot).toHaveBeenCalled();
    });
    it('should call with "next"', () => {
      // arrange
      spyOn(component, 'createPlot');
      spyOn(component, 'enableSecondTab');
      spyOn(component, 'disableNextButton');
      component.currentStep = 'basic';
      component.nextClicked('next');
      // assert
      expect(component.createPlot).not.toHaveBeenCalled();
      expect(component.currentStep).toBe('plot');
      expect(component.enableSecondTab).toHaveBeenCalled();
      expect(component.disableNextButton).toHaveBeenCalled();
    });
    it('should call with "next"', () => {
      // arrange
      component.data = {
        isEdit: true,
      };
      spyOn(component, 'enableNextButton');
      component.currentStep = 'basic';
      component.nextClicked('next');
      // assert
      expect(component.enableNextButton).toHaveBeenCalled();
    });

    it('should call with "prev"', () => {
      // arrange
      component.data = {
        isEdit: true,
      };
      spyOn(component, 'close');
      component.currentStep = 'basic';
      component.nextClicked('prev');
      // assert
      expect(component.close).toHaveBeenCalled();
    });

    it('should call with "prev"', () => {
      // arrange
      component.data = {
        isEdit: true,
      };
      spyOn(component, 'close');
      component.currentStep = 'plot';
      component.nextClicked('prev');
      // assert
      expect(component.currentStep).toBe('basic');
    });
  });

  it('setCountryData', () => {
    spyOn(component, 'patchFormValue');
    component.setCountryData();

    expect(component.countryList).toEqual([
      {
        id: 1,
        name: 'India',
        code: 'IN',
      },
    ]);
    expect(component.dataLoaded).toBeTruthy();
    expect(component.patchFormValue).toHaveBeenCalled();
  });

  describe('formValueChangesSubscription', () => {
    it('should call checkValidityOfForms if current step is basic', () => {
      spyOn(component, 'checkValidityOfForms');
      component.currentStep = 'basic';
      component.formValueChangesSubscription();
      const addressForm = component.plotForm.get('addressDetails');
      addressForm.patchValue({
        plotType: '1',
      });
      expect(component.checkValidityOfForms).toHaveBeenCalled();
    });

    it('should call checkValidityOfForms if current step is plot', () => {
      spyOn(component, 'enableNextButton');
      component.currentStep = 'plot';
      component.formValueChangesSubscription();
      const addressForm = component.plotForm.get('addressDetails');
      addressForm.patchValue({
        plotType: '1',
      });
      expect(component.enableNextButton).toHaveBeenCalled();
    });

    it('should call checkValidityOfForms if current step is plot', () => {
      spyOn(component, 'checkValidityOfForms');
      component.currentStep = 'plot';
      component.formValueChangesSubscription();
      const plotForm = component.plotForm.get('plot');
      plotForm.patchValue({
        cropType: '1',
      });
      expect(component.checkValidityOfForms).toHaveBeenCalled();
    });

    it('should call checkValidityOfForms if current step is basic', () => {
      spyOn(component, 'enableNextButton');
      component.currentStep = 'basic';
      component.formValueChangesSubscription();
      const plotForm = component.plotForm.get('plot');
      plotForm.patchValue({
        cropType: '1',
      });
      expect(component.enableNextButton).toHaveBeenCalled();
    });
  });

  it('enableNextButton', () => {
    component.enableNextButton();
    expect(component.nextButtonState).toEqual({
      disabled: false,
      buttonText: 'Next',
    });
  });

  describe('patchFormValue', () => {
    it('not editing', () => {
      spyOn(component.plotForm, 'patchValue');
      component.data = {
        isEdit: false,
        plot: '',
        farmer: '23123',
      };
      component.patchFormValue();
      expect(component.plotForm.patchValue).toHaveBeenCalledWith({
        farmer: '23123',
      });
    });

    it('not editing', () => {
      spyOn(component.plotForm, 'patchValue');
      spyOn(component, 'setStateList');
      spyOn(component, 'addressPatch');
      spyOn(component, 'enableNextButton');
      spyOn(component, 'enableSecondTab');
      component.countryList = [
        {
          id: 1,
          name: 'India',
          code: 'IN',
          sub_divisions: [],
        },
      ];
      component.data = {
        isEdit: true,
        plot: {
          crop_types: '1',
          total_plot_area: '123',
          name: 'plot',
          location_type: 'ACCURATE',
          geo_json: '',
          country: 'India',
        },
        farmer: '23123',
      };
      component.patchFormValue();
      expect(serviceMock.setFormValidator).toHaveBeenCalledTimes(2);
      expect(component.setStateList).toHaveBeenCalled();
      expect(component.addressPatch).toHaveBeenCalled();
      expect(serviceMock.setLatitudeValidators).toHaveBeenCalledTimes(2);
      expect(component.plotForm.patchValue).toHaveBeenCalled();
      expect(component.enableNextButton).toHaveBeenCalled();
      expect(component.enableSecondTab).toHaveBeenCalled();
    });
  });

  it('geoJsonPlotType', () => {
    component.geoJsonPlotType(component.addressForm);
    expect(serviceMock.setFormValidator).toHaveBeenCalled();
    expect(serviceMock.clearValidators).toHaveBeenCalledTimes(2);
  });

  it('changeTab', () => {
    spyOn(component, 'checkFormAndButton');
    spyOn(component, 'setButtonText');
    component.changeTab({
      id: 'plot',
      name: 'Plot details',
      description: 'Add plot details',
      active: false,
    });
    expect(component.currentStep).toBe('plot');
    expect(component.checkFormAndButton).toHaveBeenCalled();
    expect(component.setButtonText).toHaveBeenCalled();
  });
});

class MatDialogRefStub {
  close(): void {
    console.log('hi');
  }
}
