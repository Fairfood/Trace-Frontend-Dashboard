import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { ExportService } from './export.service';

describe('ExportService', () => {
  let service: ExportService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, HttpClientModule],
      providers: [ExportService],
    });
    service = TestBed.inject(ExportService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make a POST request for createExport', () => {
    const mockParams = {}; // Provide your mock parameters here
    const expectedResult = {}; // Provide your expected result here

    service.createExport(mockParams).subscribe(result => {
      expect(result).toEqual(expectedResult);
    });

    const req = httpTestingController.expectOne(request =>
      request.url.endsWith('/reports/exports/')
    );
    expect(req.request.method).toBe('POST');
    req.flush(expectedResult);
  });

  // Write similar tests for other methods (pingAPI, cancelExport, reportListing)

  // You can also test the Subject behavior here
  it('should publish to exportDataInit$ when initExportData is called', () => {
    const mockParams = {}; // Provide your mock parameters here

    service.initExportData(mockParams);

    service.exportDataInit$.subscribe(data => {
      expect(data).toEqual(mockParams);
    });
  });
});
