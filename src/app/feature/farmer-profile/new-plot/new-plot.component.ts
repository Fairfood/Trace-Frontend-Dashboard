/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// configs
import { PLOT_TABS } from '../farmer-profile.config';
import { ITabItem } from 'src/app/shared/configs/app.model';
import { ButtonState } from 'fairfood-utils';
// services
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { GlobalStoreService } from 'src/app/shared/store';

@Component({
  selector: 'app-new-plot',
  templateUrl: './new-plot.component.html',
  styleUrls: ['./new-plot.component.scss'],
})
export class NewPlotComponent implements OnInit, OnDestroy {
  tabGroup: ITabItem[] = PLOT_TABS;
  currentStep: string;
  nextButtonState: ButtonState;
  loaderText: string;
  dataLoaded: boolean;
  countryList: any[];
  stateList: any[];
  // declare Form group company form
  plotForm: FormGroup = this.fb.group({
    addressDetails: this.fb.group({
      plotName: ['', [Validators.required, Validators.maxLength(20)]],
      street: [''],
      city: [''],
      province: ['', Validators.required],
      country: ['', Validators.required],
      latitude: [
        '0',
        [
          Validators.required,
          Validators.pattern(/^[-+]?[0-9]{1,7}(\.[0-9]+)?$/),
          Validators.min(-90),
          Validators.max(90),
        ],
      ],
      longitude: [
        '0',
        [
          Validators.required,
          Validators.pattern(/^[-+]?[0-9]{1,7}(\.[0-9]+)?$/),
          Validators.min(-180),
          Validators.max(180),
        ],
      ],
      zipcode: [''],
    }),
    plot: this.fb.group({
      cropType: ['', Validators.required],
      totalArea: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          Validators.maxLength(6),
        ],
      ],
    }),
    farmer: [''],
  });

  pageApis: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<NewPlotComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private globalStore: GlobalStoreService,
    private farmerStore: FarmerProfileStoreService
  ) {
    this.currentStep = PLOT_TABS[0].id;
  }

  ngOnInit(): void {
    this.nextButtonState = {
      action: 'init',
      buttonText: 'Continue',
      currentStep: this.currentStep,
      disabled: true,
    };
    this.loaderText = 'Loading data';
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
    const formAddress = this.plotForm
      .get('addressDetails')
      .statusChanges.subscribe(st => {
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
  }

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
        ...addressDetails
      } = plot;
      const index = this.countryList.findIndex(m => m.id === country);
      const selectedSub = this.countryList[index].sub_divisions;
      this.setStateList(selectedSub, true);
      this.addressPatch({
        plotName,
        ...addressDetails,
        country,
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

  setButtonText(): void {
    if (this.currentStep === 'basic') {
      this.nextButtonState.buttonText = 'Continue';
    } else {
      this.nextButtonState.buttonText = 'Done';
    }
  }

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

  addressPatch(values: any): void {
    this.plotForm.get('addressDetails').patchValue({
      ...values,
    });
  }

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
        this.nextButtonState.buttonText = 'Done';
      } else {
        // api call
        this.createPlot();
      }
    } else {
      if (this.currentStep === 'basic') {
        this.close();
      } else {
        this.currentStep = 'basic';
        this.nextButtonState.buttonText = 'Continue';
      }
    }
    this.checkFormAndButton();
  }

  createPlot(): void {
    const { plot, addressDetails, farmer } = this.plotForm.value;
    const {
      plotName,
      city,
      country,
      latitude,
      longitude,
      province,
      zipcode,
      street,
    } = addressDetails;
    const { totalArea, cropType } = plot;
    const reqObj = {
      house_name: '',
      street,
      city,
      province,
      country,
      latitude,
      longitude,
      zipcode,
      name: plotName,
      location_type: 'APPROXIMATE',
      total_plot_area: totalArea,
      crop_types: cropType,
      farmer,
    };
    this.farmerStore.setPlotsArray({
      count: 0,
      loading: true,
      results: [],
    });
    if (this.data.isEdit) {
      this.nextButtonState.buttonText = 'Updating the details';
      const { id } = this.data.plot;
      const api = this.farmerStore.updatePlot(id, reqObj).subscribe({
        next: res => {
          this.dialogRef.close(res);
        },
      });
      this.pageApis.push(api);
    } else {
      this.nextButtonState.buttonText = 'Creating the plot';
      const api = this.farmerStore
        .createFarmerPlot(this.data.farmer, reqObj)
        .subscribe({
          next: res => {
            this.dialogRef.close(res);
          },
        });
      this.pageApis.push(api);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
