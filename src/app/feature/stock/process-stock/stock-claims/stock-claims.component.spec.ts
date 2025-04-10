import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StockClaimsComponent } from './stock-claims.component';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
import { StockProcessService } from '../stock-process.service';
import { ClaimDetailComponent } from 'src/app/feature/claim/claim-detail';
import { RemoveDialogComponent } from '../remove-dialog';
import { ButtonsComponent } from 'fairfood-utils';
import { SummaryCardComponent } from '../summary-card';
import { StockActionButtonComponent } from '../stock-action-button';

class MockMatDialog {
  open() {
    return {
      afterClosed: () => of({}),
    };
  }
}

describe('StockClaimsComponent', () => {
  let component: StockClaimsComponent;
  let fixture: ComponentFixture<StockClaimsComponent>;
  let dialog: MatDialog;
  let processServiceSpy: jasmine.SpyObj<StockProcessService>;

  beforeEach(async () => {
    processServiceSpy = jasmine.createSpyObj('StockProcessService', [
      'currentClaimState',
      'updateClaimState',
      'getSummaryData',
      'fetchCurrentUrl',
    ]);

    processServiceSpy.currentClaimState.and.returnValue(
      of({
        claimsList: [],
        companies: [],
      })
    );
    await TestBed.configureTestingModule({
      imports: [
        StockClaimsComponent,
        ClaimDetailComponent,
        RemoveDialogComponent,
        ButtonsComponent,
        SummaryCardComponent,
        StockActionButtonComponent,
        CommonModule,
        MatDialogModule,
        MatIconModule,
      ],
      providers: [
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: StockProcessService, useValue: processServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockClaimsComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component and subscribe to data stream', () => {
    component.ngOnInit();

    expect(component.listOfClaims.length).toBe(0);
  });

  it('should remove inherit claim and update claims list', () => {
    const claimId = '1';
    component.listOfClaims = [
      {
        id: '1',
        inherited: true,
        verifier: 'John',
        selected: true,
        verifierAssigned: true,
        criteria: [{ fields: [{ file: 'file1', value: 'value1' }] }],
      },
      {
        id: '2',
        inherited: true,
        verifier: 'Jane',
        selected: true,
        verifierAssigned: true,
        criteria: [{ fields: [{ file: 'file2', value: 'value2' }] }],
      },
    ];

    component.removeInheritClaim(claimId);

    expect(component.listOfClaims[0].inherited).toBe(false);
    expect(component.listOfClaims[0].verifier).toBe(null);
    expect(component.listOfClaims[0].selected).toBe(false);
    expect(component.listOfClaims[0].verifierAssigned).toBe(false);
    expect(
      component.listOfClaims[0].criteria[0].fields[0].file
    ).toBeUndefined();
    expect(
      component.listOfClaims[0].criteria[0].fields[0].value
    ).toBeUndefined();
    expect(component.processService.updateClaimState).toHaveBeenCalledWith(
      'claimsList',
      component.listOfClaims
    );
  });

  it('should emit event when navigating out of component', () => {
    spyOn(component.nextPage, 'emit');

    component.navigationOutOfComponent('next');

    expect(component.nextPage.emit).toHaveBeenCalledWith('next');
  });

  afterEach(() => {
    fixture.destroy();
  });
});
