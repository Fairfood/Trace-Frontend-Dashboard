import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { StockService } from './stock.service';
import { StorageService } from 'src/app/shared/service';
describe('StockService', () => {
  let service: StockService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StockService,
        { provide: StorageService, useClass: StorageStub },
      ],
    });
    service = TestBed.inject(StockService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return supply chain data', () => {
    expect(service.supplyChainData()).toBe('mockSupplyChainId');
  });
});

class StorageStub {
  retrieveStoredData(key: string): string {
    console.log(key);
    return 'mockSupplyChainId';
  }
}
