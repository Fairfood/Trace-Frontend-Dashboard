import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { ClipboardModule } from '@angular/cdk/clipboard';
@Component({
  selector: 'app-common-wallet',
  templateUrl: './common-wallet.component.html',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, MatIconModule, ClipboardModule],
})
export class CommonWalletComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() wallet: any;
  @Input() type: number;
  @Input() url: string;
  @Input() showCopyIcon?: boolean;
}
