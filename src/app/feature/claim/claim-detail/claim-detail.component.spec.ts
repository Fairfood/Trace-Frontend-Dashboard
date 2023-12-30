import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { of } from 'rxjs';
import { ClaimService } from '../claim.service';
import { ClaimDetailComponent } from './claim-detail.component';

describe('ClaimDetailComponent', () => {
  let component: ClaimDetailComponent;
  let fixture: ComponentFixture<ClaimDetailComponent>;
  let mockDialogRef: MatDialogRef<ClaimDetailComponent>;
  let mockClaimService: Partial<ClaimService>;

  beforeEach(() => {
    mockDialogRef = jasmine.createSpyObj(['close']);
    mockClaimService = {
      getVerifiers: () => of([]),
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        ClaimDetailComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ClaimService, useValue: mockClaimService },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form when verified_by is EXTERNAL_VERIFIER', () => {
    component.data = { verified_by: 2, isEdit: false };
    component.initForm();
    expect(component.evidenceForm).toBeTruthy();
  });

  it('should initialize the form with verifier values when isEdit is true', () => {
    component.data = {
      verified_by: 2,
      isEdit: true,
      verifier: { name: 'Verifier Name' },
    };
    component.initForm();
    expect(component.evidenceForm).toBeTruthy();
  });

  it('should set verifier when setVerifier is called', () => {
    const verifier = { id: 1, name: 'Verifier' };
    component.setVerifier(verifier);
    expect(component.data.verifier).toBe(verifier);
  });

  // Add more tests for other methods and interactions
});
