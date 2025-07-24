import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-remove-dialog',
  templateUrl: './remove-dialog.component.html',
  styleUrls: ['./remove-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, MatDialogModule, ButtonsComponent, MatIconModule],
})
export class RemoveDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RemoveDialogComponent>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }
  remove(): void {
    this.dialogRef.close(this.data.id);
  }
}
