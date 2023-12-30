/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// configs
import {
  BASIC_DETAILS,
  CONTACT_DETAILS,
  GENDERS,
  IFarmerDetails,
  PERSONAL_DETAILS,
} from '../farmer-profile.config';
// services
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { GlobalStoreService } from 'src/app/shared/store';
import { emailRegex } from 'src/app/shared/configs/app.constants';

@Component({
  selector: 'app-farmer-details',
  templateUrl: './farmer-details.component.html',
  styleUrls: ['./farmer-details.component.scss'],
})
export class FarmerDetailsComponent implements OnInit, OnDestroy {
  @Output() editingStarted = new EventEmitter();
  contactDetails = CONTACT_DETAILS;
  basicDetails = BASIC_DETAILS;
  personalDetails = PERSONAL_DETAILS;
  isEditing: boolean;

  countryList: any[];
  stateList: any[];
  countryCodes: any[];
  detailsForm: FormGroup;
  submitted: boolean;
  profileData: any;
  genders: ICommonObj[] = GENDERS;
  countryDataLoaded: boolean;
  maxDate = new Date().toDateString();

  pageApis: Subscription[] = [];
  profilePicChanged: boolean;
  currentImageData: any;
  farmerPic: string;
  operations: any;
  consentStatus = [
    {
      id: 'GRANTED',
      name: 'Granted',
    },
    {
      id: 'REVOKED',
      name: 'Revoked',
    },
    {
      id: 'UNKNOWN',
      name: 'Unknown',
    },
  ];

  constructor(
    private store: FarmerProfileStoreService,
    private globalStore: GlobalStoreService,
    private fb: FormBuilder
  ) {
    this.detailsForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      type: ['', Validators.required],
      cStatus: ['', Validators.required],
      city: [''],
      country: ['', Validators.required],
      province: ['', Validators.required],
      street: [''],
      zipCode: [''],
      email: ['', Validators.pattern(emailRegex)],
      phoneNumber: [
        '',
        [Validators.minLength(2), Validators.pattern('^(?!0+$)[0-9]{1,15}$')],
      ],
      dialCode: [''],
      familyMembers: ['', Validators.maxLength(4)],
      dob: [null],
      gender: [''],
    });
  }

  ngOnInit(): void {
    const api = this.store.farmerDetails$.subscribe(res => {
      this.profileData = res;
      this.farmerPic = res.image;
    });
    this.pageApis.push(api);

    const sub2 = this.globalStore.countryList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryList = res;
          const found = res.find((a: any) => a.id === this.profileData.country);
          this.store.updateFarmerDetails({
            ...this.profileData,
            countryFlag: found.flag_url,
          });
          this.getOperations();
        }
      },
    });
    this.pageApis.push(sub2);

    const sub3 = this.globalStore.countryCodeList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryCodes = res;
        }
      },
    });
    this.pageApis.push(sub3);
  }

  getOperations(): void {
    const api = this.store.listOperations(2).subscribe((res: any) => {
      this.operations = res.results;
      this.countryDataLoaded = true;
    });
    this.pageApis.push(api);
  }

  get formControlsFarmer(): any {
    return this.detailsForm.controls;
  }

  formPatchValue(values: any): void {
    this.detailsForm.patchValue({
      ...values,
    });
    this.detailsForm.updateValueAndValidity();
  }

  dropdownChanged(data: any, type: string): void {
    const selectedValue = data.id === 'All' ? '' : data.id;

    if (type === 'country') {
      if (selectedValue) {
        const index = this.countryList.findIndex(m => m.id === selectedValue);
        const selectedSub = this.countryList[index].sub_divisions;
        this.setStateList(selectedSub, true);

        this.formPatchValue({ country: selectedValue });
      } else {
        this.stateList = [];
        this.formPatchValue({ country: '', province: '' });
      }
    } else {
      this.formPatchValue({ [type]: selectedValue });
    }
  }

  editBasicDetails(): void {
    this.isEditing = true;
    this.editingStarted.emit(true);
    const { country, zipcode, primary_operation, consent_status } =
      this.profileData;
    const index = this.countryList.findIndex(m => m.name === country);
    const selectedSub = this.countryList[index].sub_divisions;
    this.setStateList(selectedSub);
    this.formPatchValue({
      ...this.profileData,
      zipCode: zipcode,
      cStatus: consent_status,
      type: primary_operation?.id || '',
    });
  }

  setStateList(selectedSub: any, selectFirst?: boolean): void {
    this.stateList = Object.keys(selectedSub).map(key => {
      selectedSub[key].name = key;
      selectedSub[key].id = key;
      return selectedSub[key];
    });
    if (selectFirst) {
      this.detailsForm.patchValue({
        province: this.stateList[0].id,
      });
    }
  }

  resetForm(): void {
    this.detailsForm.reset();
    this.isEditing = false;
  }

  buttonAction(action: 'cancel' | 'submit'): void {
    if (action === 'cancel') {
      this.resetForm();
      this.isEditing = false;
      this.editingStarted.emit(false);
    } else {
      this.submitted = true;
      this.updateProfilePic();
    }
  }

  updateProfilePic(): void {
    if (this.profilePicChanged) {
      const api = this.store
        .updateFarmerDetailAPI(this.profileData.id, this.currentImageData)
        .subscribe({
          next: () => {
            this.updateProfile();
          },
          error: err => {
            console.log(err);
            this.updateProfile();
          },
        });
      this.pageApis.push(api);
    } else {
      this.updateProfile();
    }
  }

  updateProfile(): void {
    if (this.detailsForm.valid) {
      this.store.updatingData(true);
      const reqObj = this.store.transformFormValues(this.detailsForm.value);
      this.store.updateFarmConnectionDetails(this.profileData.id, reqObj);
      this.editingStarted.emit(false);
    }
  }

  openImageUpload(data: { type: string; formData: any; image?: string }): void {
    const { type, formData, image } = data;

    if (type === 'upload' || type === 'delete') {
      this.profilePicChanged = true;
      this.currentImageData = formData;
      this.farmerPic = image;
    } else {
      this.profilePicChanged = false;
      this.currentImageData = null;
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
