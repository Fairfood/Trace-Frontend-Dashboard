/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { ListingService } from './listing.service';
import { ListingStoreService } from './listing-store.service';
import { ClaimService } from '../../claim';
import { ExportService, StorageService } from 'src/app/shared/service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  IFilterParams,
  IListingAPIResponse,
  IStockTableRow,
} from './listing.model';

class MockStorageService {
  retrieveStoredData() {
    return 'mockSupplyChainId';
  }
}

const mockAppliedFilter: IFilterParams = {
  selectedProduct: 'Product1',
  selectedClaim: 'Claim1',
  selectedSupplier: 'Supplier1',
  quantityFrom: '10',
  quantityTo: '100',
  quantityIs: '50',
  dateOn: '2024-02-14',
  dateTo: '2024-02-28',
  dateFrom: '2024-01-01',
  searchString: 'Search',
  createdFrom: 'Supplier2',
  sortBy: 'asc',
  orderBy: 'name',
  limit: 10,
  offset: 0,
  archived: false,
};

describe('ListingService', () => {
  let service: ListingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ListingStoreService,
        ClaimService,
        ExportService,
        StorageService,
        {
          provide: StorageService,
          useClass: MockStorageService,
        },
      ],
    });
    service = TestBed.inject(ListingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format filter parameters correctly', () => {
    // Arrange

    const expectedFormattedParams = {
      supply_chain: 'mockSupplyChainId',
      product: 'Product1',
      claim: 'Claim1',
      supplier: 'Supplier1',
      date_from: '2024-01-01',
      date_to: '2024-02-28',
      date_on: '2024-02-14',
      quantity_from: '10',
      quantity_to: '100',
      quantity_is: '50',
      created_from: 'Supplier2',
      search: 'Search',
      sort_by: 'asc',
      order_by: 'name',
    };

    // Act
    const formattedParams = service.formatFilterParams(mockAppliedFilter);

    // Assert
    expect(formattedParams).toEqual(expectedFormattedParams);
  });

  it('should calculate the total quantity needed from selected items', () => {
    // Arrange
    const selectedItems = [
      { quantityNeeded: 10 },
      { quantityNeeded: 20 },
      { quantityNeeded: 30 },
    ];

    const expectedTotal = '60.00';

    // Act
    const totalQuantity = service.getSelectedQuantity(selectedItems);

    // Assert
    expect(totalQuantity).toEqual(expectedTotal);
  });

  it('should return 0 if no items are selected', () => {
    // Arrange
    const selectedItems: any[] = [];

    // Act
    const totalQuantity = service.getSelectedQuantity(selectedItems);

    // Assert
    expect(totalQuantity).toEqual('0.00');
  });

  it('should merge changed batches into current selected batches', () => {
    // Arrange
    const currentSelectedBatches = [
      { batch: 'Batch1', quantity: 10 },
      { batch: 'Batch2', quantity: 20 },
      { batch: 'Batch3', quantity: 30 },
    ];

    const changedBatches = [
      { batch: 'Batch2', quantity: 25 },
      { batch: 'Batch3', quantity: 35 },
      { batch: 'Batch4', quantity: 40 },
    ];

    const expectedMergedBatches = [
      { batch: 'Batch1', quantity: 10 },
      { batch: 'Batch2', quantity: 25 },
      { batch: 'Batch3', quantity: 35 },
    ];

    // Act
    const mergedBatches = service.mergeChangedBatches(
      currentSelectedBatches,
      changedBatches
    );

    // Assert
    expect(mergedBatches).toEqual(expectedMergedBatches);
  });

  it('should not modify current selected batches if there are no changes', () => {
    // Arrange
    const currentSelectedBatches = [
      { batch: 'Batch1', quantity: 10 },
      { batch: 'Batch2', quantity: 20 },
      { batch: 'Batch3', quantity: 30 },
    ];

    const changedBatches: any = [];

    // Act
    const mergedBatches = service.mergeChangedBatches(
      currentSelectedBatches,
      changedBatches
    );

    // Assert
    expect(mergedBatches).toEqual(currentSelectedBatches);
  });

  it('should calculate the total quantity from the array of batches', () => {
    // Arrange
    const batches = [
      { batch: 'Batch1', quantity: 10 },
      { batch: 'Batch2', quantity: 20 },
      { batch: 'Batch3', quantity: 30 },
    ];

    const expectedTotal = (10 + 20 + 30).toFixed(2);

    // Act
    const totalQuantity = service.computeSelectedQuantity(batches);

    // Assert
    expect(totalQuantity).toEqual(expectedTotal);
  });

  it('should return 0.00 if no batches are provided', () => {
    // Arrange
    const batches: any = [];

    // Act
    const totalQuantity = service.computeSelectedQuantity(batches);

    // Assert
    expect(totalQuantity).toEqual('0.00');
  });

  it('should construct the partial URL based on filter parameters', () => {
    const expectedPartialUrl = `&product=Product1&claim=Claim1&supplier=Supplier1&date_from=2024-01-01&date_to=2024-02-28&date_on=2024-02-14&quantity_from=10&quantity_to=100&quantity_is=50&created_from=Supplier2&search=Search&archived=false&sort_by=asc&order_by=name&supply_chain=mockSupplyChainId`;

    // Act
    const partialUrl = service.constructPartialUrls(mockAppliedFilter);

    // Assert
    expect(partialUrl).toEqual(expectedPartialUrl);
  });

  it('should format the data for listing in the table', () => {
    // Arrange
    const mockApiResponse: Partial<IListingAPIResponse> = {
      results: [
        {
          number: 1,
          id: '123',
          name: 'Item 1',
          product: { id: 'P1', name: 'Product 1' },
          created_on: '2024-02-14',
          created_from: 'Supplier 1',
          supplier: { name: 'Supplier 1' },
          current_quantity: 50,
          buyer_ref_number: 'REF123',
          source_transaction: 'TRANSACTION123',
        },
        {
          number: 2,
          id: '456',
          name: 'Item 2',
          product: { id: 'P2', name: 'Product 2' },
          created_on: '2024-02-15',
          created_from: 'Supplier 2',
          supplier: { name: 'Supplier 2' },
          current_quantity: 100,
          buyer_ref_number: 'REF456',
          source_transaction: 'TRANSACTION456',
        },
      ],
      count: 2,
    };

    const expectedFormattedData: IListingAPIResponse = {
      results: [
        {
          stockId: 1,
          itemId: '123',
          name: 'Item 1',
          product: 'Product 1',
          created: '2024-02-14',
          from: 'Supplier 1',
          batch: 'Supplier 1',
          quantityAvailable: 50,
          quantityNeeded: 50,
          select: false,
          option: '',
          referenceNo: 'REF123',
          productId: 'P1',
          isExternal: false,
          transactionId: 'TRANSACTION123',
        },
        {
          stockId: 2,
          itemId: '456',
          name: 'Item 2',
          product: 'Product 2',
          created: '2024-02-15',
          from: 'Supplier 2',
          batch: 'Supplier 2',
          quantityAvailable: 100,
          quantityNeeded: 100,
          select: false,
          option: '',
          referenceNo: 'REF456',
          productId: 'P2',
          isExternal: false,
          transactionId: 'TRANSACTION456',
        },
      ],
      count: 2,
    };

    // Act
    const formattedData = service.formatDataForListing(mockApiResponse);

    // Assert
    expect(formattedData).toEqual(expectedFormattedData);
  });

  it('should remove duplicates based on itemId property', () => {
    // Arrange
    const mockArray: IStockTableRow[] = [
      {
        stockId: 1,
        itemId: '123',
        name: 'Item 1',
        product: 'Product 1',
        created: '12/03/2006',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 50,
        quantityNeeded: 50,
        select: false,
        option: '',
        referenceNo: 'REF123',
        productId: 'P1',
        isExternal: false,
        transactionId: 'TRANSACTION123',
      },
      {
        stockId: 2,
        itemId: '456',
        name: 'Item 2',
        product: 'Product 2',
        created: '12/03/2006',
        from: 'Supplier 2',
        batch: 'Batch 2',
        quantityAvailable: 100,
        quantityNeeded: 100,
        select: false,
        option: '',
        referenceNo: 'REF456',
        productId: 'P2',
        isExternal: false,
        transactionId: 'TRANSACTION456',
      },
      {
        stockId: 3,
        itemId: '123',
        name: 'Item 1', // Duplicate of itemId '123'
        product: 'Product 1',
        created: '12/03/2006',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 50,
        quantityNeeded: 50,
        select: false,
        option: '',
        referenceNo: 'REF123',
        productId: 'P1',
        isExternal: false,
        transactionId: 'TRANSACTION123',
      },
    ];

    const expectedArray: IStockTableRow[] = [
      {
        stockId: 1,
        itemId: '123',
        name: 'Item 1',
        product: 'Product 1',
        created: '12/03/2006',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 50,
        quantityNeeded: 50,
        select: false,
        option: '',
        referenceNo: 'REF123',
        productId: 'P1',
        isExternal: false,
        transactionId: 'TRANSACTION123',
      },
      {
        stockId: 2,
        itemId: '456',
        name: 'Item 2',
        product: 'Product 2',
        created: '12/03/2006',
        from: 'Supplier 2',
        batch: 'Batch 2',
        quantityAvailable: 100,
        quantityNeeded: 100,
        select: false,
        option: '',
        referenceNo: 'REF456',
        productId: 'P2',
        isExternal: false,
        transactionId: 'TRANSACTION456',
      },
    ];

    // Act
    const uniqueArray = service.removeDuplicates(mockArray);

    // Assert
    expect(uniqueArray).toEqual(expectedArray);
  });
});
