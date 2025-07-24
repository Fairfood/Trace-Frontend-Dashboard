/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// material
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// other components
import { ChangeAvatarComponent } from '../change-avatar';

@Component({
  selector: 'app-profile-avatar',
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    ChangeAvatarComponent,
  ],
})
export class ProfileAvatarComponent {
  @Input() imageUrl?: string;
  @Input() avatar?: string;
  @Input() label?: boolean = false;

  @Input() isEditing?: boolean;

  @Output() itemClicked = new EventEmitter();

  constructor(public dialog: MatDialog) {}

  /* istanbul ignore next */
  openImageUpload(): void {
    const dialogRef = this.dialog.open(ChangeAvatarComponent, {
      disableClose: true,
      width: '450px',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: {
        image: this.imageUrl || '',
        roundCrope: true,
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.itemClicked.emit(result);
      }
    });
  }
}
