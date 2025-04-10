/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, takeUntil } from 'rxjs';
import saveAs from 'file-saver';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

// services
import { ClaimService } from '../claim.service';
import { StorageService, UtilService } from 'src/app/shared/service';
// configs
import { CLAIM_DETAIL_IMPORT, CLAIM_TABS } from './claim-information.config';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { notOnlyWhitespace } from 'src/app/shared/configs/app.methods';
// components
import { RejectClaimComponent } from '../reject-claim';

@Component({
  selector: 'app-claim-information',
  standalone: true,
  imports: CLAIM_DETAIL_IMPORT,
  templateUrl: './claim-information.component.html',
  styleUrls: ['./claim-information.component.scss'],
})
export class ClaimInformationComponent implements OnInit, OnDestroy {
  currentClaim: any;
  pageApis: Subscription[] = [];
  filesCount = 0;
  tabGroup: ICommonObj[] = CLAIM_TABS;
  currentTab: string = CLAIM_TABS[0].id;
  detailsForm: FormGroup = new FormGroup({
    comments: new FormControl('', [Validators.required, notOnlyWhitespace()]),
  });
  updatingComment = false;
  loading = true;
  canApprove: boolean;
  routerSubscription!: Subscription;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public service: ClaimService,
    private route: ActivatedRoute,
    public util: UtilService,
    public router: Router,
    private translate: TranslateService,
    private storage: StorageService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          const nextRoute = event.url;
          if (
            nextRoute !== '/claims' &&
            !nextRoute.startsWith('/claims/details')
          ) {
            this.service.resetPaginationState();
            this.service.selectedTab = 0;
          }
        }
      });
    const id = this.route?.snapshot?.params.id;
    this.claimDetails(id);
  }

  claimDetails(id: string): void {
    const api = this.service.getVerificationDetails(id).subscribe({
      next: res => {
        this.currentClaim = res;
        const companyId = this.storage.retrieveStoredData('companyID');
        const verify = res.verifiable && res.verifier.id === companyId;
        this.checkEligibility(verify);
      },
      error: err => {
        console.log(err);
        this.loading = false;
      },
    });
    this.pageApis.push(api);
  }

  checkEligibility(verify: boolean): void {
    const userData = this.storage.retrieveStoredData('userData');
    const viewAsAdmin = this.storage.retrieveStoredData('impersonate');
    const type = JSON.parse(userData)?.type;

    const approvalCondition = (viewAsAdmin || type === 1) && verify;

    if (approvalCondition) {
      this.canApprove = true;
    } else {
      this.canApprove = false;
    }
    this.loading = false;
  }

  /* istanbul ignore next */
  downloadFile(fileUrl: string): void {
    if (fileUrl) {
      const api = this.util
        .downloadReceipt(fileUrl)
        .subscribe((result: any) => {
          saveAs(result, fileUrl?.split('/').pop());
        });
      this.pageApis.push(api);
    } else {
      this.util.customSnackBar(
        this.translate.instant('claim.fileNotFound'),
        ACTION_TYPE.FAILED
      );
    }
  }

  changeTab(tab: ICommonObj): void {
    this.currentTab = tab.id;
  }

  viewTransaction() {
    let type;
    const {
      transaction: { transaction_type, id },
    } = this.currentClaim;
    if (transaction_type === 1) {
      type = 'external';
    } else {
      type = 'internal';
    }
    this.router.navigate(['transaction-report', type, id]);
  }

  addComments(): void {
    this.updatingComment = true;
    if (this.detailsForm.valid) {
      const { comments } = this.detailsForm.value;
      const params = {
        verification: this.currentClaim.id,
        message: comments,
      };
      const message = this.translate.instant('claim.failedComment');
      const api = this.service.addComments(params).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.loading = true;
            this.detailsForm.reset();
            this.updatingComment = false;
            this.claimDetails(this.currentClaim.id);
          } else {
            this.updatingComment = false;
            this.util.customSnackBar(message, ACTION_TYPE.FAILED);
          }
        },
        error: () => {
          this.updatingComment = false;
          this.util.customSnackBar(message, ACTION_TYPE.FAILED);
        },
      });
      this.pageApis.push(api);
    }
  }

  trackByFn(index: number): number {
    return index;
  }

  rejectClaim(): void {
    const dialogRef = this.dialog.open(RejectClaimComponent, {
      disableClose: true,
      width: '521px',
      height: 'auto',
      data: this.currentClaim.id,
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const message = 'Claim rejected successfully';
        this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
        this.loading = true;
        this.claimDetails(this.currentClaim.id);
      } else if (result === false) {
        const message = 'Failed to reject claim';
        this.util.customSnackBar(message, ACTION_TYPE.FAILED);
      }
    });
  }

  acceptClaim(): void {
    const id = this.currentClaim.id;
    const params = { note: '', status: 2 };
    const api = this.service
      .updateVerification(id, params)
      .subscribe((result: any) => {
        if (result.success) {
          const message = 'Claim accepted successfully';
          this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
          this.loading = true;
          this.claimDetails(id);
        } else {
          const message = 'Failed to accept claim';
          this.util.customSnackBar(message, ACTION_TYPE.FAILED);
        }
      });

    this.pageApis.push(api);
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
