import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrClaimsComponent } from './tr-claims.component';
import { MatDialog } from '@angular/material/dialog';
import { ClaimService } from '../../claim/claim.service';
import { UtilService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { of } from 'rxjs';
import { SimpleChanges } from '@angular/core';

describe('TrClaimsComponent', () => {
  let component: TrClaimsComponent;
  let fixture: ComponentFixture<TrClaimsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrClaimsComponent],
      providers: [
        { provide: MatDialog, useClass: MatDialogStub },
        { provide: ClaimService, useClass: ClaimServiceStub },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: GlobalStoreService, useClass: GlobalStoreServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should set selectedClaims and currentClaim when isReversal is true', () => {
      const changes: SimpleChanges = {
        attachedClaims: {
          previousValue: null,
          currentValue: [{ claim_id: 1 }, { claim_id: 2 }],
          firstChange: true,
          isFirstChange: () => true,
        },
      };
      component.isReversal = true;
      component.ngOnChanges(changes);
      expect(component.selectedClaims).toEqual(
        changes.attachedClaims.currentValue
      );
      expect(component.currentClaim).toEqual(
        changes.attachedClaims.currentValue[0]
      );
      expect(component.loading).toBe(false);
    });

    it('should call getConnectedCompanyList when isReversal is false', () => {
      const changes: SimpleChanges = {
        attachedClaims: {
          previousValue: null,
          currentValue: [{ claim_id: 1 }, { claim_id: 2 }],
          firstChange: true,
          isFirstChange: () => true,
        },
      };
      component.isReversal = false;
      spyOn(component, 'getConnectedCompanyList');
      component.ngOnChanges(changes);
      expect(component.getConnectedCompanyList).toHaveBeenCalledWith(
        changes.attachedClaims.currentValue
      );
    });
  });
});

class MatDialogStub {
  open() {
    return { afterClosed: () => of(true) };
  }
}

class ClaimServiceStub {
  getClaims() {
    return of([]);
  }

  formatClaimsData(result: any[], companies: any[]): any[] {
    return [];
  }

  claimAttachApi(req: any) {
    return of({ success: true });
  }

  saveClaimData(claim: any) {
    return of({ success: true });
  }
}

class UtilServiceStub {
  downloadReceipt(fileUrl: string) {
    return of({});
  }
}

class GlobalStoreServiceStub {
  connectedCompanies$ = of([]);
}
