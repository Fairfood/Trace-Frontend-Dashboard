/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnDestroy } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { ClaimService } from '../claim.service';
import { ButtonsComponent } from 'fairfood-utils';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FairFoodInputComponent } from 'fairfood-form-components';
import { MatIconModule } from '@angular/material/icon';
import { notOnlyWhitespace } from 'src/app/shared/configs/app.methods';

@Component({
  selector: 'app-reject-claim',
  templateUrl: './reject-claim.component.html',
  styleUrls: ['./reject-claim.component.scss'],
  standalone: true,
  imports: [
    MatDialogModule,
    ButtonsComponent,
    ReactiveFormsModule,
    NgIf,
    TranslateModule,
    FairFoodInputComponent,
    MatIconModule,
  ],
})
export class RejectClaimComponent implements OnDestroy {
  sub: Subscription = new Subscription();

  detailsForm: FormGroup = this.fb.group({
    comment: [
      '',
      [Validators.required, Validators.maxLength(50), notOnlyWhitespace()],
    ],
  });
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<RejectClaimComponent>,
    public claimService: ClaimService,
    @Inject(MAT_DIALOG_DATA) public id: any,
    private fb: FormBuilder
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  rejectClaim(): void {
    this.loading = true;
    const { comment } = this.detailsForm.value;
    const params = { note: comment, status: 3 };
    this.sub = this.claimService.updateVerification(this.id, params).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: () => {
        this.dialogRef.close(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
