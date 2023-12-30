/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangeAvatarComponent } from './change-avatar/change-avatar.component';

@Component({
  selector: 'app-profile-avatar',
  templateUrl: './profile-avatar.component.html',
  styleUrls: ['./profile-avatar.component.scss'],
})
export class ProfileAvatarComponent {
  @Input() imageUrl?: string;
  @Input() avatar?: string;

  @Input() isEditing?: boolean;

  @Output() itemClicked = new EventEmitter();

  constructor(public dialog: MatDialog) {}

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
