import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TransactionReportService } from './transaction-report.service';
import { BASE_URL } from 'src/app/shared/configs/app.constants';

describe('TransactionReportService', () => {
  let service: TransactionReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionReportService],
    });

    service = TestBed.inject(TransactionReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get CI theme', () => {
    const theme = service.getCiTheme();
    expect(theme).toBeDefined();
  });

  it('should get internal transaction detail', () => {
    const transaction = 'external';
    const id = '123';
    const mockResponse = { id: id, data: 'transactionData' };

    service
      .getInternalTransactionDetail(transaction, id)
      .subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(
      `${BASE_URL}/transactions/${transaction}/${id}/`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should generate QR code', () => {
    const batchId = '123';
    const transactionData = {
      consumer_interface_url: 'url',
      transaction_type: 1,
      type: 2,
      destination_batches: [
        {
          id: 'test',
        },
      ],
    };
    const qrCodeData = service.generateQrcode(batchId, transactionData);
    expect(qrCodeData).toBeDefined();
  });

  it('should generate batch text for external transaction', () => {
    const transaction = 'external';
    const type = 1;
    const batchText = service.generateBatchText(transaction, type);
    expect(batchText).toBeDefined();
  });

  it('should generate batch text for internal transaction', () => {
    const transaction = 'internal';
    const type = 2;
    const batchText = service.generateBatchText(transaction, type);
    expect(batchText).toBeDefined();
  });

  it('should fetch batch info', () => {
    const batchId = '123';
    const mockResponse = { id: batchId, data: 'batchData' };

    service.fetchBatchInfo(batchId).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${BASE_URL}/products/batches/batch-farmers/?batch=${batchId}&limit=3&offset=0`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get transaction attachments', () => {
    const transactionId = '123';
    const limit = 10;
    const offset = 0;
    const mockResponse = { id: transactionId, data: 'attachmentsData' };

    service
      .getTransactionAttachments(transactionId, limit, offset)
      .subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

    const req = httpMock.expectOne(
      `${BASE_URL}/transactions/transaction-attachments/?transaction=${transactionId}&limit=${limit}&offset=${offset}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should add attachments', () => {
    const transactionId = '123';
    const formData = new FormData();
    const mockResponse = { success: true };

    service.addAttachements(transactionId, formData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${BASE_URL}/transactions/transaction-attachments/?transaction=${transactionId}`
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
