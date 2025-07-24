import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';
import { GlobalStoreService } from 'src/app/shared/store';
import { UtilService } from 'src/app/shared/service';
import { UserProfileService } from './user-profile.service';
import { BehaviorSubject, of } from 'rxjs';
import { ICommonObj, IUserData } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  NotificationHomeComponent,
  NotificationService,
} from '../notification';
import {
  ActivatedRoute,
  RouterModule,
  convertToParamMap,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
const userData: IUserData = {
  id: '1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: { dial_code: '+1', phone: '1234567890' },
  image: 'avatar.jpg',
  nodes: [],
  address: '',
  dob: '',
  default_node: '',
  email_verified: false,
  privacy_accepted: false,
  terms_accepted: false,
};
describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let utilService: UtilService;
  let globalStoreService: GlobalStoreService;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        UserProfileComponent,
        CommonModule,
        HttpClientModule,
        NotificationHomeComponent,
        RouterModule,
      ],
      providers: [
        { provide: GlobalStoreService, useClass: MockGlobalStoreServiceStub },
        { provide: UtilService, useClass: MockUtilServiceStub },
        { provide: UserProfileService, useClass: MockUserProfileServiceStub },
        NotificationService,
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}), // Mock paramMap
            },
          },
        },
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    utilService = TestBed.inject(UtilService);
    globalStoreService = TestBed.inject(GlobalStoreService);
    formBuilder = TestBed.inject(FormBuilder);
    component.detailsForm = formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      mobile: [''],
      dialCode: [''],
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve user data and update globally', () => {
    const userData: IUserData = {
      id: '1',
      nodes: [],
      address: '',
      dob: '',
      email: '',
      first_name: '',
      last_name: '',
      image: '',
      default_node: '',
      email_verified: false,
      privacy_accepted: false,
      terms_accepted: false,
    };
    const userDetails = {};
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(userData));
    spyOn(utilService, 'getUserDetails').and.returnValue(of(userDetails));
    spyOn(globalStoreService, 'updateUserData');
    component.getUser();
    expect(localStorage.getItem).toHaveBeenCalledWith('userData');
    expect(utilService.getUserDetails).toHaveBeenCalledWith(userData.id);
    expect(globalStoreService.updateUserData).toHaveBeenCalledWith(userDetails);
  });

  it('should set imageUpdated, currentImageData, and userPic when type is upload or delete', () => {
    const formData = {};
    const image = 'image.jpg';
    component.openImageUpload({ type: 'upload', formData, image });
    expect(component.imageUpdated).toBeTrue();
    expect(component.currentImageData).toEqual(formData);
    expect(component.userPic).toEqual(image);
  });

  it('should set imageUpdated and currentImageData to null when type is not upload or delete', () => {
    const formData = {};
    component.openImageUpload({ type: 'other', formData });
    expect(component.imageUpdated).toBeTrue();
    expect(component.currentImageData).toBeNull();
  });

  it('should toggle edit mode and call patchFormData()', () => {
    spyOn(component, 'patchFormData');
    component.isEdit = false;
    component.toggleEdit();
    expect(component.isEdit).toBeTrue();
    expect(component.patchFormData).toHaveBeenCalled();
  });

  it('should patch form data correctly', () => {
    component.userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: {
        dial_code: '+1',
        phone: '1234567890',
      },
    };
    component.patchFormData();
    expect(component.detailsForm.value).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '1234567890',
      dialCode: '+1',
    });
  });

  it('should return form controls correctly', () => {
    const formBuilder = TestBed.inject(FormBuilder);
    component.detailsForm = formBuilder.group({
      firstName: ['John'],
      lastName: ['Doe'],
      email: ['john.doe@example.com'],
      mobile: ['1234567890'],
      dialCode: ['+1'],
    });
    const formControls = component.fcontrol;
    expect(formControls.firstName.value).toEqual('John');
    expect(formControls.lastName.value).toEqual('Doe');
    expect(formControls.email.value).toEqual('john.doe@example.com');
    expect(formControls.mobile.value).toEqual('1234567890');
    expect(formControls.dialCode.value).toEqual('+1');
  });

  it('should change the active tab', () => {
    const sampleTab: ICommonObj = { id: 'sampleTabId', name: 'Sample Tab' };
    component.changeTab(sampleTab);
    expect(component.activeTabId).toEqual('sampleTabId');
  });

  it('should patch the form data correctly when "All" is selected', () => {
    const sampleData = { id: 'All' };
    component.dropdownChanged(sampleData);
    expect(component.detailsForm.value.dialCode).toEqual('');
  });

  it('should patch the form data correctly when a specific dial code is selected', () => {
    const sampleData = { id: '123' };
    component.dropdownChanged(sampleData);
    expect(component.detailsForm.value.dialCode).toEqual('123');
  });

  it('should update user image and call saveUserDataApi', () => {
    const imageData = {};
    const userData = {};
    const updatedUserData = {};
    spyOn(utilService, 'updateUser').and.returnValue(of(updatedUserData));
    spyOn(globalStoreService, 'updateUserData');
    spyOn(utilService, 'customSnackBar');
    spyOn(component, 'toggleEdit');
    component.imageUpdated = true;
    component.currentImageData = imageData;
    component.userData = userData;
    component.updateUserImage();
    expect(utilService.updateUser).toHaveBeenCalledWith(imageData);
    expect(utilService.customSnackBar).toHaveBeenCalledWith(
      'Profile updated successfully',
      ACTION_TYPE.SUCCESS
    );
    expect(globalStoreService.updateUserData).toHaveBeenCalledWith(
      updatedUserData
    );
    expect(component.toggleEdit).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.submitted).toBeFalse();
  });

  it('should fetch user profile data from the global store', () => {
    spyOn(component, 'getUser');
    component.fetchUserProfile();
    expect(component.userData).toEqual(userData);
    expect(component.userPic).toEqual('avatar.jpg');
    expect(component.loading).toBeFalse();
    expect(component.getUser).not.toHaveBeenCalled();
  });
});

class MockGlobalStoreServiceStub {
  countryCodeList$ = new BehaviorSubject<any>([{ id: '1', name: 'Country 1' }]);
  userData$ = new BehaviorSubject<IUserData>(userData);
  updateUserData() {
    console.log('hi');
  }
}

class MockUtilServiceStub {
  getUserDetails() {
    return of();
  }
  updateUser() {
    return of();
  }
  customSnackBar() {
    console.log('hi');
  }
}

class MockUserProfileServiceStub {
  profileForm() {
    console.log('hi');
  }
}
