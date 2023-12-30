import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FairFoodDropDateComponent } from './ff-drop-date.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilService } from '../../service';
import { ACTION_TYPE } from '../../configs/app.constants';
import { MatIconModule } from '@angular/material/icon';
import { FfFilterBoxComponent } from 'fairfood-form-components';
import { dateFilterCommon } from './ff-drop-date.config';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

describe('FairFoodDropDateComponent', () => {
  let fixture: ComponentFixture<FairFoodDropDateComponent>;
  let component: FairFoodDropDateComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        CommonModule,
        MatMenuModule,
        MatIconModule,
        MatRadioModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        ReactiveFormsModule,
        FfFilterBoxComponent,
        FairFoodDropDateComponent,
        MatSnackBarModule,
        HttpClientModule,
      ],
      providers: [FormBuilder, UtilService],
    });

    fixture = TestBed.createComponent(FairFoodDropDateComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show validation error', () => {
    spyOn(component.utils, 'customSnackBar');

    component.showValidationError();

    expect(component.utils.customSnackBar).toHaveBeenCalledWith(
      'Please select the date !',
      ACTION_TYPE.FAILED
    );
  });
});

describe('dateFilterCommon', () => {
  it('should return date filter values for type 2', () => {
    const formValue = {
      selectedType: 2,
      selectedDate: new Date('2022-01-01'),
    };

    const result = dateFilterCommon(formValue);

    expect(result.dateOn).toBe('');
    expect(result.dateTo).toBe('01/01/2022');
    expect(result.dateFrom).toBe('');
    expect(result.empty).toBe(false);
    expect(result.dateEmpty).toBe(false);
    expect(result.dateFilterText).toBe('Before: 01/01/22');
  });

  it('should return date filter values for type 1', () => {
    const formValue = {
      selectedType: 1,
      start: new Date('2022-01-01'),
      end: new Date('2022-10-15'),
    };

    const result = dateFilterCommon(formValue);

    expect(result.dateOn).toBe('');
    expect(result.dateTo).toBe('15/10/2022');
    expect(result.dateFrom).toBe('01/01/2022');
    expect(result.empty).toBe(false);
    expect(result.dateEmpty).toBe(false);
    expect(result.dateFilterText).toBe('01/01/22 - 15/10/22');
  });

  it('should handle empty form value', () => {
    const formValue = {
      selectedType: 1,
      start: '',
      end: '',
    };

    const result = dateFilterCommon(formValue);

    expect(result.dateOn).toBe('');
    expect(result.dateTo).toBe('');
    expect(result.dateFrom).toBe('');
    expect(result.empty).toBe(true);
    expect(result.dateEmpty).toBe(false);
    expect(result.dateFilterText).toBe('');
  });

  it('should handle empty selected date', () => {
    const formValue = {
      selectedType: 2,
      selectedDate: '',
    };

    const result = dateFilterCommon(formValue);

    expect(result.dateOn).toBe('');
    expect(result.dateTo).toBe('');
    expect(result.dateFrom).toBe('');
    expect(result.dateFilterText).toBe('');
  });
});
