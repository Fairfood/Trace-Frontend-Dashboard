/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DocumentationService } from '../documentation.service';

@Component({
  selector: 'app-doc-upload',
  templateUrl: './doc-upload.component.html',
  styleUrls: ['./doc-upload.component.scss'],
})
export class DocUploadComponent implements OnDestroy {
  files: any = [];
  filename = '';
  loader = false;
  uploadForm = this.fb.group({
    name: ['', [Validators.required]],
  });
  errMessage = '*This field is required';
  sub: Subscription;
  constructor(
    public dialogRef: MatDialogRef<DocUploadComponent>,
    private fb: FormBuilder,
    private companyService: DocumentationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  get fcontrol() {
    return this.uploadForm.controls;
  }

  close(): void {
    this.dialogRef.close();
  }

  uploadFile(event: any): void {
    const files = event.target.files;
    for (const file of files) {
      this.files = file;
    }
    this.filename = this.files.name;
    this.uploadForm.patchValue({
      name: this.files.name,
    });
  }
  deleteAttachment(index: number): void {
    this.files.splice(index, 1);
  }

  uploadDocument(): void {
    this.loader = true;
    const formData = new FormData();
    formData.append('file', this.files);
    formData.append('name', this.uploadForm.controls.name.value);
    this.sub = this.companyService.uploadDoc(formData).subscribe(
      (res: any) => {
        this.loader = false;
        this.dialogRef.close(res);
      },
      () => {
        this.loader = false;
        this.dialogRef.close(false);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
