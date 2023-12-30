import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageCropperModule } from 'ngx-image-cropper';
// components
import { ProfileAvatarComponent } from './profile-avatar.component';
import { ChangeAvatarComponent } from './change-avatar';
import { ButtonsComponent } from 'fairfood-utils';

@NgModule({
  declarations: [ProfileAvatarComponent, ChangeAvatarComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    ImageCropperModule,
    ButtonsComponent,
  ],
  exports: [ProfileAvatarComponent],
})
export class ProfileAvatarModule {}
