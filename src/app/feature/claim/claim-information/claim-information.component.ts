/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import saveAs from 'file-saver';

import { CLAIM_DETAIL_IMPORT, CLAIM_TABS } from './claim-information.config';
import { ClaimService } from '../claim.service';
import { UtilService } from 'src/app/shared/service';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-claim-information',
  standalone: true,
  imports: [...CLAIM_DETAIL_IMPORT],
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
    comments: new FormControl('', Validators.required),
  });
  updatingComment = false;
  loading = true;

  constructor(
    private service: ClaimService,
    private route: ActivatedRoute,
    private util: UtilService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route?.snapshot?.params.id;
    this.claimDetails(id);
  }

  claimDetails(id: string): void {
    const api = this.service.getVerificationDetails(id).subscribe({
      next: res => {
        this.currentClaim = res;
        this.loading = false;
      },
      error: err => {
        console.log(err);
      },
    });
    this.pageApis.push(api);
  }

  downloadFile(fileUrl: string): void {
    if (fileUrl) {
      const api = this.util
        .downloadReceipt(fileUrl)
        .subscribe((result: any) => {
          saveAs(result, fileUrl?.split('/').pop());
        });
      this.pageApis.push(api);
    } else {
      this.util.customSnackBar('File not found', ACTION_TYPE.FAILED);
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

  addComments() {
    this.updatingComment = true;
    if (this.detailsForm.valid) {
      const { comments } = this.detailsForm.value;
      const params = {
        verification: this.currentClaim.id,
        message: comments,
      };
      const api = this.service.addComments(params).subscribe(
        (res: any) => {
          if (res.success) {
            this.loading = true;
            this.detailsForm.reset();
            this.updatingComment = false;
            this.claimDetails(this.currentClaim.id);
          } else {
            const message = 'Failed to add comment';
            this.updatingComment = false;
            this.util.customSnackBar(message, ACTION_TYPE.FAILED);
          }
        },
        () => {
          const message = 'Failed to add comment';
          this.updatingComment = false;
          this.util.customSnackBar(message, ACTION_TYPE.FAILED);
        }
      );
      this.pageApis.push(api);
    }
  }

  trackByFn(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
  }
}
