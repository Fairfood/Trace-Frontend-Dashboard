import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NewConnectionFarmerService } from './new-connection-farmer.service';
import { RouterService } from 'src/app/shared/service/router.service';
import { StorageService } from 'src/app/shared/service/storage.service';
import { ConnectionService } from '../connections.service';
import { of } from 'rxjs';

describe('NewConnectionFarmerService', () => {
  let service: NewConnectionFarmerService;
  let routerServiceSpy: jasmine.SpyObj<RouterService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let connectionServiceSpy: jasmine.SpyObj<ConnectionService>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'retrieveStoredData',
    ]);
    const routerSpy = jasmine.createSpyObj('RouterService', ['navigateUrl']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NewConnectionFarmerService,
        FormBuilder,
        {
          provide: RouterService,
          useValue: routerSpy,
        },
        {
          provide: StorageService,
          useValue: storageSpy,
        },
        {
          provide: ConnectionService,
          useValue: jasmine.createSpyObj('ConnectionService', [
            'setOperationList',
            'options',
            'connectionList',
          ]),
        },
      ],
    });
    service = TestBed.inject(NewConnectionFarmerService);
    routerServiceSpy = TestBed.inject(
      RouterService
    ) as jasmine.SpyObj<RouterService>;
    storageServiceSpy = TestBed.inject(
      StorageService
    ) as jasmine.SpyObj<StorageService>;
    connectionServiceSpy = TestBed.inject(
      ConnectionService
    ) as jasmine.SpyObj<ConnectionService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create basic details form', () => {
    const form: FormGroup = service.createBasicDetailsForm();
    expect(form).toBeTruthy();
  });

  it('should create misc form', () => {
    const form: FormGroup = service.createMiscForm();
    expect(form).toBeTruthy();
  });
  it('should create misc form', () => {
    const form: FormGroup = service.createAddressForm();
    expect(form).toBeTruthy();
  });

  it('should format request data correctly', () => {
    // Create sample input data
    const form1 = {
      firstName: 'John',
      lastName: 'Doe',
      primaryOperation: 'Operation',
      identificationNo: '12345',
    };

    const form2 = {
      email: 'john@example.com',
      dialCode: '+1',
      mobile: '1234567890',
      // Other form fields...
    };

    const form3 = {
      connectionOf: 'ConnectionOf',
      connectedTo: 'ConnectedTo',
      supplyChain: 'SupplyChain',
      relation: 'Relation',
    };

    // Expected output
    const expectedOutput: any = {
      connection_of: 'ConnectionOf',
      connected_to: 'ConnectedTo',
      supplier_for: [],
      supply_chain: 'SupplyChain',
      relation: 'Relation',
      primary_operation: 'Operation',
      identification_no: '12345',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: {
        dial_code: '+1',
        phone: '1234567890',
      },
    };

    // Call the method
    const result = service.formatRequestData(form1, form2, form3);

    // Assert the result
    expect(result).toEqual(expectedOutput);
  });

  it('should fetch node ID data correctly', () => {
    // Set up storage service spy
    storageServiceSpy.retrieveStoredData
      .withArgs('companyID')
      .and.returnValue('nodeIdValue');
    storageServiceSpy.retrieveStoredData
      .withArgs('supplyChainId')
      .and.returnValue('schainIdValue');
    storageServiceSpy.retrieveStoredData
      .withArgs('supplyChainName')
      .and.returnValue('chainNameValue');

    const expectedData = {
      nodeId: 'nodeIdValue',
      schainId: 'schainIdValue',
      chainName: 'chainNameValue',
    };

    // Call the method
    const result = service.fetchNodeId();

    expect(result).toEqual(expectedData);
  });

  it('should navigate to stock page when coming from stock', () => {
    // Set up incomingData with stock: true
    const incomingData = { stock: true };

    service.backButton(incomingData);

    expect(routerServiceSpy.navigateUrl).toHaveBeenCalledWith('/stock/receive');
  });

  it('should navigate to connections page when not coming from stock', () => {
    // Set up incomingData with stock: false
    const incomingData = { stock: false };

    service.backButton(incomingData);

    expect(routerServiceSpy.navigateUrl).toHaveBeenCalledWith('/connections');
  });

  it('should return mapped buyers data', (done: DoneFn) => {
    // Mock response from connectionList method
    const mockResponse = {
      results: [
        {
          id: 1,
          full_name: 'John Doe',
          connection_details: { tier: -2 },
        },
        {
          id: 2,
          full_name: 'Jane Smith',
          connection_details: { tier: 3 },
        },
      ],
      count: 2,
    };

    // Set up the connectionServiceSpy to return the mock response
    connectionServiceSpy.connectionList.and.returnValue(of(mockResponse));

    // Call the listBuyers method
    service.listBuyers({}).subscribe(data => {
      // Verify the returned data
      expect(data).toEqual({
        buyers: [
          { id: 1, name: 'John Doe', tier: 2 },
          { id: 2, name: 'Jane Smith', tier: 3 },
        ],
        count: 2,
      });
      done();
    });
  });
});
