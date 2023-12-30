/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { StockProcessService } from '../stock-process.service';
import {
  ButtonNav,
  StepValues,
  StockButtonState,
} from '../process-stock.config';
// components
import { RemoveDialogComponent } from '../remove-dialog/remove-dialog.component';
import { ClaimDetailComponent } from 'src/app/feature/claim/claim-detail';

@Component({
  selector: 'app-stock-claims',
  templateUrl: './stock-claims.component.html',
  styleUrls: ['./stock-claims.component.scss'],
})
export class StockClaimsComponent implements OnInit, OnDestroy {
  @Output() nextPage = new EventEmitter();
  availableClaims: any[] = [];
  selectedClaims: any[] = [];
  listOfClaims: any[] = [];
  pageApis: Subscription[] = [];
  nextButtonState: StockButtonState;

  constructor(
    private processService: StockProcessService,
    public dialog: MatDialog
  ) {
    this.nextButtonState = {
      action: 'init',
      disabled: false,
      currentStep: StepValues.CLAIMS,
      buttonText: 'Continue',
    };
  }

  ngOnInit(): void {
    const dataSub = this.processService
      .currentClaimState()
      .subscribe(result => {
        if (result) {
          this.selectedClaims = [];
          this.availableClaims = [];
          const { claimsList } = result;
          this.listOfClaims = JSON.parse(JSON.stringify(claimsList));
          claimsList.map((c: any) => {
            if (c.selected) {
              this.selectedClaims.push(c);
            } else {
              this.availableClaims.push(c);
            }
          });
        }
      });
    this.pageApis.push(dataSub);
  }

  addClaimToTransaction(claim: any, isEdit: boolean): void {
    const i = this.listOfClaims.findIndex(e => e.id === claim.id);
    const dialogData = JSON.parse(
      JSON.stringify({
        ...claim,
        isEdit,
      })
    );
    const dialogRef = this.dialog.open(ClaimDetailComponent, {
      disableClose: true,
      width: '45vw',
      maxWidth: '800px',
      height: 'auto',
      maxHeight: '700px',
      data: dialogData,
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listOfClaims[i] = result;
        this.processService.updateClaimState('claimsList', this.listOfClaims);
      }
    });
  }

  removeClaimFromTransaction($event: any, claim: any): void {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(RemoveDialogComponent, {
      disableClose: true,
      width: '600px',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data: claim,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeInheritClaim(result);
        claim.completed = false;
      } else {
        claim.selected = true;
      }
    });
  }

  // method to remove from inherited claim
  removeInheritClaim(id: string): void {
    const i = this.listOfClaims.findIndex(e => e.id === id);
    this.listOfClaims[i].inherited = false;
    this.listOfClaims[i].verifier = null;
    this.listOfClaims[i].selected = false;
    this.listOfClaims[i].verifierAssigned = false;
    this.listOfClaims[i].criteria.map((el: any) => {
      el.fields.map((obj: any) => {
        if (obj.file) {
          delete obj.file;
        }
        if (obj.value) {
          delete obj.value;
        }
      });
    });

    this.processService.updateClaimState('claimsList', this.listOfClaims);
  }

  navigationOutOfComponent(type: ButtonNav): void {
    this.nextPage.emit(type);
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
