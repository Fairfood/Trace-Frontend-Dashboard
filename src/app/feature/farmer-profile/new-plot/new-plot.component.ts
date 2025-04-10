/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// material modules
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
// configs
import { PLOT_TABS } from '../farmer-profile.constants';
import { ICommonObj, ITabItem } from 'src/app/shared/configs/app.model';
import { IReference, PLOT_TYPES } from '../farmer-profile.config';
// services
import { FarmerProfileStoreService } from '../';
import { GlobalStoreService } from 'src/app/shared/store';
import { NewPlotService } from './new-plot.service';
// components
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import {
  ActionButtonsComponent,
  ButtonState,
  FairFoodCustomTabComponent,
} from 'fairfood-utils';

@Component({
  selector: 'app-new-plot',
  templateUrl: './new-plot.component.html',
  styleUrls: ['./new-plot.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    FairFoodInputComponent,
    FairFoodCustomTabComponent,
    ActionButtonsComponent,
    TranslateModule,
    FfDropdownComponent,
    MatRadioModule,
  ],
})
export class NewPlotComponent implements OnInit, OnDestroy {
  tabGroup: ITabItem[] = PLOT_TABS;
  currentStep: string;
  nextButtonState: ButtonState;

  dataLoaded: boolean;
  countryList: any[];
  stateList: any[];
  // declare plot form
  plotForm: FormGroup = this.service.getPlotForm();

  continueButton = this.translate.instant('button.continue');
  farmTypes: ICommonObj[];
  pageApis: Subscription[] = [];

  constructor(
    public dialogRef: MatDialogRef<NewPlotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private globalStore: GlobalStoreService,
    public farmerStore: FarmerProfileStoreService,
    private translate: TranslateService,
    private service: NewPlotService
  ) {
    this.currentStep = PLOT_TABS[0].id;
  }

  ngOnInit(): void {
    this.farmTypes = PLOT_TYPES;
    this.nextButtonState = {
      action: 'init',
      buttonText: this.continueButton,
      currentStep: this.currentStep,
      disabled: true,
    };
    this.setCountryData();
    this.formValueChangesSubscription();
  }

