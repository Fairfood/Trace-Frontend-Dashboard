import { TestBed } from '@angular/core/testing';
import { StockTableService } from './stock-table.service';
import { ListingStoreService } from '..';
import { UtilService, RouterService } from 'src/app/shared/service';
import { IBatches, IStockTableRow } from '../listing.model';

describe('StockTableService', () => {
  let service: StockTableService;
  let listingStoreServiceSpy: jasmine.SpyObj<ListingStoreService>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let routerServiceSpy: jasmine.SpyObj<RouterService>;

  beforeEach(() => {
    const listingStoreSpy = jasmine.createSpyObj('ListingStoreService', [
      'updateStateProp',
      'getBatches',
      'getChangedBatches',
      'getTableProps',
      'getSelectedStocks',
    ]);
    const utilSpy = jasmine.createSpyObj('UtilService', ['customSnackBar']);
    const routerSpy = jasmine.createSpyObj('RouterService', ['navigateArray']);

    TestBed.configureTestingModule({
      providers: [
        StockTableService,
        { provide: ListingStoreService, useValue: listingStoreSpy },
        { provide: UtilService, useValue: utilSpy },
        { provide: RouterService, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(StockTableService);
    listingStoreServiceSpy = TestBed.inject(
      ListingStoreService
    ) as jasmine.SpyObj<ListingStoreService>;
    utilServiceSpy = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
    routerServiceSpy = TestBed.inject(
      RouterService
    ) as jasmine.SpyObj<RouterService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('viewDetails', () => {
    it('viewDetails should navigate to tr report with external param when "from" keyword is purchased', () => {
      const data = { from: 'purchased', transactionId: '123' };
      spyOn(service, 'navigateToReport');
      service.viewDetails(data);

      expect(service.navigateToReport).toHaveBeenCalledWith(data);
    });
    it('viewDetails should show snackbar when item is external', () => {
      const data = { isExternal: true };
      service.viewDetails(data);
      expect(utilServiceSpy.customSnackBar).toHaveBeenCalledWith(
        'This is an external source. Not in trace!',
        jasmine.anything()
      );
    });
  });

  describe('navigateToReport', () => {
    it('should navigate to tr report with external param when "from" keyword is purchased', () => {
      const data = { from: 'purchased', transactionId: '123' };
      service.viewDetails(data);
      expect(routerServiceSpy.navigateArray).toHaveBeenCalledWith([
        'transaction-report',
        'external',
        '123',
      ]);
    });
    it('should navigate to tr report with external param when "from" keyword is returned', () => {
      const data = { from: 'purchased', transactionId: '123' };
      service.viewDetails(data);
      expect(routerServiceSpy.navigateArray).toHaveBeenCalledWith([
        'transaction-report',
        'external',
        '123',
      ]);
    });

    it('should navigate to tr report with internal param when "from" keyword is not returned or purchased', () => {
      const data = { from: 'merged', transactionId: '123' };
      service.viewDetails(data);
      expect(routerServiceSpy.navigateArray).toHaveBeenCalledWith([
        'transaction-report',
        'internal',
        '123',
      ]);
    });
  });

  it('should return "number" for column "number"', () => {
    const column = 'number';
    const result = service.sortDataSetter(column);
    expect(result).toEqual('number');
  });

  it('should return "product.name" for column "product.name"', () => {
    const column = 'product.name';
    const result = service.sortDataSetter(column);
    expect(result).toEqual('product.name');
  });

  it('should return "created_on" for column "created_on"', () => {
    const column = 'created_on';
    const result = service.sortDataSetter(column);
    expect(result).toEqual('created_on');
  });

  it('should return "initial_quantity" for column "initial_quantity"', () => {
    const column = 'initial_quantity';
    const result = service.sortDataSetter(column);
    expect(result).toEqual('initial_quantity');
  });

  it('should return "created_on" for unknown column', () => {
    const column = 'unknown';
    const result = service.sortDataSetter(column);
    expect(result).toEqual('created_on');
  });

  it('should set select to true and quantityNeeded from selectedStocks', () => {
    const data: IStockTableRow[] = [
      {
        stockId: 1,
        itemId: '1',
        name: 'Item 1',
        product: 'Product A',
        created: '10/04/2022',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 10,
        quantityNeeded: 0,
        select: false,
        option: '',
        referenceNo: 'REF001',
        productId: 'PID001',
        isExternal: false,
        transactionId: 'TID001',
      },
      // Add more data as needed
    ];

    const selectedStocks: IStockTableRow[] = [
      {
        stockId: 1,
        itemId: '1',
        name: 'Item 1',
        product: 'Product A',
        created: '10/04/2022',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 10,
        quantityNeeded: 5, // Updated quantity
        select: true, // Updated select flag
        option: '',
        referenceNo: 'REF001',
        productId: 'PID001',
        isExternal: false,
        transactionId: 'TID001',
      },
      // Add more selectedStocks as needed
    ];

    const expectedResult: IStockTableRow[] = [
      {
        stockId: 1,
        itemId: '1',
        name: 'Item 1',
        product: 'Product A',
        created: '10/04/2022',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 10,
        quantityNeeded: 5, // Updated quantity
        select: true, // Updated select flag
        option: '',
        referenceNo: 'REF001',
        productId: 'PID001',
        isExternal: false,
        transactionId: 'TID001',
      },
      // Add more expected results as needed
    ];

    const result = service.preSelectStocks(data, selectedStocks);
    expect(result).toEqual(expectedResult);
  });

  it('should set select to false if item is not in selectedStocks', () => {
    const data: IStockTableRow[] = [
      {
        stockId: 1,
        itemId: '1',
        name: 'Item 1',
        product: 'Product A',
        created: '12/11/2023',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 10,
        quantityNeeded: 0,
        select: true, // Select is true initially
        option: '',
        referenceNo: 'REF001',
        productId: 'PID001',
        isExternal: false,
        transactionId: 'TID001',
      },
      // Add more data as needed
    ];

    const selectedStocks: IStockTableRow[] = [];

    const expectedResult: IStockTableRow[] = [
      {
        stockId: 1,
        itemId: '1',
        name: 'Item 1',
        product: 'Product A',
        created: '12/11/2023',
        from: 'Supplier 1',
        batch: 'Batch 1',
        quantityAvailable: 10,
        quantityNeeded: 0,
        select: false, // Select is false now
        option: '',
        referenceNo: 'REF001',
        productId: 'PID001',
        isExternal: false,
        transactionId: 'TID001',
      },
      // Add more expected results as needed
    ];

    const result = service.preSelectStocks(data, selectedStocks);
    expect(result).toEqual(expectedResult);
  });

  describe('modifyBatchArray', () => {
    it('should remove the batch if it already exists in the current batches', () => {
      // Arrange
      const batch: IBatches = { batch: '1', quantity: 5 };
      listingStoreServiceSpy.getBatches.and.returnValue([
        { batch: '1', quantity: 3 },
      ]);

      // Act
      service.modifyBatchArray(batch);

      // Assert
      expect(listingStoreServiceSpy.updateStateProp).toHaveBeenCalledWith(
        'batches',
        []
      );
    });

    it('should add the batch if it does not exist in the current batches', () => {
      // Arrange
      const batch: IBatches = { batch: '2', quantity: 5 };
      listingStoreServiceSpy.getBatches.and.returnValue([
        { batch: '1', quantity: 3 },
      ]);

      // Act
      service.modifyBatchArray(batch);

      // Assert
      expect(listingStoreServiceSpy.updateStateProp).toHaveBeenCalledWith(
        'batches',
        [
          { batch: '1', quantity: 3 },
          { batch: '2', quantity: 5 },
        ]
      );
    });
  });
});
