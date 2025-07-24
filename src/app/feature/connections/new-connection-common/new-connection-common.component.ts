/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from 'rxjs';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
// configs
import { ButtonState } from 'fairfood-utils';
import { ITabItem } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// services
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-new-connection-common',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: '',
})
export class NewConnectionCommonComponent {
  protected readonly utils = inject(UtilService);
  protected readonly globalStore = inject(GlobalStoreService);
  protected readonly translate = inject(TranslateService);
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
  continueButtonEnabled = {
    buttonText: this.translate.instant('button.continue'),
    disabled: false,
  };
  continueButtonDisabled = {
    buttonText: this.translate.instant('button.continue'),
    disabled: true,
  };
  buttonId = 'continueButton';

  initData(): void {
    const impersonate = localStorage.getItem('impersonate');
    this.viewingAsAdmin = impersonate === 'true';
    this.setLoaderText(this.translate.instant('loaderText.connectionInfo'));
  }

  updateCurrentStep(step: string): void {
    this.currentStep = step;
  }

  nextButtonSettings({ buttonText, disabled }: ButtonState): void {
    this.nextButtonState = {
      buttonText,
      disabled,
    };
    if (buttonText !== this.translate.instant('button.continue')) {
      this.buttonId = 'createConnectionButton';
    } else {
      this.buttonId = 'continueButton';
    }
  }

  stepOne(): void {
    this.updateCurrentStep(this.tabGroup[0].id);
    if (this.detailsForm.valid) {
      this.nextButtonSettings(this.continueButtonEnabled);
    } else {
      this.nextButtonSettings(this.continueButtonDisabled);
    }
  }
  /* istanbul ignore next */
  stepTwo(): void {
    this.updateCurrentStep(this.tabGroup[1].id);
    if (this.addressForm.valid) {
      this.nextButtonSettings(this.continueButtonEnabled);
    } else {
      this.nextButtonSettings(this.continueButtonDisabled);
    }
  }
  /* istanbul ignore next */
  stepThree(): void {
    this.updateCurrentStep(this.tabGroup[2].id);
    this.nextButtonSettings({
      buttonText: this.translate.instant('connections.addConnection'),
      disabled: false,
    });
  }
  /* istanbul ignore next */
  changeTab(tabItem: ITabItem): void {
    if (this.currentStep === this.tabGroup[0].id) {
      if (tabItem.id === this.tabGroup[1].id) {
        if (this.detailsForm.valid) {
          this.stepTwo();
        } else {
          this.showError(this.translate.instant('formValidation.required'));
        }
      } else if (tabItem.id === this.tabGroup[2].id) {
        if (this.detailsForm.valid) {
          this.stepThree();
        } else {
          this.showError(this.translate.instant('formValidation.required'));
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
  /* istanbul ignore next */
  changeTabAddress(tabItem: ITabItem): void {
    if (tabItem.id === this.tabGroup[0].id) {
      if (this.addressForm.valid) {
        this.stepOne();
      } else {
        this.showError(this.translate.instant('formValidation.required'));
      }
    } else if (tabItem.id === this.tabGroup[2].id) {
      if (this.addressForm.valid) {
        this.stepThree();
      } else {
        this.showError(this.translate.instant('formValidation.required'));
      }
    } else {
      console.log('Same tab');
    }
  }
  /* istanbul ignore next */
  changeTabDefault(tabItem: ITabItem): void {
    if (tabItem.id === this.tabGroup[0].id) {
      this.stepOne();
    } else if (tabItem.id === this.tabGroup[1].id) {
      this.stepTwo();
    } else {
      console.log('Same tab');
    }
  }
  /* istanbul ignore next */
  showError(message: string): void {
    this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
  }
  /* istanbul ignore next */
  showSuccess(message: string): void {
    this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
  }
  /* istanbul ignore next */
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
  /* istanbul ignore next */
  buttonActionStepOne(): void {
    if (this.detailsForm.valid) {
      this.tabGroup = this.tabGroup.map((p: ITabItem) =>
        p.id === this.tabGroup[1].id ? { ...p, active: true } : p
      );
      this.stepTwo();
    }
  }
  /* istanbul ignore next */
  buttonActionStepTwo(): void {
    if (this.addressForm.valid) {
      this.tabGroup = this.tabGroup.map((p: ITabItem) =>
        p.id === this.tabGroup[2].id ? { ...p, active: true } : p
      );
      this.stepThree();
    }
  }

  // Get all countries from API / local cache
  /* istanbul ignore next */
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
  /* istanbul ignore next */
  updateTagging(item: any): void {
    item.selected = !item.selected;
  }
  /* istanbul ignore next */
  setLoaderText(text: string): void {
    this.loaderText = text;
  }
  /* istanbul ignore next */
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
  /* istanbul ignore next */
  watchFormChanges(): void {
    const formBasic = this.detailsForm.statusChanges.subscribe(st => {
      if (this.currentStep === 'basic') {
        if (st === 'VALID') {
          this.nextButtonSettings(this.continueButtonEnabled);
        } else {
          this.nextButtonSettings(this.continueButtonDisabled);
        }
      }
    });
    this.pageApis.push(formBasic);
    const formAddress = this.addressForm.statusChanges.subscribe(st => {
      if (this.currentStep === 'address') {
        if (st === 'VALID') {
          this.nextButtonSettings(this.continueButtonEnabled);
        } else {
          this.nextButtonSettings(this.continueButtonDisabled);
        }
      }
    });
    this.pageApis.push(formAddress);
  }
  /* istanbul ignore next */
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
      const foundDialCode = this.countryCodeList.find(
        c => c.id === `+${newValue.dial_code}`
      );

      form.patchValue({
        country: selectedValue,
        province: '',
        dialCode: foundDialCode.id,
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
  /* istanbul ignore next */
  fetchTaggedItems(): any[] {
    return (this.supplySelection || []).flatMap((e: any) =>
      e.selected ? e.id : []
    );
  }
  /* istanbul ignore next */
  trackByFn(index: number, item: any): any {
    return item.id;
  }
  /* istanbul ignore next */
  updateSelectAll(value: boolean): void {
    this.supplySelection = this.supplySelection.map(s => ({
      ...s,
      selected: value,
    }));
    this.selectAll = value;
  }
}
