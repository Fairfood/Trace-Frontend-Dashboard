/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// material
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
// .. services, etc. ..
import { UtilService } from 'src/app/shared/service';
import { RequestListingService } from '../request-listing/request-listing.service';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
// Components
import { ClaimsEvidenceComponent } from '../../claim/claims-evidence';
import { ButtonsComponent } from 'fairfood-utils';
import { FairFoodInputComponent } from 'fairfood-form-components';

@Component({
  selector: 'app-request-response',
  templateUrl: './request-response.component.html',
  styleUrls: ['./request-response.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    TranslateModule,
    ButtonsComponent,
    FairFoodInputComponent,
  ],
})
export class RequestResponseComponent implements OnInit, OnDestroy {
  claims: any = [];
  reason = '';
  submitted = false;
  filescount = 0;
  fieldsclaim: any;
  fileList: any = [];
  pageApis: Subscription[] = [];
  detailsForm: FormGroup = this.fb.group({
    comment: ['', [Validators.maxLength(50)]],
  });

  constructor(
    public dialogRef: MatDialogRef<RequestResponseComponent>,
    @Inject(MAT_DIALOG_DATA) public requestData: any,
    public dialog: MatDialog,
    private utils: UtilService,
    private service: RequestListingService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.requestData.fields.filter((e: any) => {
      if (e.type == 3) {
        this.filescount++;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  respond(): void {
    this.requestData.fields.forEach((field: any) => {
      if (field.type != 3) {
        if (field.value) {
          const formData = new FormData();
          formData.append('response', field.value);
          formData.append('field', field.id);
          const api = this.service
            .addClaimResponse(field.id, formData)
            .subscribe({
              next: (res: any) => {
                console.log('saveClaimFiles res', res);
              },
              error: () => {
                const message = 'Failed to upload data';
                this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
              },
            });
          this.pageApis.push(api);
        }
      }
    });
    for (const file of this.fileList) {
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('field', file.field);
      const api = this.service
        .addClaimResponse(file.field, formData)
        .subscribe({
          next: (res: any) => {
            console.log('saveClaimFiles res', res);
          },
          error: () => {
            const message = 'Failed to upload file';
            this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
          },
        });
      this.pageApis.push(api);
    }

    const { comment } = this.detailsForm.value;
    const params = {
      response: comment,
      status: 4,
    };
    const api = this.service
      .updateClaimRequest(this.requestData.id, params)
      .subscribe({
        next: () => {
          this.dialogRef.close(this.requestData);
        },
        error: () => {
          const message = 'Failed to send response';
          this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
        },
      });
    this.pageApis.push(api);
  }

  viewFiles(field: any): void {
    this.dialog.open(ClaimsEvidenceComponent, {
      disableClose: true,
      width: '750px',
      height: 'auto',
      data: field,
    });
  }

  removeClaimFile(field: any): void {
    const index = this.fileList.findIndex((e: any) => e.field === field.id);
    this.fileList.splice(index, 1);
    field.file = false;
    delete field.value;
  }

  claimsFile(file: any, item: any): void {
    item.file = true;
    item.value = file;
    const params = {
      field: item.id,
      file: file.target.files[0],
      node: localStorage.getItem('companyID'),
    };
    this.fileList.push(params);
  }

  checkCompleted(): void {
    const claim = this.requestData;
    const values = [];
    claim.fields.map((field: any) => {
      if (field.type == 3) {
        if (field.file) {
          values.push(true);
        }
      }
      if (field.type === 2 || field.value === 1) {
        if (field.value) {
          values.push(true);
        }
      }
    });

    if (claim.fields.length == values.length) {
      claim.completed = true;
    } else {
      claim.completed = false;
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(sub => sub.unsubscribe());
  }
}
