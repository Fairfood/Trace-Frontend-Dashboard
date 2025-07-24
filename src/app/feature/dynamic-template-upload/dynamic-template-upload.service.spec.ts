import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { environment } from 'src/environments/environment';
import { DynamicTemplateUploadService } from './dynamic-template-upload.service';
import { ACTION_TYPE, BASE_URL } from 'src/app/shared/configs/app.constants';
import { ConnectionService } from '../connections';
import { of } from 'rxjs';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';

describe('DynamicTemplateUploadService', () => {
  let service: DynamicTemplateUploadService;
  let translateSpy: jasmine.SpyObj<TranslateService>;
  let httpMock: HttpTestingController;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let routerServiceSpy: jasmine.SpyObj<RouterService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    routerServiceSpy = jasmine.createSpyObj('RouterService', ['navigateUrl']);
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    utilServiceSpy = jasmine.createSpyObj('UtilService', ['customSnackBar']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'retrieveStoredData',
    ]);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [
        {
          provide: TranslateService,
          useValue: translateSpy,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'sampleId' }), // provide any required params here
            },
          },
        },
        {
          provide: ConnectionService,
          useValue: {
            connectionList: () =>
              of({
                results: [
                  {
                    id: '1',
                    full_name: 'John Doe',
                    connection_details: { tier: 1 },
                  },
                ],
              }),
          },
        },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: RouterService, useValue: routerServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    });
    service = TestBed.inject(DynamicTemplateUploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('templateSchemaFields', () => {
    const mockType = 1; // Mock type for the template
    const mockResponse = {
      /* mock response for templateSchemaFields */
    };

    service.templateSchemaFields(mockType).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/bulk-uploads/data-sheet-templates/schema-fields/?type=${mockType}`
    );
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should call deleteUploadedFile and return data', () => {
    const dummyId = 'sampleId';
    const dummyResponse = {}; // Provide dummy response here if needed

    service.deleteUploadedFile(dummyId).subscribe(response => {
      expect(response).toEqual(dummyResponse);
    });

    const req = httpMock.expectOne(
      `${BASE_URL}/bulk-uploads/data-sheet-uploads/${dummyId}/`
    );
    expect(req.request.method).toBe('DELETE');

    req.flush(dummyResponse);
  });

  it('createNewTemplate', () => {
    const mockParams = {
      /* mock parameters for createNewTemplate */
    };
    const mockResponse = { data: {} };

    service.createNewTemplate(mockParams).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.baseUrl}/bulk-uploads/data-sheet-templates/`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockParams);

    req.flush(mockResponse);
  });

  it('should call listBuyers and return filtered buyers', () => {
    const dummyReqObj = {}; // Provide dummy request object if needed

    service.listBuyers(dummyReqObj).subscribe(buyers => {
      expect(buyers.length).toBe(1);
      expect(buyers[0].id).toBe('1');
      expect(buyers[0].name).toBe('John Doe');
      expect(buyers[0].tier).toBe(1);
    });
  });

  it('should map schema fields correctly', () => {
    const dummyRes = [
      { field: 'field1', required: true, field_type: 'text', label: 'Field 1' },
      {
        field: 'field2',
        required: false,
        field_type: 'number',
        label: 'Field 2',
      },
    ];
    const dummyFields = [
      { name: 'field1', column_pos: 0, column_name: 'Field 1' },
      { name: 'field2', column_pos: 1, column_name: 'Field 2' },
    ];

    const mappedFields = service.mapSchemaFields(dummyRes, dummyFields);

    expect(mappedFields.length).toBe(dummyRes.length);
    expect(mappedFields[0].id).toBe(dummyRes[0].field);
    expect(mappedFields[0].name).toBe(dummyRes[0].field);
    expect(mappedFields[0].required).toBe(dummyRes[0].required);
    expect(mappedFields[0].field_type).toBe(dummyRes[0].field_type);
    expect(mappedFields[0].selected).toBe(true); // Assuming field1 is mapped
    expect(mappedFields[0].columnIndex).toBe(dummyFields[0].column_pos);
    expect(mappedFields[0].columnName).toBe(dummyFields[0].column_name);
    expect(mappedFields[0].label).toBe(dummyRes[0].label);
  });

  it('should navigate to stock', () => {
    service.navigateToStock();
    expect(routerServiceSpy.navigateUrl).toHaveBeenCalledWith('/stock/listing');
  });

  it('should navigate to connections', () => {
    service.navigateToConnections();
    expect(routerServiceSpy.navigateUrl).toHaveBeenCalledWith('/connections');
  });

  it('should show error message', () => {
    const errorMessage = 'Error message';
    service.showError(errorMessage);
    expect(utilServiceSpy.customSnackBar).toHaveBeenCalledWith(
      errorMessage,
      ACTION_TYPE.FAILED
    );
  });

  it('should show success message', () => {
    const successMessage = 'Success message';
    service.showSuccess(successMessage);
    expect(utilServiceSpy.customSnackBar).toHaveBeenCalledWith(
      successMessage,
      ACTION_TYPE.SUCCESS
    );
  });
  describe('uploadObject', () => {
    it('should construct FormData object correctly for TRANSACTION type', () => {
      const form = {
        value: {
          unit: 'kg',
          product: 'Product A',
          currency: 'USD',
          templateId: '123',
        },
      };
      const template = new File([], 'test-template.xlsx');
      const type = 1;

      storageServiceSpy.retrieveStoredData.and.returnValue(
        'sampleSupplyChainId'
      );

      const formData = service.uploadObject(form, template, type);

      expect(formData.get('file')).toBe(template);
      expect(formData.get('template')).toBe('123');
      expect(formData.get('supply_chain')).toBe('sampleSupplyChainId');
      expect(formData.get('unit')).toBe('kg');
      expect(formData.get('currency')).toBe('USD');
      expect(formData.get('product')).toBe('Product A');
    });

    it('should construct FormData object correctly for non-TRANSACTION type', () => {
      const form = {
        value: {
          templateId: '123',
        },
      };
      const template = new File([], 'test-template.xlsx');
      const type = 0;
      storageServiceSpy.retrieveStoredData.and.returnValue(
        'sampleSupplyChainId'
      );

      const formData = service.uploadObject(form, template, type);

      expect(formData.get('file')).toBe(template);
      expect(formData.get('template')).toBe('123');
      expect(formData.get('supply_chain')).toBe('sampleSupplyChainId');
      expect(formData.get('unit')).toBeNull(); // Ensure unit is not appended for non-TRANSACTION type
      expect(formData.get('currency')).toBeNull(); // Ensure currency is not appended for non-TRANSACTION type
      expect(formData.get('product')).toBeNull(); // Ensure product is not appended for non-TRANSACTION type
    });
  });

  it('should construct FormData object correctly', () => {
    const template = new File([], 'test-template.xlsx');
    const type = 1; // Assuming type value

    storageServiceSpy.retrieveStoredData.and.returnValue('sampleSupplyChainId'); // Mock the storage service call

    const formData = service.customUploadObject(template, type);

    expect(formData.get('file')).toBe(template);
    expect(formData.get('name')).toBe('test-template.xlsx');
    expect(formData.get('type')).toBe('1');
    expect(formData.get('visibility')).toBe('2');
    expect(formData.get('supply_chain')).toBe('sampleSupplyChainId');
  });
});
