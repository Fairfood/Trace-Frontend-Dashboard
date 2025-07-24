import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { FarmerDetailsComponent } from './farmer-details.component';
import { CommonModule } from '@angular/common';
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { farmerDetails } from '../farmer-profile.component.spec';

describe('FarmerDetailsComponent', () => {
  let component: FarmerDetailsComponent;
  let fixture: ComponentFixture<FarmerDetailsComponent>;
  let storeMock: jasmine.SpyObj<FarmerProfileStoreService>;
  let glboalMock: jasmine.SpyObj<GlobalStoreService>;

  beforeEach(waitForAsync(() => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    storeMock = jasmine.createSpyObj('FarmerProfileStoreService', [
      'updateFarmerDetailAPI',
      'farmerDetails$',
      'updateStateProp',
      'listOperations',
      'transformFormValues',
      'updateFarmConnectionDetails',
    ]);

    storeMock.farmerDetails$ = new BehaviorSubject(farmerDetails);

    glboalMock = jasmine.createSpyObj('GlobalStoreService', [
      'countryList$',
      'countryCodeList$',
    ]);

    glboalMock.countryList$ = new BehaviorSubject([
      {
        name: 'USA',
        code: 'US',
        id: '1',
        sub_division: [],
      },
    ]);

    glboalMock.countryCodeList$ = new BehaviorSubject([
      {
        name: 'USA',
        code: '+1',
        id: '1',
        sub_division: [],
      },
    ]);

    TestBed.configureTestingModule({
      imports: [
        FarmerDetailsComponent,
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatDatepickerModule,
        TranslateModule.forRoot(),
        HttpClientModule,
      ],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: GlobalStoreService, useValue: glboalMock },
        { provide: FarmerProfileStoreService, useValue: storeMock },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerDetailsComponent);
    component = fixture.componentInstance;
    const fb = TestBed.inject(FormBuilder);
    component.detailsForm = fb.group({
      firstName: [''],
      lastName: [''],
      type: [''],
      cStatus: [''],
      city: [''],
      country: [''],
      province: [''],
      street: [''],
      zipCode: [''],
      email: [''],
      phoneNumber: [''],
      dialCode: [''],
      familyMembers: [''],
      dob: [null],
      gender: [''],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getOperations', () => {
    storeMock.listOperations.and.returnValue(
      of({
        results: [],
      })
    );
    component.getOperations();
    expect(storeMock.listOperations).toHaveBeenCalledWith(2);
    expect(component.operations).toEqual([]);
    expect(component.countryDataLoaded).toBeTrue();
  });

  describe('dropdownChanged', () => {
    it('should call necessary methods', () => {
      component.countryList = [
        {
          name: 'USA',
          code: 'US',
          id: '1',
          sub_divisions: [],
        },
      ];
      spyOn(component, 'setStateList');
      spyOn(component, 'formPatchValue');
      component.dropdownChanged({ id: '1', name: 'USA' }, 'country');

      expect(component.setStateList).toHaveBeenCalledWith([], true);
      expect(component.formPatchValue).toHaveBeenCalledWith({
        country: '1',
      });
    });

    it('should call necessary methods id : All', () => {
      spyOn(component, 'formPatchValue');
      component.dropdownChanged({ id: 'All', name: 'USA' }, 'country');

      expect(component.stateList).toEqual([]);
      expect(component.formPatchValue).toHaveBeenCalledWith({
        country: '',
        province: '',
      });
    });

    it('should call necessary methods type any other', () => {
      spyOn(component, 'formPatchValue');
      component.dropdownChanged({ id: 'sasd324', name: 'asd' }, 'province');

      expect(component.formPatchValue).toHaveBeenCalledWith({
        province: 'sasd324',
      });
    });
  });

  it('editBasicDetails', () => {
    spyOn(component, 'setStateList');
    spyOn(component, 'formPatchValue');

    component.editBasicDetails();
    expect(component.isEditing).toBeTrue();
    expect(component.setStateList).toHaveBeenCalled();
    expect(component.formPatchValue).toHaveBeenCalled();
  });

  describe('setStateList', () => {
    it('should setStateList', () => {
      const subDivisions = {
        Berat: { latlong: [40.700952, 19.958004] },
        Bulqizë: { latlong: [41.492203, 20.218376] },
      };

      component.setStateList(subDivisions);

      expect(component.stateList).toEqual([
        { name: 'Berat', id: 'Berat', latlong: [40.700952, 19.958004] },
        { name: 'Bulqizë', id: 'Bulqizë', latlong: [41.492203, 20.218376] },
      ]);
    });

    it('should setStateList and patchvalue', () => {
      const subDivisions = {
        Berat: { latlong: [40.700952, 19.958004] },
        Bulqizë: { latlong: [41.492203, 20.218376] },
      };

      spyOn(component.detailsForm, 'patchValue');
      component.setStateList(subDivisions, true);

      expect(component.stateList).toEqual([
        { name: 'Berat', id: 'Berat', latlong: [40.700952, 19.958004] },
        { name: 'Bulqizë', id: 'Bulqizë', latlong: [41.492203, 20.218376] },
      ]);

      expect(component.detailsForm.patchValue).toHaveBeenCalledWith({
        province: 'Berat',
      });
    });

    it('should toggle dropdown visibility after a timeout', fakeAsync(() => {
      component.setStateList({});

      expect(component.dropdownVisible).toBeFalse();

      tick(1);

      expect(component.dropdownVisible).toBeTrue();
    }));
  });

  describe('buttonAction', () => {
    it('should call resetForm, set isEditing to false, and emit editingStarted event when action is cancel', () => {
      spyOn(component, 'resetForm');
      spyOn(component.editingStarted, 'emit');

      component.buttonAction('cancel');

      expect(component.resetForm).toHaveBeenCalled();
      expect(component.isEditing).toBeFalse();
      expect(component.editingStarted.emit).toHaveBeenCalledWith(false);
    });

    it('should set submitted to true and call updateProfilePic when action is submit', () => {
      spyOn(component, 'updateProfilePic');
      spyOn(component, 'resetForm');

      component.buttonAction('submit');

      expect(component.resetForm).not.toHaveBeenCalled();
      expect(component.submitted).toBeTrue();
      expect(component.updateProfilePic).toHaveBeenCalled();
    });
  });

  describe('openImageUpload', () => {
    it('should set profilePicChanged to true, currentImageData, and farmerPic when type is upload or delete', () => {
      const formData = { data: 'someFormData' };
      const image = 'imageData';

      component.openImageUpload({ type: 'upload', formData, image });

      expect(component.profilePicChanged).toBeTrue();
      expect(component.currentImageData).toBe(formData);
      expect(component.farmerPic).toBe(image);

      component.openImageUpload({ type: 'delete', formData, image });

      expect(component.profilePicChanged).toBeTrue();
      expect(component.currentImageData).toBe(formData);
      expect(component.farmerPic).toBe(image);
    });

    it('should set profilePicChanged to false and currentImageData to null when type is neither upload nor delete', () => {
      component.openImageUpload({ type: 'other', formData: null, image: null });

      expect(component.profilePicChanged).toBeFalse();
      expect(component.currentImageData).toBeNull();
    });
  });
});
