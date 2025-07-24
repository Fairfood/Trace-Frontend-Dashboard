import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FarmerProfileComponent } from './farmer-profile.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { IFarmerDetails } from './farmer-profile.config';
import { FarmerProfileStoreService } from './farmer-profile-store.service';

export const farmerDetails: IFarmerDetails = {
  id: 'some_id',
  name: 'John Doe',
  email: '',
  firstName: 'John',
  lastName: 'Doe',
  city: 'New York',
  country: 'USA',
  province: 'New York',
  street: 'Some Street',
  zipcode: '12345',
  gender: null,
  dob: '',
  familyMembers: '',
  phone: null,
  image: '',
  income: {
    product: '',
    premium: '',
    others: '',
    total: '',
  },
  primary_operation: {
    id: '',
    name: '',
  },
  is_editable: false,
  otherApiCall: true,
  phoneNumber: '',
  dialCode: '',
};

class MockStoreStub {
  farmerDetails$ = new BehaviorSubject(farmerDetails);
  updatingDetails$ = new BehaviorSubject(false);
  farmerReference$ = new BehaviorSubject({
    count: 0,
    results: [],
    loading: false,
  });

  updateStateProp = jasmine.createSpy('updateStateProp');

  getFarmerDetails(params: any): void {
    console.log('getFarmerDetails', params);
  }

  fetchReferences(search: any): void {
    console.log('fetchReferences', search);
  }
  fetchFarmerReferences(id: string, search: any): void {
    console.log('fetchReferences', search);
  }

  fetchFarmerPlots(id: string): void {
    console.log('fetchFarmerPlots', id);
  }

  farmerActivities(farmerId: string, limit = 10, offset = 0): void {
    console.log('farmerActivities', farmerId, limit, offset);
  }

  getFarmerPayments(
    farmerId: string,
    search = '',
    offset = 0,
    limit = 10
  ): void {
    console.log('getFarmerPayments', farmerId, search, offset, limit);
  }

  fetchFarmerAttachments(farmerId: string, offset = 0, limit = 10): void {
    console.log('fetchFarmerAttachments', farmerId, offset, limit);
  }
}

describe('FarmerProfileComponent', () => {
  let component: FarmerProfileComponent;
  let fixture: ComponentFixture<FarmerProfileComponent>;
  beforeEach(async () => {
    const dialogMock = {
      open: jasmine
        .createSpy('open')
        .and.returnValue({ afterClosed: () => of(true) }),
    };
    await TestBed.configureTestingModule({
      imports: [FarmerProfileComponent, HttpClientModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                id: 'some_id',
              },
            },
          },
        },
        { provide: MatDialog, useValue: dialogMock },
        {
          provide: FarmerProfileStoreService,
          useClass: MockStoreStub,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call farmerDetails$ and set profileData and loading correctly', () => {
    spyOn(component, 'editingDataInit');
    spyOn(component, 'farmerReferencesInit');
    component.ngOnInit();

    // Expectations
    expect(component.loading).toBe(false); // Assuming testData is not null
    expect(component.profileData).toEqual(farmerDetails);
    expect(component.editingDataInit).toHaveBeenCalled();
    expect(component.farmerReferencesInit).toHaveBeenCalled();
  });

  it('should initialize with default values', () => {
    expect(component.tabItems.length).toBeGreaterThan(0);
    expect(component.activeTabId).toBe(component.tabItems[0].id);
    expect(component.loading).toBeTrue();
  });

  it('should change active tab', () => {
    const newTab = { id: 'new_tab', name: 'New Tab' };
    component.changeTab(newTab);
    expect(component.activeTabId).toBe(newTab.id);
  });

  it('should handle reference item click', () => {
    const index = 1;
    const referenceList = [{}, {}, {}];
    component.references = { results: referenceList, count: 3, loading: false };
    component.referenceItemClicked({
      index,
      item: {
        title: 'string',
        description: 'string',
      },
    });
    expect(component.activeFarmerRef).toBe(index);
  });

  it('should handle ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'farmerDetails',
      null
    );
  });

  it('should update editingDetails property', () => {
    const testData = true;
    component.detailsEditing(testData);
    expect(component.editingDetails).toEqual(testData);

    const testData2 = false;
    component.detailsEditing(testData2);
    expect(component.editingDetails).toEqual(testData2);
  });
});
