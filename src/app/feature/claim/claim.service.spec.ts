/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ClaimService } from './claim.service';

describe('ClaimService', () => {
  let claimService: ClaimService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimService],
    });

    claimService = TestBed.inject(ClaimService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(claimService).toBeTruthy();
  });

  it('should set evidence flag to true if any criterion has fields', () => {
    const claim: any = {
      criteria: [{ fields: [{}] }, { fields: [] }],
    };
    claimService.setEvidenceFlag(claim.criteria, claim);
    expect(claim.evidence).toBe(true);
  });

  it('should set evidence flag to false if no criterion has fields', () => {
    const claim: any = {
      criteria: [{ fields: [] }, { fields: [] }],
    };
    claimService.setEvidenceFlag(claim.criteria, claim);
    expect(claim.evidence).toBe(false);
  });

  it('should process fields and set table flag', () => {
    const field: any = { type: 3 };
    claimService.processFields([field]);
    expect(field.table).toBe(true);
  });

  it('should process fields and set dropdown options', () => {
    const field: any = { type: 2, options: ['option1', 'option2'] };
    claimService.processFields([field]);
    expect(field.options).toEqual([
      { id: 'option1', name: 'option1' },
      { id: 'option2', name: 'option2' },
    ]);
  });

  // Similar tests for other helper methods

  it('should format claims data', () => {
    const companies = [
      { id: 1, name: 'Company 1' },
      { id: 2, name: 'Company 2' },
    ];
    const claimData: any = [
      {
        criteria: [{ fields: [] }],
        verified_by: 2,
        verifiers: [1],
        selected: true,
      },
      { criteria: [{ fields: [] }], verified_by: 1, verifiers: [2] },
    ];

    const formattedData = claimService.formatClaimsData(claimData, companies);

    expect(formattedData).toEqual([
      {
        criteria: [{ fields: [] }],
        verified_by: 2,
        verifiers: [1],
        selected: true,
        assignVerifier: true,
        verifierName: 'Company 1',
        evidence: false,
      },
      {
        criteria: [{ fields: [] }],
        verified_by: 1,
        verifiers: [2],
        selected: false,
        assignVerifier: false,
        verifierName: 'Company 2',
        evidence: false,
      },
    ]);
  });
});
