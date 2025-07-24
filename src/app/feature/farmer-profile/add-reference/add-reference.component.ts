/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { UtilService } from 'src/app/shared/service';
// constants and configs
import { IReference } from '../farmer-profile.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// components
import { ButtonsComponent } from 'fairfood-utils';
import {
  FairFoodInputComponent,
  FfDropdownComponent,
} from 'fairfood-form-components';

@Component({
  selector: 'app-add-reference',
  templateUrl: './add-reference.component.html',
  styleUrls: ['./add-reference.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    ButtonsComponent,
    FfDropdownComponent,
    FairFoodInputComponent,
    TranslateModule,
  ],
})
export class AddReferenceComponent implements OnInit, OnDestroy {
  refForm: FormGroup;
  loading: boolean;
  pageApis: Subscription[] = [];
  refArray: any[];
  submitted: boolean;
  buttonText: string;
  constructor(
    public dialogRef: MatDialogRef<AddReferenceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private store: FarmerProfileStoreService,
    private dataService: UtilService,
    private translate: TranslateService,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    const { farmerId, number, reference_details, id } = this.data;
    this.refForm = this.fb.group({
      reference: [reference_details?.id || '', Validators.required],
      idNumber: [number || ''],
      farmer: [farmerId || ''],
      refId: [id || ''],
    });
    this.buttonText = 'Done';
    const sub = this.store.masterReferences$.subscribe({
      next: (res: IReference) => {
        const { loading, results } = res;

        if (!loading) {
          this.refArray = results;
        }
      },
    });
    this.pageApis.push(sub);
  }

  dropdownChanged(data: any): void {
    const selectedValue = data.id === 'All' ? '' : data.id;
    this.refForm.patchValue({
      reference: selectedValue,
    });
  }

  createReference(): void {
    this.loading = true;
    this.buttonText = this.data.isEdit
      ? this.translate.instant('button.updating')
      : this.translate.instant('button.creating');
    this.submitted = true;
    if (this.refForm.valid) {
      const {
        value: { reference, idNumber, farmer, refId },
      } = this.refForm;

      if (!this.data.isEdit) {
        const reqObj = {
          number: idNumber,
          reference,
          farmer,
        };
        const api = this.store
          .createFarmerReference(reqObj, this.data.farmerId)
          .subscribe({
            next: () => {
              this.loading = false;
              this.dialogRef.close(true);
            },
            error: err => {
              this.loading = false; // Stop loading indicator
              const detail = err?.detail;
              this.util.customSnackBar(
                detail?.detail || detail?.number,
                ACTION_TYPE.FAILED
              );
              this.dialogRef.close(true);
            },
          });
        this.pageApis.push(api);
      } else {
        const reqObj = {
          number: idNumber,
        };
        this.updateReference(reqObj, refId);
      }
    } else {
      this.loading = false;
    }
  }

  /* istanbul ignore next */
  updateReference(reqObj: any, id: string): void {
    const api = this.store.updateFarmerReference(reqObj, id).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
        this.refForm.reset();
        this.submitted = false;
      },
      error: (err: any) => {
        this.loading = false;
        const detail = err?.detail;
        this.util.customSnackBar(
          detail?.detail || detail?.number,
          ACTION_TYPE.FAILED
        );
        this.dialogRef.close();
        this.refForm.reset();
        this.submitted = false;
      },
    });
    this.pageApis.push(api);
  }

  /* istanbul ignore next */
  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
