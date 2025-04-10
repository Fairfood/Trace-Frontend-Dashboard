/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ClaimService } from './claim.service';
import { StorageService } from 'src/app/shared/service';
import { IClaim, IClaimField } from './claim.model';

describe('ClaimService', () => {
  let claimService: ClaimService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ClaimService,
        {
          provide: StorageService,
          useClass: StorageStub,
        },
      ],
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

  it('should return supply chain data', () => {
    expect(claimService.supplyChainData()).toBe('mockSupplyChainId');
  });

  it('should format claim data correctly', () => {
    const mockCompanies = [
      { id: '1', name: 'Company A' },
      { id: '2', name: 'Company B' },
    ];

    const formattedClaims = claimService.formatClaimsData(
      mockClaimData,
      mockCompanies
    );

    expect(formattedClaims.length).toEqual(1);
    expect(formattedClaims[0].criteria.length).toEqual(1);
    expect(formattedClaims[0].evidence).toBeTruthy();
    expect(formattedClaims[0].assignVerifier).toBeFalsy();
    expect(formattedClaims[0].selected).toBeFalsy();
  });

  describe('processFields', () => {
    it('should set table flag for fields of type 3', () => {
      // Arrange
      const fields: IClaimField[] = [
        {
          type: 1,
          description: '',
          multiple_options: false,
          options: [],
          title: '',
          id: '123',
        }, // Field of type 1
        {
          type: 2,
          description: '',
          multiple_options: false,
          options: [],
          title: '',
          id: '124',
        }, // Field of type 2
        {
          type: 3,
          description: '',
          multiple_options: false,
          options: [],
          title: '',
          id: '125',
        }, // Field of type 3
      ];

      // Act
      claimService.processFields(fields);

      // Assert
      expect(fields[0].table).toBeFalsy(); // Field of type 1 should not have table flag
      expect(fields[1].table).toBeFalsy(); // Field of type 2 should not have table flag
      expect(fields[2].table).toBeTruthy(); // Field of type 3 should have table flag
    });

    it('should call processOptions for fields of type 2', () => {
      // Arrange
      const fields: IClaimField[] = [
        {
          type: 1,
          description: '',
          multiple_options: false,
          options: [],
          title: '',
          id: '123',
        }, // Field of type 1
        {
          type: 2,
          description: '',
          multiple_options: false,
          options: [],
          title: '',
          id: '124',
        }, // Field of type 2
        {
          type: 3,
          description: '',
          multiple_options: false,
          options: [],
          title: '',
          id: '125',
        }, // Field of type 3
      ];
      spyOn(claimService, 'processOptions');

      // Act
      claimService.processFields(fields);

      // Assert
      expect(claimService.processOptions).toHaveBeenCalledTimes(1); // processOptions should be called once for field of type 2
      expect(claimService.processOptions).toHaveBeenCalledWith(fields[1]); // processOptions should be called with the field of type 2
    });
  });
});

class StorageStub {
  retrieveStoredData(key: string): string {
    console.log(key);
    return 'mockSupplyChainId';
  }
}

const mockClaimData: IClaim[] = [
  {
    id: '1',
    name: 'Claim 1',
    criteria: [
      {
        description: '0',
        is_mandatory: false,
        verification_type: 0,
        verifier: null,
        name: 'Field 1',
        id: '1',
        fields: [
          {
            type: 1,
            description: 'Field 1',
            multiple_options: false,
            title: 'Field 1 Title',
            options: [],
            id: '29138',
          },
        ],
      },
    ],
    active: true,
    description_basic: 'string',
    description_full: 'string',
    image: 'string',
    inheritable: true,
    proportional: true,
    removable: true,
    type: 1,
    verified_by: 1,
    verifiers: [],
  },
];
