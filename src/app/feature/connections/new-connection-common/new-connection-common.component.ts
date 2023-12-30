/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from 'rxjs';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
// configs
import { ButtonState } from 'fairfood-utils';
import { ITabItem } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// services
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';

@Component({
  selector: 'app-new-connection-common',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '',
})
export class NewConnectionCommonComponent {
  tabGroup: ITabItem[];
  detailsForm: FormGroup;
  addressForm: FormGroup;
  miscForm: FormGroup;
  currentStep: string;
  operationTypes: any[];
  nextButtonState: ButtonState;
  prevButton = 'Back';

  countryList: any[];
  countryCodeList: any[];
  stateList: any[] = [];

  incomingData: any;
  supplySelection: any[] = [];
  pageApis: Subscription[] = [];
  supplySelectionCount = 0;

  loading = true;
  loaderText: string;
  additionalLoader = false;
  selectAll = false;
  viewingAsAdmin: boolean;

  constructor(
    private utils: UtilService,
    public globalStore: GlobalStoreService
  ) {}

  updateCurrentStep(step: string): void {
    this.currentStep = step;
  }

  nextButtonSettings({ buttonText, disabled }: ButtonState): void {
    this.nextButtonState = {
      buttonText,
      disabled,
    };
  }

  stepOne(): void {
    this.updateCurrentStep(this.tabGroup[0].id);
    if (this.detailsForm.valid) {
      this.nextButtonSettings({ buttonText: 'Continue', disabled: false });
    } else {
      this.nextButtonSettings({ buttonText: 'Continue', disabled: true });
    }
  }

  stepTwo(): void {
    this.updateCurrentStep(this.tabGroup[1].id);
    if (this.addressForm.valid) {
      this.nextButtonSettings({ buttonText: 'Continue', disabled: false });
    } else {
      this.nextButtonSettings({ buttonText: 'Continue', disabled: true });
    }
  }

  stepThree(): void {
    this.updateCurrentStep(this.tabGroup[2].id);
    this.nextButtonSettings({ buttonText: 'Add connection', disabled: false });
  }

  changeTab(tabItem: ITabItem): void {
    if (this.currentStep === this.tabGroup[0].id) {
      if (tabItem.id === this.tabGroup[1].id) {
        if (this.detailsForm.valid) {
          this.stepTwo();
        } else {
          this.showError('Please fill all the required fields');
        }
      } else if (tabItem.id === this.tabGroup[2].id) {
        if (this.detailsForm.valid) {
          this.stepThree();
        } else {
          this.showError('Please fill all the required fields');
        }
      } else {
        console.log('Same tab');
      }
    } else if (this.currentStep === this.tabGroup[1].id) {
      this.changeTabAddress(tabItem);
    } else {
      this.changeTabDefault(tabItem);
    }
  }

  changeTabAddress(tabItem: ITabItem): void {
    if (tabItem.id === this.tabGroup[0].id) {
      if (this.addressForm.valid) {
        this.stepOne();
      } else {
        this.showError('Please fill all the required fields');
      }
    } else if (tabItem.id === this.tabGroup[2].id) {
      if (this.addressForm.valid) {
        this.stepThree();
      } else {
        this.showError('Please fill all the required fields');
      }
    } else {
      console.log('Same tab');
    }
  }

  changeTabDefault(tabItem: ITabItem): void {
    if (tabItem.id === this.tabGroup[0].id) {
      this.stepOne();
    } else if (tabItem.id === this.tabGroup[1].id) {
      this.stepTwo();
    } else {
      console.log('Same tab');
    }
  }

  showError(message: string): void {
    this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
  }

  showSuccess(message: string): void {
    this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
  }

  getCountryCodes(): void {
    const sub3 = this.globalStore.countryCodeList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryCodeList = res;
        }
      },
    });
    this.pageApis.push(sub3);
  }

  buttonActionStepOne(): void {
    if (this.detailsForm.valid) {
      this.tabGroup = this.tabGroup.map((p: ITabItem) =>
        p.id === this.tabGroup[1].id ? { ...p, active: true } : p
      );
      this.stepTwo();
    }
  }

  buttonActionStepTwo(): void {
    if (this.addressForm.valid) {
      this.tabGroup = this.tabGroup.map((p: ITabItem) =>
        p.id === this.tabGroup[2].id ? { ...p, active: true } : p
      );
      this.stepThree();
    }
  }

  // Get all countries from API / local cache
  getCountries(): void {
    const sub2 = this.globalStore.countryList$.subscribe({
      next: (res: Record<string, any>[]) => {
        if (res) {
          this.countryList = res;
        }
      },
    });
    this.pageApis.push(sub2);
    this.getCountryCodes();
  }

  updateTagging(item: any): void {
    item.selected = !item.selected;
  }

  setLoaderText(text: string): void {
    this.loaderText = text;
  }

  setStateList(selectedSub: any, firstSelected?: boolean): void {
    this.stateList = Object.keys(selectedSub).map(key => {
      selectedSub[key].name = key;
      selectedSub[key].id = key;
      return selectedSub[key];
    });
    if (firstSelected) {
      this.addressForm.patchValue({
        province: this.stateList[0].id,
      });
    }
  }

  watchFormChanges(): void {
    const formBasic = this.detailsForm.statusChanges.subscribe(st => {
      if (this.currentStep === 'basic') {
        if (st === 'VALID') {
          this.nextButtonSettings({
            buttonText: 'Continue',
            disabled: false,
          });
        } else {
          this.nextButtonSettings({ buttonText: 'Continue', disabled: true });
        }
      }
    });
    this.pageApis.push(formBasic);
    const formAddress = this.addressForm.statusChanges.subscribe(st => {
      if (this.currentStep === 'address') {
        if (st === 'VALID') {
          this.nextButtonSettings({ buttonText: 'Continue', disabled: false });
        } else {
          this.nextButtonSettings({ buttonText: 'Continue', disabled: true });
        }
      }
    });
    this.pageApis.push(formAddress);
  }

  dropdownChanged(newValue: any, controlName: string, form: FormGroup): void {
    const selectedValue = newValue.id === 'All' ? '' : newValue.id;
    form.get(controlName)?.patchValue(selectedValue);

    if (controlName === 'province') {
      form.patchValue({
        latitude: newValue?.latlong[0] || 0,
        longitude: newValue?.latlong[1] || 0,
      });
    }

    if (controlName === 'country') {
      form.patchValue({
        country: selectedValue,
        province: '',
      });
      if (selectedValue) {
        const index = this.countryList.findIndex(m => m.id === selectedValue);
        const selectedSub = this.countryList[index].sub_divisions;
        this.setStateList(selectedSub, true);
      } else {
        this.stateList = [];
      }
    }
    form.get(controlName).markAsDirty();
    form.updateValueAndValidity({ emitEvent: true });
  }

  fetchTaggedItems(): any[] {
    return (this.supplySelection || []).flatMap((e: any) =>
      e.selected ? e.id : []
    );
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }

  updateSelectAll(value: boolean): void {
    this.supplySelection = this.supplySelection.map(s => ({
      ...s,
      selected: value,
    }));
    this.selectAll = value;
  }
}
