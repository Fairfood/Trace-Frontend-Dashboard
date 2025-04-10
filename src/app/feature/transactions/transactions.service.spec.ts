import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  TransactionsService,
  formatTableProduct,
  stockIdFormater,
} from './transactions.service';
import { ExportService } from 'src/app/shared/service/export.service';
import { StorageService } from 'src/app/shared/service';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { ITransactionData } from './transactions.model';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TransactionsService, ExportService, StorageService],
    });
    service = TestBed.inject(TransactionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format table product correctly when array has 1 item', () => {
    const productArray = [{ name: 'Product A', quantity: 5 }];
    const result = formatTableProduct(productArray);

    expect(result).toEqual('Product A(5.00kg)');
  });

  it('should format table product correctly when array has 2 items', () => {
    const productArray = [
      { name: 'Product A', quantity: 5 },
      { name: 'Product B', quantity: 7 },
    ];
    const result = formatTableProduct(productArray);

    expect(result).toEqual('Product A(5.00kg), Product B(7.00kg)');
  });
  it('should format table product correctly when array has more than 2 items', () => {
    const productArray = [
      { name: 'Product A', quantity: 5 },
      { name: 'Product B', quantity: 7 },
      { name: 'Product C', quantity: 3 },
      // Add more items if needed
    ];
    const result = formatTableProduct(productArray);

    expect(result).toEqual('Product A(5.00kg), Product B(7.00kg) and 1 more');
  });

  it('should format table product correctly when array is empty', () => {
    const productArray: Partial<ICommonObj>[] = [];
    const result = formatTableProduct(productArray);

    expect(result).toEqual('');
  });

  it('should format stock IDs correctly when array has 1 item', () => {
    const productArray = [{ number: 'ID123' }];
    const result = stockIdFormater(productArray);

    expect(result).toEqual('ID123');
  });

  it('should format stock IDs correctly when array has 2 items', () => {
    const productArray = [{ number: 'ID123' }, { number: 'ID456' }];
    const result = stockIdFormater(productArray);

    expect(result).toEqual('ID123, ID456');
  });

  it('should format stock IDs correctly when array has more than 2 items', () => {
    const productArray = [
      { number: 'ID123' },
      { number: 'ID456' },
      { number: 'ID789' },
      // Add more items if needed
    ];
    const result = stockIdFormater(productArray);

    expect(result).toEqual('ID123, ID456 and 1 more');
  });

  it('should format stock IDs correctly when array is empty', () => {
    const productArray: any[] = [];
    const result = stockIdFormater(productArray);

    expect(result).toEqual('');
  });

  it('should configure internal transaction data for stockAction 1', () => {
    const mockResults = [
      {
        number: 1,
        id: 'ID123',
        type: 'Merge',
        date: '2022-01-01',
        creator: { first_name: 'John', last_name: 'Doe' },
        source_batches: [{ name: 'ProductA', quantity: 5 }],
        source_quantity: 5,
        destination_batches: [{ name: 'ProductB', quantity: 3 }],
        destination_quantity: 3,
      },
    ];
    const stockAction = 1;
    const result = service['configureInternalTransaction'](
      mockResults,
      stockAction
    );

    expect(result).toEqual([
      {
        id: 1,
        itemId: 'ID123',
        type: 'Merge',
        created: '2022-01-01',
        creator: 'John Doe',
        sourceProduct: 'ProductA(5.00kg)',
        destinationProduct: 'ProductB(3.00kg)',
        sourceQuantity: '5.00',
      },
    ]);
  });

  it('should handle undefined results', () => {
    const result = service.configureTableData(undefined);
    expect(result).toEqual(undefined);
  });

  it('should handle empty results array', () => {
    const result = service.configureTableData([]);
    expect(result).toEqual([]);
  });

  it('should export stock action data correctly for stockAction 1', () => {
    const mockParams = {
      dateFrom: '2022-01-01',
      dateTo: '2022-01-31',
      dateOn: '2022-01-15',
      quantityFrom: 5,
      quantityTo: 10,
      searchString: 'search',
      orderBy: 'date',
      sortBy: 'asc',
      selectedSourceProduct: 'ProductA',
      selectedDestinationProduct: 'ProductB',
    };

    const mockStockAction = 1;
    localStorage.setItem('supplyChainId', 'supplyChainId');

    const result = service.stockActionExport(mockParams, mockStockAction);

    const expectedExportData = {
      supply_chain: 'supplyChainId', // Replace with the actual supplyChainId
      destination_product: 'ProductB',
      source_product: 'ProductA',
      date_from: '2022-01-01',
      date_to: '2022-01-31',
      date_on: '2022-01-15',
      quantity_from: 5,
      quantity_to: 10,
      search: 'search',
      type: 1,
      sort_by: 'asc',
      order_by: 'date',
    };

    expect(result).toEqual(expectedExportData);
  });
});
