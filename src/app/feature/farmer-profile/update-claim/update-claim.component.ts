import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonsComponent } from 'fairfood-utils';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-update-claim',
  standalone: true,
  imports: [CommonModule, ButtonsComponent, MatIconModule],
  templateUrl: './update-claim.component.html',
  styleUrls: ['./update-claim.component.scss'],
})
export class UpdateClaimComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdateClaimComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  openEvidence(url: string): void {
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('File URL is not available.');
    }
  }

  hasFiles(): boolean {
    const responses = this.data?.criteria[0]?.field_responses;
    return responses?.some((file: any) => !!file?.file_name);
  }
}
