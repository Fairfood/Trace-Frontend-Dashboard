/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { IconPathPipe } from './snack-bar.pipe';

@Component({
  selector: 'app-snack-bar',
  template: `<div class="ff-flex-start">
    <img class="prefix-img" [src]="data.icon | iconPath" alt="prefix" />
    <span [ngClass]="data.icon === 'success' ? 'font-success' : 'font-error'">
      {{ data.message }}
    </span>
  </div>`,
  styleUrls: ['./snack-bar.component.scss'],
  standalone: true,
  imports: [MatSnackBarModule, CommonModule, IconPathPipe],
})
export class SnackBarComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<SnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {}
}
