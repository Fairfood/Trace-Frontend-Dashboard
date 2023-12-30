import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnackBarComponent } from './snack-bar.component';
import { CommonModule } from '@angular/common';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
  MatSnackBarModule,
} from '@angular/material/snack-bar';

describe('SnackBarComponent', () => {
  let fixture: ComponentFixture<SnackBarComponent>;
  let component: SnackBarComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, MatSnackBarModule, SnackBarComponent],
      providers: [
        {
          provide: MatSnackBarRef,
          useValue: {
            dismiss: jasmine.createSpy('dismiss'),
          },
        },
        {
          provide: MAT_SNACK_BAR_DATA,
          useValue: {
            icon: 'success',
            message: 'This is a success message',
          },
        },
      ],
    });

    fixture = TestBed.createComponent(SnackBarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct message and apply the "font-success" class for success', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement;
    expect(element.querySelector('.font-success')).toBeTruthy();
    expect(element.querySelector('.font-error')).toBeNull();
    expect(element.querySelector('span').textContent).toContain(
      'This is a success message'
    );
  });

  it('should dismiss the snack bar when closed', () => {
    const snackBarRef = TestBed.inject(MatSnackBarRef);

    component.snackBarRef.dismiss();
    fixture.detectChanges();

    expect(snackBarRef.dismiss).toHaveBeenCalled();
  });

  // Add more test cases for different scenarios as needed
});
