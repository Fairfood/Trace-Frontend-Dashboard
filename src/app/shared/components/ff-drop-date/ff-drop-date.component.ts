/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// material
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

// configs
import { dateFilterCommon } from './ff-drop-date.config';
import { ACTION_TYPE } from '../../configs/app.constants';
// service
import { UtilService } from '../../service';
// components
import { ButtonsComponent } from 'fairfood-utils';
import { FfFilterBoxComponent } from 'fairfood-form-components';
/**
 * DropDate component is used in filters as date filter
 * UI consist of 3 radio buttons and a date selection input
 */
@Component({
  selector: 'app-ff-drop-date',
  templateUrl: './ff-drop-date.component.html',
  styleUrls: ['./ff-drop-date.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatIconModule,
    MatRadioModule,
    MatInputModule,
    ButtonsComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FfFilterBoxComponent,
  ],
})
export class FairFoodDropDateComponent implements OnInit {
  @Input() isMobile: boolean;
  @Input() label: string;

  @Output() appliedFilter = new EventEmitter();
  @Output() mobileValues = new EventEmitter();

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  dateForm = this.fb.group({
    selectedType: [1],
    selectedDate: [''],
    start: [''],
    end: [''],
  });

  dateFormModel = [
    {
      label: 'Range',
      type: 1,
    },
    {
      label: 'Before',
      type: 2,
    },
  ];

  dateFilterApplied: boolean;
  maxDate = new Date();
  dateFilterText: string;

  filterValuesToSend: any;
  /* istanbul ignore next */
  constructor(private fb: FormBuilder, public utils: UtilService) {
    this.filterValuesToSend = {
      dateOn: '',
      dateTo: '',
      dateFrom: '',
    };
  }
  /* istanbul ignore next */
  ngOnInit(): void {
    if (this.isMobile) {
      this.dateForm.valueChanges.subscribe(formValues => {
        this.mobileValues.emit(formValues);
      });
    }
  }
  /* istanbul ignore next */
  applyDateFilter(): void {
    const receiveData: any = dateFilterCommon(this.dateForm.value);
    if (receiveData.empty) {
      this.dateFilterApplied = false;
      this.utils.customSnackBar('Please choose a filter!', ACTION_TYPE.FAILED);
    } else if (receiveData.dateEmpty) {
      this.dateFilterApplied = false;
      this.showValidationError();
    } else {
      this.filterValuesToSend = {
        dateOn: receiveData.dateOn,
        dateTo: receiveData.dateTo,
        dateFrom: receiveData.dateFrom,
      };
      this.dateFilterApplied = true;
      this.dateFilterText = receiveData.dateFilterText;
      this.emitValues();
    }
  }
  /* istanbul ignore next */
  emitValues(): void {
    this.appliedFilter.emit(this.filterValuesToSend);
    this.trigger.closeMenu();
  }

  showValidationError(): void {
    this.utils.customSnackBar('Please select the date !', ACTION_TYPE.FAILED);
  }
  /* istanbul ignore next */
  closeFilter(): void {
    this.dateForm.reset();
    this.dateForm.patchValue({
      selectedType: 1,
    });
    this.trigger.closeMenu();
    this.filterValuesToSend = {
      dateOn: '',
      dateTo: '',
      dateFrom: '',
    };
    this.dateFilterText = '';
    this.dateFilterApplied = false;
    this.appliedFilter.emit(this.filterValuesToSend);
  }
}
