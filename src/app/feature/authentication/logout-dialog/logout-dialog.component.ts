/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
  styleUrls: ['./logout-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogModule, CommonModule, ButtonsComponent],
})
export class LogoutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LogoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close();
  }

  logout() {
    this.dialogRef.close(true);
  }
}
