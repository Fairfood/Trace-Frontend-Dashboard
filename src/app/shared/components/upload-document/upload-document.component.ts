/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// material
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
// custom library
import { FairFoodInputComponent } from 'fairfood-form-components';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss'],
  imports: [
    CommonModule,
    MatIconModule,
    ButtonsComponent,
    ReactiveFormsModule,
    FairFoodInputComponent,
  ],
  standalone: true,
})
export class UploadDocumentComponent {
  receiptForm: FormGroup = this.fb.group({
    file: ['', Validators.required],
    fileName: ['Receipt', Validators.required],
  });

  constructor(
    public dialogRef: MatDialogRef<UploadDocumentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {}

  /**
   * A transaction can have a receipt
   * No edit feature
   */
  uploadReceipt(fileEvent: any): void {
    if (fileEvent.target.files.length > 0) {
      const selectedFile = fileEvent.target.files[0];
      this.receiptForm.patchValue({
        file: selectedFile,
      });
    }
  }

  removeFile(): void {
    this.receiptForm.patchValue({
      file: '',
    });
  }

  uploadFile(): void {
    if (this.receiptForm.valid) {
      this.dialogRef.close(this.receiptForm.value);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
