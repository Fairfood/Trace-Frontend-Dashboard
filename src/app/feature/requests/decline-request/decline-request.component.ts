/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnDestroy } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { RequestListingService } from '../request-listing/request-listing.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-decline-request',
  templateUrl: './decline-request.component.html',
  styleUrls: ['./decline-request.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatIconModule,
    FairFoodInputComponent,
    ButtonsComponent,
    ReactiveFormsModule,
  ],
})
export class DeclineRequestComponent implements OnDestroy {
  claims: any = [];
  submitted = false;
  sub: Subscription;
  detailsForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DeclineRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serice: RequestListingService
  ) {
    this.detailsForm = this.serice.reasonForm();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  close() {
    this.dialogRef.close();
  }

  declineRequest() {
    const { reason } = this.detailsForm.value;
    if (this.data.request_type == 4) {
      const params = {
        response: reason,
        status: 3,
      };
      //console.log(this.data.id)
      this.sub = this.serice
        .updateMapSupplierRequest(this.data.id, params)
        .subscribe({
          next: (res: any) => {
            this.dialogRef.close(res);
          },
          error: () => {
            this.dialogRef.close({ success: false });
          },
        });
    } else {
      const params = {
        response: reason,
        status: 3,
      };
      this.sub = this.serice
        .updateClaimRequest(this.data.id, params)
        .subscribe({
          next: (res: any) => {
            this.dialogRef.close(res);
          },
          error: () => {
            this.dialogRef.close({ success: false });
          },
        });
    }
  }
}
