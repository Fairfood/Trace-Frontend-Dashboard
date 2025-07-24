import { Component, Inject, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpdateClaimComponent } from 'src/app/feature/farmer-profile/update-claim/update-claim.component';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { UtilService } from '../../service';
import { TranslateModule } from '@ngx-translate/core';
import { ACTION_TYPE } from 'fairfood-utils';

@Component({
  selector: 'app-claim-popup-common',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: './claim-popup-common.component.html',
  styleUrls: ['./claim-popup-common.component.scss'],
})
export class ClaimPopupCommonComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private util = inject(UtilService);
  status: number;
  guardianClaims: any;
  guardian_url = 'https://guardian-dev.fairfood.org/login';

  constructor(
    public dialogRef: MatDialogRef<UpdateClaimComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.status = data?.claim?.status;
    this.guardianClaims = data?.claim?.guardian_claims[0];
  }

  close(): void {
    this.dialogRef.close();
  }

  // checkStatus(): void {
  //   const message = 'Checking claim status...';
  //   this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
  //   this.util
  //     .checkStatus(this.data?.claim?.guardian_claims[0]?.id, this.data?.nodeId)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((res: any) => {
  //       if (res.success) {
  //         this.status = res?.data?.claim_status;
  //       } else {
  //         // handle failure if needed
  //       }
  //     });
  // }

  openGuardianUrl(): void {
    window.open(this.guardian_url, '_blank');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