  setCountryData(): void {
    const sub2 = this.globalStore.countryList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryList = res;
          this.dataLoaded = true;
          this.patchFormValue();
        }
      },
    });
    this.pageApis.push(sub2);
  }

  formValueChangesSubscription(): void {
    const addressForm = this.plotForm.get('addressDetails');
    const formAddress = addressForm.statusChanges.subscribe(st => {
      if (this.currentStep === 'basic') {
        this.checkValidityOfForms(st);
      } else {
        this.enableNextButton();
      }
    });
    this.pageApis.push(formAddress);
    const formChange = this.plotForm.get('plot').statusChanges.subscribe(st => {
      if (this.currentStep === 'plot') {
        this.checkValidityOfForms(st);
      } else {
        this.enableNextButton();
      }
    });
    this.pageApis.push(formChange);

    // plot type radio button change subscription
    const typeChanges = addressForm.get('plotType').valueChanges.subscribe({
      next: (value: string) => {
        if (value === this.farmTypes[2].id) {
          this.geoJsonPlotType(addressForm);
        } else {
          this.addressPlot(addressForm);
        }
      },
    });

    this.pageApis.push(typeChanges);
  }

  /**
   * Accurate type selected: set validators for latitude and longitude only
   * @param addressForm formgroup type
   */
  addressPlot(addressForm: any): void {
    this.service.setFormValidator(addressForm, 'latitude');
    this.service.setFormValidator(addressForm, 'longitude');
    this.service.setLatitudeValidators(addressForm, 'latitude');
    this.service.setlongitudeValidators(addressForm, 'longitude');
    // clear other validators
    this.service.clearValidators(addressForm, 'geoJson');
  }

  /**
   * If geojson selected then country, province or address + geojson is required
   * @param addressForm formgroup type
   */
  geoJsonPlotType(addressForm: any): void {
    this.service.setFormValidator(addressForm, 'geoJson');
    // clear other validators
    this.service.clearValidators(addressForm, 'longitude');
    this.service.clearValidators(addressForm, 'latitude');
  }

  /* istanbul ignore next */
  checkValidityOfForms(status: string): void {
    if (status === 'VALID') {
      this.enableNextButton();
    } else {
      this.disableNextButton();
    }
  }

  enableNextButton(): void {
    this.nextButtonState.disabled = false;
  }

  disableNextButton(): void {
    this.nextButtonState.disabled = true;
  }

  patchFormValue(): void {
    const { isEdit, plot, farmer } = this.data;
    if (isEdit) {
      const {
        crop_types: cropType,
        total_plot_area: totalArea,
        name: plotName,
        country,
        location_type: plotType,
        geo_json: geoJson,
        ...addressDetails
      } = plot;

      const index = country
        ? this.countryList.findIndex(m => m.id === country)
        : 0;

      if (plotType !== PLOT_TYPES[2].id) {
        this.service.setFormValidator(
          this.plotForm.get('addressDetails'),
          'latitude'
        );
        this.service.setFormValidator(
          this.plotForm.get('addressDetails'),
          'longitude'
        );
        this.service.setLatitudeValidators(
          this.plotForm.get('addressDetails'),
          'latitude'
        );
        this.service.setlongitudeValidators(
          this.plotForm.get('addressDetails'),
          'longitude'
        );
      }
      const selectedSub = this.countryList[index]?.sub_divisions;
      this.setStateList(selectedSub, true);
      this.addressPatch({
        plotName,
        ...addressDetails,
        country: country ?? this.countryList[0].id,
        plotType,
        geoJson,
      });
      this.plotForm.patchValue({
        plot: {
          cropType,
          totalArea,
        },
        farmer,
      });
      this.enableNextButton();
      this.enableSecondTab();
    } else {
      this.plotForm.patchValue({
        farmer,
      });
    }
  }

  changeTab(data: ITabItem): void {
    this.currentStep = data.id;
    this.setButtonText();
    this.checkFormAndButton();
  }

  /* istanbul ignore next */
  setButtonText(): void {
    if (this.currentStep === 'basic') {
      this.nextButtonState.buttonText = this.continueButton;
    } else {
      this.nextButtonState.buttonText = this.translate.instant('button.done');
    }
  }

  /* istanbul ignore next */
  checkFormAndButton(): void {
    if (this.currentStep === 'basic') {
      if (this.plotForm.get('addressDetails').valid) {
        this.enableNextButton();
      } else {
        this.disableNextButton();
      }
    } else {
      if (this.plotForm.get('plot').valid) {
        this.enableNextButton();
      } else {
        this.disableNextButton();
      }
    }
  }

  /* istanbul ignore next */
  addressPatch(values: any): void {
    this.plotForm.get('addressDetails').patchValue({
      ...values,
    });
  }

  /* istanbul ignore next */
  setStateList(selectedSub: any, selectFirst?: boolean): void {
    this.stateList = Object.keys(selectedSub).map(key => {
      selectedSub[key].name = key;
      selectedSub[key].id = key;
      return selectedSub[key];
    });

    if (selectFirst && this.stateList?.[0]) {
      const { id, latlong } = this.stateList[0];
      this.addressPatch({
        province: id,
        latitude: latlong[0],
        longitude: latlong[1],
      });
    }
  }

  /* istanbul ignore next */
  dropdownChanged(data: any, formControlName: string): void {
    const selectedValue = data.id === 'All' ? '' : data.id;

    if (formControlName === 'country') {
      if (selectedValue) {
        const index = this.countryList.findIndex(m => m.id === selectedValue);
        const selectedSub = this.countryList[index].sub_divisions;
        this.setStateList(selectedSub, true);
        this.addressPatch({
          country: selectedValue,
        });
      } else {
        this.stateList = [];
        this.addressPatch({ country: '', province: '' });
      }
    } else {
      this.addressPatch({
        province: selectedValue,
        latitude: data.latlong[0],
        longitude: data.latlong[1],
      });
    }
  }

  enableSecondTab(): void {
    this.tabGroup = this.tabGroup.map((p: ITabItem) =>
      p.id === 'plot' ? { ...p, active: true } : p
    );
  }

  nextClicked(data: any): void {
    if (data === 'next') {
      if (this.currentStep === 'basic') {
        this.currentStep = 'plot';
        this.enableSecondTab();
        if (this.data.isEdit) {
          this.enableNextButton();
        } else {
          this.disableNextButton();
        }
        this.nextButtonState.buttonText = this.translate.instant('button.done');
      } else {
        // api call
        this.createPlot();
      }
    } else {
      if (this.currentStep === 'basic') {
        this.close();
      } else {
        this.currentStep = 'basic';
        this.nextButtonState.buttonText = this.continueButton;
      }
    }
    this.checkFormAndButton();
  }

  /* istanbul ignore next */
  createPlot(): void {
    const { error, reqObj } = this.service.constructApiPayload(
      this.plotForm.value
    );

    if (!error) {
      const API_SUB = {
        next: (res: any) => {
          this.createSuccess(res);
        },
        error: (err: any) => {
          this.createError(err);
        },
      };

      if (this.data.isEdit) {
        this.nextButtonState.buttonText =
          this.translate.instant('newPlot.update');
        const { id } = this.data.plot;
        const api = this.farmerStore.updatePlot(id, reqObj).subscribe(API_SUB);
        this.pageApis.push(api);
      } else {
        this.nextButtonState.buttonText =
          this.translate.instant('newPlot.create');
        const api = this.farmerStore
          .createFarmerPlot(this.data.farmer, reqObj)
          .subscribe(API_SUB);
        this.pageApis.push(api);
      }
    }
  }

  createSuccess(res: any): void {
    this.farmerStore.updateStateProp<IReference>('plots', {
      count: 0,
      loading: true,
      results: [],
    });
    this.dialogRef.close(res);
  }

  createError(err: any): void {
    console.log(err);
    const message = this.translate.instant('formValidation.alert');
    this.service.showErrorMessage(message);
    this.nextButtonState.buttonText = this.continueButton;
  }

  close(): void {
    this.dialogRef.close();
  }

  /* istanbul ignore next */
  get addressForm() {
    return this.plotForm.get('addressDetails');
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
