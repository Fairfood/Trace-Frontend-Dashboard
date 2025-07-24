import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';

import { ButtonsComponent } from 'fairfood-utils';
import { ACTION_TYPE } from '../../configs/app.constants';
// services
import { TransactionsService } from 'src/app/feature/transactions';
import { ListingService } from 'src/app/feature/stock/listing';
import { UtilService } from '../../service';

@Component({
  selector: 'app-archive-confirmation-popup',
  standalone: true,
  imports: [CommonModule, ButtonsComponent, MatIconModule, TranslateModule],
  templateUrl: './archive-confirmation-popup.component.html',
  styleUrls: ['./archive-confirmation-popup.component.scss'],
})
export class ArchiveConfirmationPopupComponent {
  pageApis: Subscription[] = [];

  constructor(
    private trService: TransactionsService,
    private service: ListingService,
    private utils: UtilService,
    public dialogRef: MatDialogRef<ArchiveConfirmationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  /**
   * The closePopup function closes the current dialog window.
   */
  closePopup(): void {
    this.dialogRef.close();
  }

  /**
   * The function `updateArchiveStatusTrans` updates the archive status using an API call and displays
   * a success or failure message accordingly.
   */
  updateArchiveStatusTrans() {
    let updateObservable: Observable<any>;

    if (this.data?.transactionType === 'internal') {
      updateObservable = this.trService.updateArchiveStatusInternal(
        this.data?.params
      );
    } else {
      updateObservable = this.trService.updateArchiveStatusExternal(
        this.data?.params
      );
    }

    const api = updateObservable.subscribe({
      next: (res: any) => {
        const message = 'Archive status updated';
        this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
        this.dialogRef.close(true);
      },
      error: () => {
        const message = 'Failed to update archive status';
        this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
      },
    });

    this.pageApis.push(api);
  }

  /**
   * The function `updateArchiveStatusStock` updates the archive status and displays a success or
   * failure message accordingly.
   */
  updateArchiveStatusStock() {
    const api2 = this.service.updateArchiveStatus(this.data?.params).subscribe({
      next: (res: any) => {
        const message = 'Archive status updated';
        this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
        this.dialogRef.close(true);
      },
      error: () => {
        const message = 'Failed to update archive status';
        this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
      },
    });
    this.pageApis.push(api2);
  }

  /**
   * The ngOnDestroy function in TypeScript unsubscribes from all subscriptions in the pageApis array.
   */
  ngOnDestroy(): void {
    this.pageApis?.forEach(sub => sub?.unsubscribe());
  }
}
