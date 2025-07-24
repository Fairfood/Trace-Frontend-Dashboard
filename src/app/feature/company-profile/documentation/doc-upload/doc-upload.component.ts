/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
// services
import { DocumentationService } from '../documentation.service';
// components
import { FairFoodInputComponent } from 'fairfood-form-components';
import { ButtonsComponent } from 'fairfood-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-doc-upload',
  templateUrl: './doc-upload.component.html',
  styleUrls: ['./doc-upload.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    MatDialogModule,
    MatIconModule,
    FairFoodInputComponent,
    ButtonsComponent,
    TranslateModule,
    ReactiveFormsModule,
  ],
})
export class DocUploadComponent implements OnDestroy {
  files: any = [];
  filename = '';
  loader = false;
  uploadForm = this.fb.group({
    name: ['', [Validators.required]],
  });
  sub: Subscription;
  constructor(
    public dialogRef: MatDialogRef<DocUploadComponent>,
    private fb: FormBuilder,
    private companyService: DocumentationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  uploadDocument(): void {
    this.loader = true;
    const formData = new FormData();
    formData.append('file', this.files);
    formData.append('name', this.uploadForm.controls.name.value);
    this.sub = this.companyService.uploadDoc(formData).subscribe({
      next: (res: any) => {
        this.loader = false;
        this.dialogRef.close(res);
      },
      error: () => {
        this.loader = false;
        this.dialogRef.close(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
