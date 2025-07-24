import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SwitchCompanyComponent } from './switch-company.component';
import { ButtonsComponent } from 'fairfood-utils';

describe('SwitchCompanyComponent', () => {
  let component: SwitchCompanyComponent;
  let fixture: ComponentFixture<SwitchCompanyComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<SwitchCompanyComponent>>;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj(['close']);

    await TestBed.configureTestingModule({
      imports: [
        SwitchCompanyComponent,
        MatIconModule,
        CommonModule,
        ButtonsComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog when close() is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close the dialog with "change" when switch() is called', () => {
    component.switch();
    expect(mockDialogRef.close).toHaveBeenCalledWith('change');
  });
});
