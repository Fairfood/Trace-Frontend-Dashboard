/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component } from '@angular/core';
import { Subscription, tap } from 'rxjs';
// services
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { UserProfileService } from './user-profile.service';
// configs
import { ICommonObj, IUserData } from 'src/app/shared/configs/app.model';
import { IMPORT_CONFIGS, PROFILE_TABS } from './user-profile.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: IMPORT_CONFIGS,
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  // Loading indicator for the component
  loading = false;

  // User data fetched from the API
  userData: Partial<IUserData>;

  // Array to store subscriptions for cleanup
  pageApis: Subscription[] = [];

  // Flag to determine if the user is in edit mode
  isEdit: boolean;

  // Tabs for the user profile
  tabGroup = PROFILE_TABS;

  // Active tab ID
  activeTabId = PROFILE_TABS[0].id;

  // Form for user details
  detailsForm = this.service.profileForm();

  // Flag indicating whether the form has been submitted
  submitted: boolean;

  // List of country codes
  countryCodeList: any[];

  // User profile picture
  userPic: any;

  // Current user image data
  currentImageData: any;

  // Flag indicating whether the user image has been updated
  imageUpdated: boolean;

  constructor(
    private global: GlobalStoreService,
    private util: UtilService,
    private service: UserProfileService
  ) {
    this.loading = true;
    this.fetchUserProfile();
    this.countryCode();
  }

  // Fetch country codes from the global store
  countryCode(): void {
    const sub3 = this.global.countryCodeList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryCodeList = res;
        }
      },
    });
    this.pageApis.push(sub3);
  }

  // Fetch user profile data from the global store
  fetchUserProfile(): void {
    const api = this.global.userData$.subscribe((data: IUserData) => {
      if (data) {
        // if data is available
        const { image } = data;
        this.userData = data;
        this.userPic = image;
        this.loading = false;
      } else {
        this.getUser();
      }
    });
    this.pageApis.push(api);
  }

  // Method to get user details from DataService
  getUser(): void {
    const data = JSON.parse(localStorage.getItem('userData'));
    const api = this.util.getUserDetails(data.id).subscribe((res: any) => {
      this.global.updateUserData(res);
    });
    this.pageApis.push(api);
  }

  // Open the image upload dialog
  openImageUpload(data: { type: string; formData: any; image?: string }): void {
    const { type, formData, image } = data;

    if (type === 'upload' || type === 'delete') {
      this.imageUpdated = true;
      this.currentImageData = formData;
      this.userPic = image;
    } else {
      this.imageUpdated = true;
      this.currentImageData = null;
    }
  }

  // Toggle the edit mode for user details
  toggleEdit(): void {
    this.isEdit = !this.isEdit;

    if (this.isEdit) {
      this.patchFormData();
    }
  }

  // Patch the form data with user details
  patchFormData(): void {
    const { first_name, last_name, email, phone } = this.userData;
    this.detailsForm.patchValue({
      firstName: first_name,
      lastName: last_name,
      email,
      mobile: phone.phone,
      dialCode: phone.dial_code,
    });
  }

  // getter to call form group controls
  get fcontrol() {
    return this.detailsForm.controls;
  }

  // Change the active tab
  changeTab(item: ICommonObj): void {
    this.activeTabId = item.id;
  }

  // Handle dropdown change event
  dropdownChanged(data: any): void {
    this.detailsForm.patchValue({
      dialCode: data.id === 'All' ? '' : data.id,
    });
  }

  // Update user image and trigger save user data API call
  updateUserImage(): void {
    this.util
      .updateUser(this.currentImageData)
      .pipe(
        tap({
          next: () => {
            this.saveUserDataApi(this.consturctReqObject());
          },
        })
      )
      .subscribe();
  }

  // Construct request object for saving user data
  consturctReqObject(): any {
    const { mobile, dialCode, firstName, lastName, email } =
      this.detailsForm.value;

    const data: any = {
      first_name: firstName,
      last_name: lastName,
      phone: {
        phone: mobile,
        dial_code: '+' + dialCode,
      },
    };

    if (this.userData.email !== email) {
      data.email = email;
    }
    return data;
  }

  // Save user data
  saveUserData(): void {
    this.submitted = true;
    this.loading = true;
    if (this.detailsForm.valid) {
      if (this.imageUpdated) {
        this.updateUserImage();
      } else {
        this.saveUserDataApi(this.consturctReqObject());
      }
    }
  }

  // Save user data via API call
  saveUserDataApi(data: any): void {
    const api = this.util.updateUser(data).subscribe({
      next: (res: any) => {
        // if update is success
        this.userData = res;
        this.global.updateUserData(this.userData);
        const message = 'Profile updated successfully';
        this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
        this.toggleEdit();
        this.loading = false;
        this.submitted = false;
      },
      error: () => {
        const message = 'Profile updation Failed';
        this.util.customSnackBar(message, ACTION_TYPE.FAILED);
        this.loading = false;
        this.submitted = false;
        this.toggleEdit();
      },
    });
    this.pageApis.push(api);
  }

  // Cleanup subscriptions on component destruction
  ngOnDestroy(): void {
    this.pageApis.forEach(sub => sub.unsubscribe());
  }
}
