/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
// configs
import { ACTION_TYPE } from '../../configs/app.constants';
import { UtilService } from '../../service';
// components
import {
  FairFoodInputComponent,
  FfFilterBoxComponent,
} from 'fairfood-form-components';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-ff-drop-quantity',
  templateUrl: './ff-drop-quantity.component.html',
  styleUrls: ['./ff-drop-quantity.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatMenuModule,
    FairFoodInputComponent,
    ButtonsComponent,
    FormsModule,
    ReactiveFormsModule,
    FfFilterBoxComponent,
  ],
})
export class FairFoodDropQuantityComponent implements OnInit, OnDestroy {
  // specifically for mobile filter component
  @Input() isMobile: boolean;
  @Input() defaultValues: any;
  @Output() closeFilterOption = new EventEmitter();
  @Output() appliedFilter = new EventEmitter();
  @Output() mobileValueChanges = new EventEmitter();

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  quantityFilterText: string;
  quantityFilterApplied: boolean;

  quantityForm = this.fb.group({
    larger: [''],
    smaller: [''],
  });

  filterValuesToSend: any;

  subArray: Subscription[] = [];

  constructor(private fb: FormBuilder, private utils: UtilService) {
    this.filterValuesToSend = {
      quantityFrom: '',
      quantityTo: '',
    };
  }

  ngOnInit(): void {
    if (this.isMobile) {
      const subscription = this.quantityForm.valueChanges.subscribe(
        (data: any) => {
          this.mobileValueChanges.emit(data);
        }
      );
      this.subArray.push(subscription);
    } else {
      const { quantityFrom, quantityTo } = this.defaultValues;

      if (quantityFrom && quantityTo) {
        this.quantityForm.patchValue({
          larger: quantityTo,
          smaller: quantityFrom,
        });
        this.applyQuantityFilter(true);
      }
    }
  }

  // hiding the entire filter option
  resetFilter(): void {
    this.quantityForm.reset();
    this.filterValuesToSend = {
      quantityFrom: '',
      quantityTo: '',
    };
    this.quantityFilterApplied = false;
    this.quantityFilterText = '';
    this.emitData();
  }
  /**
   * Quantity filter applied
   */
  applyQuantityFilter(emitData?: boolean): void {
    const { smaller, larger } = this.quantityForm.value;
    this.quantityFilterApplied = true;
    this.filterValuesToSend.quantityFrom = '';
    this.filterValuesToSend.quantityTo = '';

    if (smaller && !larger) {
      this.quantityFilterText = '>=' + smaller;
      this.filterValuesToSend.quantityFrom = smaller;
      if (!emitData) {
        this.emitData();
      }
    } else if (larger && !smaller) {
      this.quantityFilterText = '<=' + larger;
      this.filterValuesToSend.quantityTo = larger;
      if (!emitData) {
        this.emitData();
      }
    } else {
      if (smaller && larger) {
        this.quantityFilterText = smaller + '-' + larger;
        this.filterValuesToSend.quantityFrom = smaller;
        this.filterValuesToSend.quantityTo = larger;
        if (!emitData) {
          this.emitData();
        }
      } else {
        this.showValidationError();
      }
    }
  }

  emitData(): void {
    this.appliedFilter.emit(this.filterValuesToSend);
  }

  showValidationError(): void {
    this.utils.customSnackBar(
      'Please enter the required values',
      ACTION_TYPE.FAILED
    );
  }

  ngOnDestroy(): void {
    this.subArray.forEach(m => m.unsubscribe());
  }
}
