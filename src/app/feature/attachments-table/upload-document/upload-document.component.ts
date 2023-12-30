/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss'],
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
