/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

import { RequestListingService } from '../request-listing/request-listing.service';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-remove-transparency-request',
  templateUrl: './remove-transparency-request.component.html',
  styleUrls: ['./remove-transparency-request.component.scss'],
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
export class RemovetransparencyRequestComponent implements OnInit {
  claims: any = [];
  submitted = false;
  sub: Subscription;
  editOrder: boolean;
  detailsForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RemovetransparencyRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public service: RequestListingService
  ) {}

  ngOnInit(): void {
    this.detailsForm = this.service.reasonForm();
    this.claims = this.data.claims;
  }

  close(): void {
    this.dialogRef.close();
  }

  deleteRequest(): void {
    this.submitted = true;
    if (this.detailsForm.valid) {
      const { reason } = this.detailsForm.value;
      const params = {
        status: 3,
        response: reason,
      };
      if (this.data.requestType == 1) {
        this.sub = this.service
          .updateStockRequest(this.data.id, params)
          .subscribe(res => {
            this.dialogRef.close(res);
          });
      } else {
        this.sub = this.service
          .removeTransparencyRequest(this.data.id)
          .subscribe(res => {
            this.dialogRef.close(res);
          });
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
