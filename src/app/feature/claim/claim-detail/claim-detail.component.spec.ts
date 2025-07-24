import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ClaimService } from '../claim.service';
import { ClaimDetailComponent } from './claim-detail.component';
import { of } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

describe('ClaimDetailComponent', () => {
  let component: ClaimDetailComponent;
  let fixture: ComponentFixture<ClaimDetailComponent>;
  let mockDialogRef: Partial<MatDialogRef<ClaimDetailComponent>>;
  let mockDialog: Partial<MatDialog>;
  let mockClaimService: Partial<ClaimService>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jasmine.createSpy('close'),
    };
    mockDialog = {
      open: jasmine.createSpy('open'),
    };
    mockClaimService = {
      getVerifiers: jasmine.createSpy('getVerifiers').and.returnValue(of([])),
    };

    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      imports: [ClaimDetailComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ClaimService, useValue: mockClaimService },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.initForm();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    spyOn(component, 'initForm').and.callThrough();
    component.ngOnInit();
    expect(component.initForm).toHaveBeenCalled();
  });

  it('should initialize form correctly', () => {
    component.data = {
      verified_by: 2,
      isEdit: true,
      verifier: { name: 'Test Verifier' },
    };
    component.initForm();
    expect(component.evidenceForm.get('verifier').value).toBe('Test Verifier');
  });

  it('should initialize verifier autocomplete', fakeAsync(() => {
    component.data = {
      verified_by: 2,
      isEdit: true,
      verifier: { name: 'Test Verifier' },
    };
    component.initForm();
    spyOn(component, 'initVerifierAutoComplete').and.callThrough();
    component.ngOnInit();
    tick(600); // Wait for debounceTime
    expect(component.initVerifierAutoComplete).toHaveBeenCalled();
  }));

  it('should close dialog and reset data if not in edit mode', () => {
    spyOn(component, 'dataResetIfAny').and.callThrough();
    component.data = { isEdit: false };
    component.close();
    expect(component.dataResetIfAny).toHaveBeenCalled();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });

  it('should reset data if not in edit mode', () => {
    component.data = {
      criteria: [
        { fields: [{ id: 'field1', value: 'value1', file: true }] },
        { fields: [{ id: 'field2', value: 'value2', file: true }] },
      ],
      verifierAssigned: true,
      verifier: { name: 'Test Verifier' },
    };
    component.dataResetIfAny();
    expect(component.data.criteria[0].fields[0].value).toBeNull();
    expect(component.data.criteria[0].fields[0].file).toBeFalsy();
    expect(component.data.verifierAssigned).toBeFalsy();
    expect(component.data.verifier).toBeNull();
  });

  it('should handle removing claims file', () => {
    const mockField = {
      id: 'field1',
      file: true,
      value: { field: 'field1', file: true },
    };
    component.removeClaimFile(mockField);
    expect(mockField.file).toBeFalsy();
    expect(mockField.value).toBeUndefined();
    expect(
      component.evidenceForm.controls[mockField.id]?.value
    ).toBeUndefined();
  });

  it('should validate claims form and close dialog', () => {
    component.evidenceForm = new FormGroup({
      verifier: new FormControl('Test', Validators.required),
    });
    component.data = { selected: false };
    component.claimValidation();
    expect(component.data.selected).toBeTruthy();
    expect(component.dialogRef.close).toHaveBeenCalledWith(component.data);
  });
});
