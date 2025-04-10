import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ActivitiesComponent } from './activities.component';
import { CompanyProfileService } from '../company-profile.service';
import { LoaderComponent, FfPaginationComponent } from 'fairfood-utils';

describe('ActivitiesComponent', () => {
  let component: ActivitiesComponent;
  let fixture: ComponentFixture<ActivitiesComponent>;
  let companyProfileServiceSpy: jasmine.SpyObj<CompanyProfileService>;

  beforeEach(() => {
    companyProfileServiceSpy = jasmine.createSpyObj('CompanyProfileService', [
      'activityLog',
    ]);
    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        CommonModule,
        LoaderComponent,
        FfPaginationComponent,
        TranslateModule,
        ActivitiesComponent,
      ],
      providers: [
        { provide: CompanyProfileService, useValue: companyProfileServiceSpy },
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesComponent);
    component = fixture.componentInstance;
    component.companyId = 'testCompanyId';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load activities on ngOnInit', () => {
    const mockResponse = { results: ['activity1', 'activity2'], count: 2 };
    companyProfileServiceSpy.activityLog.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(component.activities.results).toEqual(mockResponse.results);
    expect(component.activities.count).toEqual(mockResponse.count);
    expect(component.activities.loading).toBeFalse();
  });

  it('should load activities on paginatorEvent', () => {
    const paginatorData = { limit: 10, offset: 10 };
    const mockResponse = { results: ['activity3', 'activity4'], count: 2 };
    companyProfileServiceSpy.activityLog.and.returnValue(of(mockResponse));

    component.paginatorEvent(paginatorData);

    expect(component.appliedFilter.limit).toEqual(paginatorData.limit);
    expect(component.appliedFilter.offset).toEqual(paginatorData.offset);
    expect(companyProfileServiceSpy.activityLog).toHaveBeenCalledWith(
      paginatorData.limit,
      paginatorData.offset,
      component.companyId
    );
    expect(component.activities.results).toEqual(mockResponse.results);
    expect(component.activities.count).toEqual(mockResponse.count);
    expect(component.activities.loading).toBeFalse();
  });
});
