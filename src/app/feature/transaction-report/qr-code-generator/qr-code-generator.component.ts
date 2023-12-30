/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { ClipboardModule } from '@angular/cdk/clipboard';

import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-qr-code-generator',
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NgxQRCodeModule,
    MatTooltipModule,
    MatIconModule,
    ClipboardModule,
  ],
})
export class QrCodeGeneratorComponent {
  @Input() qrCodeValue: string;
  @Input() storyTellingUrl: string;

  downloadImage(): void {
    domtoimage
      .toSvg(document.getElementById('qrcode'), { quality: 1 })
      .then(function (dataUrl: any) {
        const link = document.createElement('a');
        link.download = 'trace_qr.svg';
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error: any) {
        console.error('oops, something went wrong!', error);
      });
  }
}
