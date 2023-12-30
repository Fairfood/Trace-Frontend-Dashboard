import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ButtonsComponent } from 'fairfood-utils';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lose-data-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ButtonsComponent, MatIconModule],
  templateUrl: './lose-data-dialog.component.html',
  styleUrls: ['./lose-data-dialog.component.scss'],
})
export class LoseDataDialogComponent {
  constructor(private dialogRef: MatDialogRef<LoseDataDialogComponent>) {}

  close(): void {
    this.dialogRef.close('No');
  }

  remove(): void {
    this.dialogRef.close('Yes');
  }
}
