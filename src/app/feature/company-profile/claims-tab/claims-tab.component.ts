import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import saveAs from 'file-saver';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { ClaimService } from '../../claim';
import { ClaimDetailComponent } from '../../claim/claim-detail';
import { CompanyProfileService } from '../company-profile.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ACTION_TYPE, LoaderComponent } from 'fairfood-utils';
import { ClaimPopupCommonComponent } from 'src/app/shared/components/claim-popup-common/claim-popup-common.component';

@Component({
  selector: 'app-claims-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule, LoaderComponent, TranslateModule],
  templateUrl: './claims-tab.component.html',
  styleUrls: ['./claims-tab.component.scss'],
})
export class ClaimsTabComponent {
  @Input() nodeId: any;

  private destroy$ = new Subject<void>();

  attachedClaims: any[];
  transactionId: string;
  isReversal: boolean;

  availableClaims: any[] = [];
  selectedClaims: any[] = [];
  listOfClaims: any[] = [];
  loading = true;
  loaderText = 'Fetching claims';
  pageApis: Subscription[] = [];
  currentClaim: any;
  companies: any[];
  appliedFilter = {
    limit: 10,
    offset: 0,
  };
  showCheckStatusDiv = true;

  private util = inject(UtilService);
  public dialog = inject(MatDialog);
  private companyService = inject(CompanyProfileService);
  private claimService = inject(ClaimService);
  private store = inject(GlobalStoreService);
  public route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.getCompanyClaims();
  }

  getCompanyClaims(currentClaim?: any): void {
    const { limit, offset } = this.appliedFilter;
    const api = this.companyService
      .listCompanyClaims(this.nodeId, limit, offset)
      .subscribe((res: any) => {
        const { results, count } = res;
        this.selectedClaims = results;
        // this.currentClaim = results[0];
        // this.loading = false;
        // this.fetchClaims(this.selectedClaims)

        this.getConnectedCompanyList(results, currentClaim);
      });
    this.pageApis.push(api);
  }

  fetchClaims(claims: any[], currentClaim?: any): void {
    const api = this.companyService
      .getCompanyClaims()
      .subscribe((result: any) => {
        this.generateClaimList(result, claims, currentClaim);
      });
    this.pageApis.push(api);
  }

  generateClaimList(result: any[], claims: any[], currentClaim?: any): void {
    const selectedClaimsIds = claims?.map(m => m.claim_id);
    this.listOfClaims = this.claimService.formatClaimsData(
      result,
      this.companies
    );
    this.listOfClaims.forEach((claim: any) => {
      if (!selectedClaimsIds.includes(claim.id)) {
        this.availableClaims.push(claim);
      }
    });

    this.selectedClaims = claims;
    currentClaim
      ? (this.currentClaim = this.selectedClaims.find(
          claim => claim.id === currentClaim.id
        ))
      : (this.currentClaim = claims[0]);
    this.loading = false;
  }

  getConnectedCompanyList(transactionClaims: any, currentClaim?: any): void {
    const API_CALL = this.store.connectedCompanies$.subscribe({
      next: (res: any) => {
        if (res) {
          this.companies = res;
          this.fetchClaims(transactionClaims, currentClaim);
        }
      },
      error: (err: any) => {
        console.log(err);
        this.fetchClaims(transactionClaims);
      },
    });
    this.pageApis.push(API_CALL);
  }

  showDetails(claim: any): void {
    if (claim.id !== this.currentClaim?.id) {
      this.currentClaim = claim;
    }
    this.showCheckStatusDiv = true;
  }

  addClaimToTransaction(claim: any, isEdit: boolean): void {
    const dialogData = JSON.parse(
      JSON.stringify({
        ...claim,
        isEdit,
      })
    );
    const dialogRef = this.dialog.open(ClaimDetailComponent, {
      disableClose: true,
      autoFocus: false,
      width: '45vw',
      maxWidth: '800px',
      height: 'auto',
      maxHeight: '700px',
      data: dialogData,
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.loaderText = 'Attaching claims';
        this.currentClaim = null;
        this.attachClaims(result);
      }
    });
  }

  attachClaims(claim: any): void {
    const req = {
      node: this.nodeId,
      claims: [claim.id],
    };
    const api = this.companyService
      .claimAttachCompany(req)
      .subscribe((res: any) => {
        if (res.success) {
          this.selectedClaims = [];
          this.availableClaims = [];
          this.getCompanyClaims();
        } else {
          this.loading = false;
        }
      });
    this.pageApis.push(api);
  }

  downloadFile(fileUrl: string): void {
    const api = this.util.downloadReceipt(fileUrl).subscribe((result: any) => {
      saveAs(result, fileUrl?.split('/').pop());
    });
    this.pageApis.push(api);
  }

  // openPopup(): void {
  //   if (
  //     this.currentClaim?.claim_processor == 'guardian' &&
  //     this.currentClaim?.status == 2
  //   ) {
  //     const dialogRef = this.dialog.open(ClaimPopupCommonComponent, {
  //       disableClose: true,
  //       width: '45vw',
  //       maxWidth: '800px',
  //       height: 'auto',
  //       maxHeight: '700px',
  //       data: { claim: this.currentClaim, nodeId: this.nodeId },
  //       panelClass: 'custom-modalbox',
  //     });

  //     // dialogRef.afterClosed().subscribe(result => {
  //     //   this.loading = true;
  //     //   this.ngOnInit();
  //     // });
  //   }
  // }

  checkStatus(): void {
    this.showCheckStatusDiv = false;
    setTimeout(() => {
      this.showCheckStatusDiv = true;
    }, 20000);
    const message = 'Checking claim status...';
    this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
    this.util
      .checkStatus(this.currentClaim?.guardian_claims[0]?.id, this.nodeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.success) {
          // if (res?.data?.claim_status != this.currentClaim.status) {
          this.loading = true;
          this.getCompanyClaims(this.currentClaim);
          // }
        } else {
          // handle failure if needed
        }
      });
  }

  openGuardianUrl(url: string): void {
    window.open(url, '_blank');
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
