/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

import { UtilService } from 'src/app/shared/service';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { ConnectionService } from '../connections.service';

import { ButtonsComponent } from 'fairfood-utils';
import { FairFoodInputComponent } from 'fairfood-form-components';

@Component({
  selector: 'app-map-suppliers-request',
  templateUrl: './map-suppliers-request.component.html',
  styleUrls: ['./map-suppliers-request.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonsComponent,
    FairFoodInputComponent,
  ],
})
export class MapSuppliersRequestComponent implements OnDestroy {
  note = new FormControl('', [Validators.required, Validators.maxLength(50)]);
  pageAPI: Subscription[] = [];
  detailsForm: FormGroup = this.fb.group({
    note: [''],
  });
  sub: Subscription;
  constructor(
    public dialogRef: MatDialogRef<MapSuppliersRequestComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private utils: UtilService,
    private service: ConnectionService,
    private fb: FormBuilder
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  buttonAction(): void {
    const { map } = this.data;
    if (map) {
      this.sendRequest();
    } else {
      this.sendInvite();
    }
  }

  sendRequest(): void {
    const { id, supplyChain } = this.data;
    const params = {
      node: id,
      supply_chain: supplyChain,
      note: this.detailsForm.value.note,
    };
    this.sub = this.service
      .createConnectonRequest(params)
      .subscribe((res: any) => {
        if (res.success) {
          this.utils.customSnackBar(
            'Request sent successfully',
            ACTION_TYPE.SUCCESS
          );
          this.close();
        } else {
          this.utils.customSnackBar(
            'Failed to send request',
            ACTION_TYPE.FAILED
          );
        }
      });
  }

  sendInvite(): void {
    const { id, supplyChain } = this.data;
    const params = {
      node: id,
      supply_chain: supplyChain,
      message: this.detailsForm.value.note,
    };
    this.sub = this.service.resendFarmerInvite(params).subscribe({
      next: (data: any) => {
        this.dialogRef.close(data);
      },
      error: () => {
        this.utils.customSnackBar('Failed to send Invite', ACTION_TYPE.FAILED);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
