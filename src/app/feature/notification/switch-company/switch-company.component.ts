import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { ButtonsComponent } from 'fairfood-utils';

@Component({
  selector: 'app-switch-company',
  standalone: true,
  imports: [MatDialogModule, CommonModule, ButtonsComponent, MatIconModule],
  templateUrl: './switch-company.component.html',
  styleUrls: ['./switch-company.component.scss'],
})
export class SwitchCompanyComponent {
  constructor(
    public dialogRef: MatDialogRef<SwitchCompanyComponent>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close();
  }

  switch() {
    this.dialogRef.close('change');
  }
}
