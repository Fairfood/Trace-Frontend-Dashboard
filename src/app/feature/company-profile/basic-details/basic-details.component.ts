/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
// services
import { CompanyProfileStoreService } from '../company-profile-store.service';
import { UtilService } from 'src/app/shared/service';
import { CompanyProfileService } from '../company-profile.service';
// configs, constants
import {
  BASIC_DETAILS,
  connectionProfileDropdownValue,
} from '../company-profile.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// components
import { ButtonsComponent } from 'fairfood-utils';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';
import { GlobalStoreService } from 'src/app/shared/store';
@Component({
  selector: 'app-basic-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonsComponent,
    MatIconModule,
    FairFoodInputComponent,
    FfDropdownComponent,
  ],
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss'],
})
export class BasicDetailsComponent implements OnDestroy {
  @Input() isConnection: boolean;
  @Output() editingStarted = new EventEmitter();

  isEdit: boolean;
  detailsForm = this.companyService.basicDetailsForm();

  errorMessage = 'This field is required *';

  tabOne = BASIC_DETAILS;
  companyProfileData: any;
  pageApis: Subscription[] = [];
  submitted: boolean;
  asAdmin: any;
  savingProfile: boolean;
  countryList: any[];
  countryCodeList: any;
  stateList: any[];

  constructor(
    private store: CompanyProfileStoreService,
    private global: GlobalStoreService,
    private util: UtilService,
    private companyService: CompanyProfileService
  ) {
    this.initSub();
  }

  initSub(): void {
    const profileDataSub = this.store.profileData$.subscribe({
      next: (res: any) => {
        if (res) {
          this.companyProfileData = res;
          this.asAdmin = this.companyProfileData.is_admin;
        }
      },
    });

    this.pageApis.push(profileDataSub);

    const sub2 = this.global.countryList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryList = res;
          const index = res.findIndex(
            (cou: any) => cou.id === this.companyProfileData.country
          );
          const selectedSub = this.countryList[index].sub_divisions;
          this.setStateList(selectedSub);
        }
      },
    });
    this.pageApis.push(sub2);

    const sub3 = this.global.countryCodeList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryCodeList = res;
        }
      },
    });
    this.pageApis.push(sub3);
  }

  toggleEdit(): void {
    this.isEdit = !this.isEdit;

    if (this.isEdit) {
      this.patchFormData();
    }
    this.editingStarted.emit(this.isEdit);
  }

  patchFormData(): void {
    const {
      name,
      description_basic,
      street,
      city,
      country,
      province,
      identification_no,
      zipcode: zipCode,
      incharge,
      latitude,
      longitude,
      phone,
    } = this.companyProfileData;
    this.detailsForm.patchValue({
      name,
      description: description_basic,
      street,
      country,
      province,
      regNo: identification_no,
      zipCode,
      city,
      latitude,
      longitude,
      inName: incharge.first_name,
      inEmail: incharge.email,
      inMobile: phone.phone,
      inDialCode: phone.dial_code,
    });
  }

  updateProfilePic(): void {
    this.savingProfile = true;
    if (this.companyService.companyImageUpdated) {
      const api = this.companyService
        .updateCompanyDetails(
          this.companyProfileData.id,
          this.companyService.currentImageData
        )
        .subscribe({
          next: () => {
            this.saveProfileData();
          },
          error: err => {
            console.log(err);
            this.saveProfileData();
          },
        });
      this.pageApis.push(api);
    } else {
      this.saveProfileData();
    }
  }

  saveProfileData(): void {
    this.submitted = true;
    if (this.detailsForm.valid) {
      const reqOptions = this.companyService.generateRequestOptions(
        this.detailsForm.value
      );
      reqOptions.disclosure_level = this.companyProfileData?.disclosure_level;

      const api = this.companyService
        .updateCompanyDetails(this.companyProfileData.id, reqOptions)
        .subscribe({
          next: result => {
            if (result.success) {
              this.util.customSnackBar(
                'Company profile updated successfully',
                ACTION_TYPE.SUCCESS
              );
              this.companyProfileData = result?.data;
              this.toggleEdit();
              this.savingProfile = false;
            }
          },
          error: err => {
            const {
              error: { detail },
            } = err;
            this.util.customSnackBar(detail.detail, ACTION_TYPE.FAILED);
            this.toggleEdit();
            this.savingProfile = false;
          },
        });
      this.pageApis.push(api);
    } else {
      this.util.customSnackBar(
        'There are some error in the form',
        ACTION_TYPE.FAILED
      );
      this.savingProfile = false;
    }
  }

  setStateList(selectedSub: any, firstSelected?: boolean): void {
    this.stateList = Object.keys(selectedSub).map((key: any) => {
      selectedSub[key].name = key;
      selectedSub[key].id = key;
      return selectedSub[key];
    });
    if (firstSelected) {
      this.detailsForm.patchValue({
        province: this.stateList[0].id,
      });
    }
  }

  get formControlsCompany(): any {
    return this.detailsForm.controls;
  }

  dropdownChanged(data: any, type: string): void {
    const selectedValue = data.id === 'All' ? '' : data.id;
    // when clear filter is clicked dropdown component emits the value:- { id: 'All' }
    // it provide the option to clear the dropdown value
    connectionProfileDropdownValue(selectedValue, type, this.detailsForm, data);
    if (type === 'country') {
      if (selectedValue) {
        const found = this.countryList.find((a: any) => a.id === selectedValue);
        const countryCode = this.countryCodeList.find((a: any) =>
          a.name.includes(selectedValue)
        );
        const selectedSub = found.sub_divisions;
        this.setStateList(selectedSub, true);
        this.detailsForm.patchValue({
          inDialCode: countryCode?.id || '',
        });
      } else {
        this.stateList = [];
      }
    }
    this.detailsForm.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach((m: any) => m?.unsubscribe());
  }
}
