import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ACTION_TYPE, ButtonsComponent } from 'fairfood-utils';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TransactionReportService } from '../transaction-report.service';
import { UtilService } from 'src/app/shared/service';
import { Subject, takeUntil } from 'rxjs';

export function gtinValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value?.toString().trim();

  if (!value) {
    return { required: true };
  }

  if (!/^\d+$/.test(value)) {
    return { invalidCharacters: true };
  }

  if (![8, 12, 13, 14].includes(value.length)) {
    return { invalidLength: true };
  }

  // if (!/^\d+$/.test(value)) {
  //   return { invalidCharacters: true };
  // }

  // if (!isValidGtin(value)) {
  //   return { invalidChecksum: true };
  // }

  return null;
}

// function isValidGtin(gtin: string): boolean {
//   const digits = gtin.split('').map(Number);
//   let sum = 0;
//   let multiplier = 3;

//   for (let i = gtin.length - 2; i >= 0; i--) {
//     sum += digits[i] * multiplier;
//     multiplier = multiplier === 3 ? 1 : 3;
//   }

//   const checkDigit = (10 - (sum % 10)) % 10;
//   return checkDigit === digits[gtin.length - 1];
// }

@Component({
  selector: 'app-gs1-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ButtonsComponent,
    ReactiveFormsModule,
    FairFoodInputComponent,
  ],
  templateUrl: './gs1-popup.component.html',
  styleUrls: ['./gs1-popup.component.scss'],
})
export class Gs1PopupComponent {
  gtinForm: FormGroup = this.fb.group({
    gtin: ['', [Validators.required, gtinValidator]],
  });
  private destroy$ = new Subject<void>();
  constructor(
    public dialogRef: MatDialogRef<Gs1PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private service: TransactionReportService,
    private dataService: UtilService
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  updateGtin(type?: string): void {
    let formData;
    type == 'remove'
      ? (formData = { gtin: '' })
      : (formData = this.gtinForm.value);
    const id = this.data.id;
    this.service
      .updateGs1(id, formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: any) => {
          if (result) {
            this.dataService.customSnackBar(
              'GTIN updated successfully',
              ACTION_TYPE.SUCCESS
            );
            this.dialogRef.close(true);
          }
        },
        error: error => {
          const errorMessage = error?.detail?.detail || 'Failed to update GTIN';
          this.dataService.customSnackBar(errorMessage, ACTION_TYPE.FAILED);
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
