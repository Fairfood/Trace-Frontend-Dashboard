/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ImageCroppedEvent, ImageCropperModule } from 'ngx-image-cropper';
import { ButtonsComponent } from 'fairfood-utils';
import { UtilService } from '../../service';
import { ACTION_TYPE } from '../../configs/app.constants';
import { TranslateModule } from '@ngx-translate/core';

interface DialogData {
  image: string;
  roundCrope: boolean;
}

@Component({
  selector: 'app-change-avatar',
  templateUrl: './change-avatar.component.html',
  styleUrls: ['./change-avatar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    ImageCropperModule,
    ButtonsComponent,
    TranslateModule,
  ],
})
export class ChangeAvatarComponent implements OnInit {
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImg: any;
  savePro = false;
  base64: any;
  uploader: any;
  deleteProfilePic = false;
  roundCrope: boolean;
  loader = false;
  constructor(
    public dialogRef: MatDialogRef<ChangeAvatarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private util: UtilService
  ) {}

  ngOnInit() {
    this.roundCrope = this.data.roundCrope;
  }

  // method to select image
  fileChangeEvent(event: any): void {
    const file = event.target.files[0];

    // Handle SVG files separately
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const svgData = e.target.result;

        // Create a canvas to draw the SVG and export as PNG
        const img = new Image();
        img.src = svgData;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);

          // Convert the canvas to a PNG
          const pngData = canvas.toDataURL('image/png');
          this.imageChangedEvent = {
            target: { files: [this.dataURItoBlob(pngData)] },
          }; // Pass PNG to cropper
        };
      };
      reader.readAsDataURL(file);
    } else {
      // Handle non-SVG files as usual
      this.imageChangedEvent = event;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  loadImageFailed() {
    this.util.customSnackBar('Image upload failed', ACTION_TYPE.FAILED);
  }

  // method close image upload pop-up
  close() {
    this.dialogRef.close({
      type: 'dismiss',
    });
  }

  crop() {
    this.croppedImg = this.croppedImage;
    this.savePro = true;
  }

  // method to upload new image
  /* istanbul ignore next */
  upload() {
    this.loader = true;
    if (this.croppedImg) {
      this.base64 = this.croppedImg;
    } else {
      this.base64 = this.croppedImage;
    }
    const date = new Date().valueOf();
    let text = '';
    const possibleText =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      text += possibleText.charAt(
        Math.floor(Math.random() * possibleText.length)
      );
    }
    // Replace extension according to your media type
    const imageName = date + '.' + text + '.png';
    // call method that creates a blob from dataUri
    const imageBlob = this.dataURItoBlob(this.base64);
    const imageFile = new File([imageBlob], imageName, { type: 'image/png' });
    const formData = new FormData();
    formData.append('image', imageFile);
    this.dialogRef.close({
      type: 'upload',
      formData,
      image: this.base64,
    });
  }

  /* istanbul ignore next */
  dataURItoBlob(dataURI: any) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  delete() {
    this.deleteProfilePic = true;
  }

  confirmDelete() {
    const formData = new FormData();
    formData.append('image', '');
    this.dialogRef.close({
      type: 'delete',
      formData,
      image: '',
    });
  }

  cancel() {
    this.deleteProfilePic = false;
  }
}
