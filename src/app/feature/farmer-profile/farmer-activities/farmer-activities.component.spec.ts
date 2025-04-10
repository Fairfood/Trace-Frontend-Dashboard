import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FarmerActivitiesComponent } from './farmer-activities.component';
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { of } from 'rxjs';

describe('FarmerActivitiesComponent', () => {
  let component: FarmerActivitiesComponent;
  let fixture: ComponentFixture<FarmerActivitiesComponent>;
  let farmerProfileStoreServiceStub: Partial<FarmerProfileStoreService>;

  beforeEach(async () => {
    farmerProfileStoreServiceStub = {
      activities$: of({ count: 0, results: [], loading: true }),
    };

    await TestBed.configureTestingModule({
      imports: [
        FarmerActivitiesComponent,
        CommonModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: FarmerProfileStoreService,
          useValue: farmerProfileStoreServiceStub,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmerActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
