import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MapSuppliersRequestComponent } from './map-suppliers-request.component';
import { UtilService } from 'src/app/shared/service';
import { ConnectionService } from '../connections.service';
import { FormBuilder } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

describe('MapSuppliersRequestComponent', () => {
  let component: MapSuppliersRequestComponent;
  let fixture: ComponentFixture<MapSuppliersRequestComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<MapSuppliersRequestComponent>>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let connectionServiceSpy: jasmine.SpyObj<ConnectionService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    utilServiceSpy = jasmine.createSpyObj('UtilService', ['customSnackBar']);
    connectionServiceSpy = jasmine.createSpyObj('ConnectionService', [
      'createConnectonRequest',
      'resendFarmerInvite',
    ]);
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      imports: [MapSuppliersRequestComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: ConnectionService, useValue: connectionServiceSpy },
        { provide: TranslateService, useValue: translateServiceMock },
        FormBuilder,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSuppliersRequestComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);
    component.detailsForm = formBuilder.group({
      note: [''],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  // Add more test cases for other methods
});
