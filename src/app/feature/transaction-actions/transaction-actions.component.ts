/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { ButtonsComponent } from 'fairfood-utils';
import { FairFoodInputComponent } from 'fairfood-form-components';

import { TransactionActionsService } from './transaction-actions.service';

@Component({
  selector: 'app-transaction-actions',
  templateUrl: './transaction-actions.component.html',
  styleUrls: ['./transaction-actions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    FairFoodInputComponent,
    ButtonsComponent,
    MatIconModule,
  ],
})
export class TransactionActionsComponent implements OnDestroy {
  loading = false;
  pageAPI: Subscription[] = [];
  detailsForm: FormGroup = this.fb.group({
    comment: ['', [Validators.required, Validators.maxLength(50)]],
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private service: TransactionActionsService,
    public dialogRef: MatDialogRef<TransactionActionsComponent>,
    private fb: FormBuilder
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  formatDate(date: any): any {
    return this.service.formatDate(date);
  }

  removeStock(): void {
    if (!this.loading) {
      this.loading = true;
      const params = {
        type: 2,
        created_on: new Date().getTime() / 1000,
        source_batches: this.data.batches,
        comment: this.detailsForm.value.comment,
      };
      const api = this.service.removeStock(params).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.loading = false;
            this.dialogRef.close(true);
          } else {
            this.loading = false;
          }
        },
        error: () => {
          this.loading = false;
        },
      });
      this.pageAPI.push(api);
    }
  }

  rejectTransaction(): void {
    if (!this.loading) {
      this.loading = true;
      const api = this.service
        .rejectTransaction(this.data.id, {
          comment: this.detailsForm.value.comment,
        })
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              this.dialogRef.close(true);
            } else {
              this.loading = false;
            }
          },
          error: () => {
            this.loading = false;
          },
        });
      this.pageAPI.push(api);
    }
  }

  ngOnDestroy(): void {
    this.pageAPI?.forEach(a => a.unsubscribe());
  }
}
