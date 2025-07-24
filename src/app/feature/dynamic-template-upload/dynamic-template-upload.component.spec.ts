import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DynamicTemplateUploadComponent } from './dynamic-template-upload.component';
import { DynamicTemplateStore } from './dynamic-template-upload-store.service';
import { UtilService } from 'src/app/shared/service';
import { RouterService } from 'src/app/shared/service/router.service';
import { TranslateService } from '@ngx-translate/core';

describe('DynamicTemplateUploadComponent', () => {
  let component: DynamicTemplateUploadComponent;
  let fixture: ComponentFixture<DynamicTemplateUploadComponent>;
  let mockStore: jasmine.SpyObj<DynamicTemplateStore>;

  beforeEach(waitForAsync(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const storeSpy = jasmine.createSpyObj('DynamicTemplateStore', [
      'updateStateProp',
      'removeNewUplod',
      'getCurrentStep',
      'goToLinkFields',
      'resetState',
    ]);
    const utilServiceSpy = jasmine.createSpyObj('UtilService', [
      'customSnackBar',
    ]);
    const routerServiceSpy = jasmine.createSpyObj('RouterService', [
      'navigateUrl',
    ]);

    const translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      imports: [DynamicTemplateUploadComponent],
      providers: [
        { provide: MatDialog, useValue: dialogSpy },
        { provide: DynamicTemplateStore, useValue: storeSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: RouterService, useValue: routerServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: 'transactions' } } },
        },
        {
          provide: TranslateService,
          useValue: translateSpy,
        },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(
      DynamicTemplateStore
    ) as jasmine.SpyObj<DynamicTemplateStore>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTemplateUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize correctly when ID is "transactions"', () => {
    expect(component.canLoad).toBeTrue();
    expect(component.type).toEqual(1);
    expect(mockStore.updateStateProp).toHaveBeenCalledWith('templateType', 1);
  });

  it('should handle changeTab correctly', () => {
    spyOn(component, 'errorMessage');
    mockStore.getCurrentStep.and.returnValue('verification');

    component.changeTab({
      id: 'linkFields',
      name: 'Link Fields',
      active: true,
    });
    expect(component.errorMessage).not.toHaveBeenCalled();
    expect(mockStore.goToLinkFields).toHaveBeenCalled();

    component.changeTab({ id: 'upload', name: 'Link Fields', active: true });
    expect(component.errorMessage).toHaveBeenCalled();

    mockStore.getCurrentStep.and.returnValue('summary');
    component.changeTab({
      id: 'other',
      name: 'Any other',
      active: true,
    });
    expect(mockStore.updateStateProp).toHaveBeenCalledWith(
      'currentStep',
      'other'
    );
  });

  it('should call resetState on ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(mockStore.resetState).toHaveBeenCalled();
  });
});
