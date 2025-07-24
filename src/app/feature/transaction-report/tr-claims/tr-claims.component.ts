/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { saveAs } from 'file-saver';

import { ClaimService } from '../../claim/claim.service';
import { UtilService } from 'src/app/shared/service';

import { ClaimDetailComponent } from '../../claim/claim-detail';
import { CL_IMPORTS } from './tr-claims.config';
import { GlobalStoreService } from 'src/app/shared/store';
import { ClaimPopupCommonComponent } from 'src/app/shared/components/claim-popup-common/claim-popup-common.component';
import { ACTION_TYPE } from 'fairfood-utils';
@Component({
  selector: 'app-tr-claims',
  templateUrl: './tr-claims.component.html',
  styleUrls: ['./tr-claims.component.scss'],
  standalone: true,
  imports: CL_IMPORTS,
})
export class TrClaimsComponent implements OnChanges, OnDestroy {
  @Input() attachedClaims: any[];
  @Input() transactionId: string;
  @Input() isReversal: boolean;
  @Input() currentClaimInput: any;

  @Output() claimAttached = new EventEmitter();

  private destroy$ = new Subject<void>();

  availableClaims: any[] = [];
  selectedClaims: any[] = [];
  listOfClaims: any[] = [];
  loading = true;
  loaderText = 'Fetching claims';
  pageApis: Subscription[] = [];
  currentClaim: any;
  companies: any[];
  showCheckStatusDiv = true;

  constructor(
    private claimService: ClaimService,
    public dialog: MatDialog,
    private util: UtilService,
    private store: GlobalStoreService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Get all the connected suppliers for initial showing
   */
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
        this.fetchClaims(transactionClaims, currentClaim);
      },
    });
    this.pageApis.push(API_CALL);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { attachedClaims, currentClaimInput } = changes;
    const transactionClaims = attachedClaims.currentValue;
    if (this.isReversal) {
      this.selectedClaims = transactionClaims;
      this.currentClaim = transactionClaims[0];
      this.loading = false;
    } else {
      this.getConnectedCompanyList(
        transactionClaims,
        currentClaimInput?.currentValue
      );
    }
  }

  /**
   * Fetch claims from the API or cache
   * @param transactionClaims any[]
   */
  fetchClaims(transactionClaims: any[], currentClaim?: any): void {
    const api = this.claimService.getClaims().subscribe((result: any) => {
      this.generateClaimList(result, transactionClaims, currentClaim);
    });
    this.pageApis.push(api);
  }

  /**
   *
   * @param result any[]
   * @param transactionClaims any[]
   */
  generateClaimList(
    result: any[],
    transactionClaims: any[],
    currentClaim?: any
  ): void {
    const selectedClaimsIds = transactionClaims?.map(m => m.claim_id);
    this.listOfClaims = this.claimService.formatClaimsData(
      result,
      this.companies
    );
    this.listOfClaims.forEach((claim: any) => {
      if (!selectedClaimsIds.includes(claim.id)) {
        this.availableClaims.push(claim);
      }
    });
    this.selectedClaims = transactionClaims;

    currentClaim
      ? (this.currentClaim = this.selectedClaims.find(
          claim => claim.id === currentClaim.id
        ))
      : (this.currentClaim = transactionClaims[0]);

    this.cdr.detectChanges();
    this.loading = false;
  }
  /**
   *
   * @param claim any
   * @param isEdit boolean
   */
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

  /**
   *
   * @param claim any
   */
  attachClaims(claim: any): void {
    const req = {
      transaction: this.transactionId,
      claims: [
        {
          claim: claim.id,
          verifier: claim.verified_by === 2 ? claim.verifier.id : null,
          inherited: false,
        },
      ],
    };
    const api = this.claimService.claimAttachApi(req).subscribe((res: any) => {
      if (res.success) {
        this.attachClaimData(claim);
      }
    });
    this.pageApis.push(api);
  }

  /**
   *
   * @param claim
   */
  attachClaimData(claim: any): void {
    this.loaderText = 'Saving claim data';
    const claimData: any[] = [];
    const fileList: any[] = [];
    claim.criteria.map((c: any) => {
      c.fields.map((f: any) => {
        // check if not file (type 3)
        if (f.type !== 3) {
          claimData.push({
            transaction: '',
            field: f.id,
            response: f.value,
          });
        }
        if (f.type === 3) {
          fileList.push(f.value);
        }
      });
    });

    if (claimData.length > 0) {
      const responseArray = [];
      const claimsLength = claimData.length;
      for (const claim of claimData) {
        claim.transaction = this.transactionId;
        const api = this.claimService.saveClaimData(claim).subscribe(
          (res: any) => {
            responseArray.push(res.success);
            if (responseArray.length === claimsLength) {
              this.attachClaimFiles(fileList);
            }
          },
          () => {
            this.processCompleted();
          }
        );
        this.pageApis.push(api);
      }
    } else if (fileList.length > 0) {
      this.attachClaimFiles(fileList);
    } else {
      this.processCompleted();
    }
  }

  attachClaimFiles(fileList: any[]): void {
    const resArr = [];
    if (fileList.length > 0) {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file.file);
        formData.append('field', file.field);
        formData.append('transaction', this.transactionId);
        formData.append('name', file.file.name);
        file.file = formData;
        const api = this.claimService.saveClaimData(formData).subscribe(
          (res: any) => {
            resArr.push(res.success);
            if (resArr.length === fileList.length) {
              this.processCompleted();
            }
          },
          () => {
            this.processCompleted();
          }
        );
        this.pageApis.push(api);
      }
    } else {
      this.processCompleted();
    }
  }

  processCompleted(): void {
    this.claimAttached.emit({
      reload: true,
      currentClaim: this.currentClaim,
    });
    this.loading = false;
  }

  showDetails(claim: any): void {
    if (claim.id !== this.currentClaim?.id) {
      this.currentClaim = claim;
    }
    this.showCheckStatusDiv = true;
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
  //       data: { claim: this.currentClaim, nodeId: this.transactionNumber },
  //       panelClass: 'custom-modalbox',
  //     });

  //     // dialogRef.afterClosed().subscribe(result => {
  //     //   this.loading = true;
  //     //   this.getConnectedCompanyList(this.attachedClaims);
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
      .checkStatus(
        this.currentClaim?.guardian_claims[0]?.id,
        this.transactionId
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.success) {
          // if (res?.data?.claim_status != this.currentClaim.status) {
          this.loading = true;
          this.claimAttached.emit({
            reload: true,
            currentClaim: this.currentClaim,
          });
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
