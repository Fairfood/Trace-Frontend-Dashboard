import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AddReferenceComponent } from './add-reference.component';
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { UtilService } from 'src/app/shared/service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { Subject, of } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';

describe('AddReferenceComponent', () => {
  let component: AddReferenceComponent;
  let fixture: ComponentFixture<AddReferenceComponent>;
  let farmerProfileStoreServiceStub: jasmine.SpyObj<FarmerProfileStoreService>;

  beforeEach(async () => {
    farmerProfileStoreServiceStub = jasmine.createSpyObj(
      'FarmerProfileStoreService',
      ['masterReferences$', 'createFarmerReference', 'updateFarmerReference']
    );

    farmerProfileStoreServiceStub.masterReferences$ = new Subject();
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      // use: () => {},
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      imports: [AddReferenceComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: FarmerProfileStoreService,
          useValue: farmerProfileStoreServiceStub,
        },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            farmerId: '1',
            number: '456',
            reference_details: { id: '1' },
            id: '124',
          },
        },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with provided data', () => {
    component.ngOnInit();
    expect(component.refForm.get('reference').value).toBe('1');
    expect(component.refForm.get('idNumber').value).toBe('456');
    expect(component.refForm.get('farmer').value).toBe('1');
    expect(component.refForm.get('refId').value).toBe('124');
  });

  it('should initialise', () => {
    component.refArray = [];
    component.ngOnInit();
    expect(component.buttonText).toBe('Done');
    expect(component.refForm).toBeDefined();
    expect(component.refArray).toEqual([]);
  });

  it('should update reference form value on dropdown change', () => {
    // Arrange
    const data = { id: 'someId' };
    component.refForm = new FormBuilder().group({
      reference: '',
    });

    // Act
    component.dropdownChanged(data);

    // Assert
    expect(component.refForm.value.reference).toBe('someId');
  });

  it('should create reference successfully when form is valid and is not in edit mode', fakeAsync(() => {
    // Arrange
    component.refForm = new FormBuilder().group({
      reference: ['ref123'],
      idNumber: ['123'],
      farmer: ['farmer123'],
      refId: [''],
    });
    component.data.isEdit = false;
    farmerProfileStoreServiceStub.createFarmerReference.and.returnValue(
      of(true)
    );

    // Act
    component.createReference();
    tick();

    // Assert
    expect(
      farmerProfileStoreServiceStub.createFarmerReference
    ).toHaveBeenCalledWith(
      { number: '123', reference: 'ref123', farmer: 'farmer123' },
      '1'
    );
  }));

  it('should update reference successfully when form is valid and is in edit mode', fakeAsync(() => {
    // Arrange
    component.refForm = new FormBuilder().group({
      reference: ['ref456'],
      idNumber: ['456'],
      farmer: ['farmer456'],
      refId: ['refId123'],
    });
    component.data.isEdit = true;
    farmerProfileStoreServiceStub.updateFarmerReference.and.returnValue(
      of(true)
    );

    // Act
    component.createReference();
    tick();

    // Assert
    expect(
      farmerProfileStoreServiceStub.updateFarmerReference
    ).toHaveBeenCalledWith({ number: '456' }, 'refId123');
  }));

  it('should not call API and close dialog when form is invalid', fakeAsync(() => {
    // Arrange
    component.refForm = new FormBuilder().group({
      reference: ['', Validators.required],
      idNumber: [''],
      farmer: [''],
      refId: [''],
    });
    farmerProfileStoreServiceStub.createFarmerReference.and.returnValue(
      of(true)
    );

    // Act
    component.createReference();
    tick();

    // Assert
    expect(
      farmerProfileStoreServiceStub.createFarmerReference
    ).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));
});

class UtilServiceStub {
  customSnackBar(): void {
    console.log('hi');
  }
}

class MatDialogRefStub {
  close(): void {
    console.log('hi');
  }
}
