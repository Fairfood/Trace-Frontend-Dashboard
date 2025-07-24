import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockTableComponent } from './stock-table.component';
import { ListingStoreService } from '../listing-store.service';
import { StockTableService } from './stock-table.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { BehaviorSubject } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';

import {
  IPaginator,
  LoaderComponent,
  SortCustomComponent,
} from 'fairfood-utils';
import { ListingRowSelectionPipe } from '../listing.pipe';
import { IBatches, IStockTableRow } from '../listing.model';

const tableValues = {
  limit: 10,
  offset: 0,
  sortBy: 'created',
  orderBy: 'desc',
};

const mockSelectedStocks: IStockTableRow[] = [
  {
    stockId: 1,
    itemId: '1',
    name: 'Item 1',
    product: 'Product A',
    created: new Date(),
    from: 'Supplier 1',
    batch: 'Batch 1',
    quantityAvailable: 10,
    quantityNeeded: 5,
    select: false,
    option: '',
    referenceNo: 'REF001',
    productId: 'PID001',
    isExternal: false,
    transactionId: 'TID001',
  },
  {
    stockId: 2,
    itemId: '2',
    name: 'Item 2',
    product: 'Product B',
    created: new Date(),
    from: 'Supplier 2',
    batch: 'Batch 2',
    quantityAvailable: 100,
    quantityNeeded: 1,
    select: false,
    option: '',
    referenceNo: 'REF002',
    productId: 'PID002',
    isExternal: false,
    transactionId: 'TID002',
  },
];
class ListingStoreServiceMock {
  updateStateProp = jasmine.createSpy('updateStateProp');
  selectAll$ = new BehaviorSubject([]);
  viewSelectedToggle$ = new BehaviorSubject([]);
  selectOptions$ = new BehaviorSubject('page');
  selectedStockItems$ = new BehaviorSubject([]);
  tableFilterValues$ = new BehaviorSubject(tableValues);
}

describe('StockTableComponent', () => {
  let component: StockTableComponent;
  let fixture: ComponentFixture<StockTableComponent>;
  let service: StockTableService;

  beforeEach(async () => {
    const stockTableSpy = jasmine.createSpyObj('StockTableService', [
      'preSelectStocks',
      'modifyBatchArray',
      'selectStockAction',
      'viewDetails',
      'updatePagination',
      'sortInit',
      'updateQuanityNeeded',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        StockTableComponent,
        LoaderComponent,
        MatMenuModule,
        ListingRowSelectionPipe,
        SortCustomComponent,
        FormsModule,
        MatIconModule,
        MatCheckboxModule,
        MatRadioModule,
        HttpClientModule,
      ],
      providers: [
        { provide: ListingStoreService, useClass: ListingStoreServiceMock },
        { provide: StockTableService, useValue: stockTableSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockTableComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(StockTableService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('changeSelect', () => {
    it('should update quantityNeeded and add selected stock when checked is true', () => {
      const mockItem: any = { itemId: '1', select: false, quantityNeeded: 0 };
      component.selectedStocks = [];
      component.selectOptions = 'all';
      const spyOnAddSelectedStock = spyOn(component, 'addSelectedStock');

      component.changeSelect({ checked: true }, mockItem);

      expect(mockItem.quantityNeeded).toBe(mockItem.quantityAvailable);
      expect(spyOnAddSelectedStock).toHaveBeenCalledWith(mockItem);
    });

    it('should update quantityNeeded and add selected stock when checked is false', () => {
      const mockItem: any = { itemId: '1', select: true, quantityNeeded: 0 };
      component.selectedStocks = [];
      component.selectOptions = 'all';
      const spyOnAddSelectedStock = spyOn(component, 'addSelectedStock');

      component.changeSelect({ checked: false }, mockItem);

      expect(mockItem.quantityNeeded).toBe(null);
      expect(spyOnAddSelectedStock).toHaveBeenCalledWith(mockItem);
    });

    it('when selecting options are "page"', () => {
      const mockItem: any = { itemId: '1', select: true, quantityNeeded: 0 };
      component.selectedStocks = [];
      component.selectOptions = 'page';
      const spyOnAddSelectedStock = spyOn(component, 'addSelectedStock');

      component.changeSelect({ checked: false }, mockItem);

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        null
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        false
      );

      expect(spyOnAddSelectedStock).toHaveBeenCalledWith(mockItem);
    });
  });

  describe('selectedStockItemInit', () => {
    it('should update selectedStocks property when observable emits new values', () => {
      // Act
      component.selectedStockItemInit();

      // Assert
      expect(component.selectedStocks).toEqual([]);
    });
  });

  it('should update selectOptions property when observable emits new values', () => {
    // Act
    component.selectingOptionsSub();

    // Assert
    expect(component.selectOptions).toEqual('page');
  });

  describe('tableFilterValueChanges', () => {
    it('should update appliedFilterValues property when observable emits new values', () => {
      // Act
      component.tableFilterValueChanges();

      // Assert
      expect(component.appliedFilterValues).toEqual(tableValues);
    });
  });

  describe('resetSelectEntireListWhenUnselecting', () => {
    it('should reset entire list selection and update summary with current selected batches', () => {
      // Arrange
      component.selectedStocks = mockSelectedStocks;

      // Act
      component.resetSelectEntireListWhenUnselecting();

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        null
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        false
      );
      const expectedBatches: IBatches[] = mockSelectedStocks.map(b => ({
        batch: b.itemId,
        quantity: b.quantityNeeded,
      }));
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'batches',
        expectedBatches
      );
    });

    it('should unselect all and update batches when a batch is unselected', () => {
      // Arrange
      component.selectedStocks = mockSelectedStocks;

      // Act
      component.resetSelectEntireListWhenUnselecting();

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith('batches', [
        { batch: '1', quantity: 5 },
        { batch: '2', quantity: 1 },
      ]);
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        null
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        false
      );
    });
  });

  describe('checkForSelectAll', () => {
    it('should select all when all batches are selected', () => {
      // Arrange
      component.stocks = mockSelectedStocks.map(s => ({ ...s, select: true }));

      // Act
      component.checkForSelectAll();

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        true
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        'page'
      );
    });

    it('should unselect all when not all batches are selected', () => {
      // Arrange
      component.stocks = mockSelectedStocks.map(s => {
        if (s.stockId === 1) {
          s.select = true;
        }

        return s;
      });

      // Act
      component.checkForSelectAll();

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        false
      );
    });
  });

  describe('addSelectedStock', () => {
    it('should add a new stock item to the selection', () => {
      // Arrange
      const newStockItem: IStockTableRow = {
        stockId: 3,
        itemId: '3',
        name: 'Item 3',
        product: 'Product C',
        created: new Date(),
        from: 'Supplier 3',
        batch: 'Batch 3',
        quantityAvailable: 30,
        quantityNeeded: 5,
        select: true,
        option: '',
        referenceNo: 'REF003',
        productId: 'PID003',
        isExternal: false,
        transactionId: 'TID003',
      };
      component.selectedStocks = [];
      component.stocks = mockSelectedStocks;

      // Act
      const checkForSelectAll = spyOn(component, 'checkForSelectAll');
      component.addSelectedStock(newStockItem);

      // Assert
      expect(checkForSelectAll).toHaveBeenCalled();
    });
  });

  it('should return the stockId of the item', () => {
    // Arrange
    const item: IStockTableRow = mockSelectedStocks[0];

    // Act
    const result = component.trackByFn(0, item);

    // Assert
    expect(result).toBe(item.stockId);
  });

  it('should call service viewDetails method with the provided item', () => {
    // Arrange
    const item: IStockTableRow = mockSelectedStocks[0];

    // Act
    component.viewDetails(item);

    // Assert
    expect(service.viewDetails).toHaveBeenCalledWith(item);
  });

  describe('endOfListCondition', () => {
    it('should return false if scrollValue is greater than 0', () => {
      // Arrange
      component.scrollValue = 10;

      // Act
      const result = component.endOfListCondition();

      // Assert
      expect(result).toBeFalse();
    });

    it('should return true if scrollValue is not greater than 0', () => {
      // Arrange
      component.scrollValue = 0;

      // Act
      const result = component.endOfListCondition();

      // Assert
      expect(result).toBeTrue();
    });
  });

  describe('clickAndLoadMore', () => {
    it('should call paginatorEvent method if endOfListCondition is false', () => {
      // Arrange
      component.scrollValue = 10;
      spyOn(component, 'endOfListCondition').and.returnValue(false);
      const paginatorEventSpy = spyOn(component, 'paginatorEvent');

      // Act
      component.clickAndLoadMore();

      // Assert
      expect(paginatorEventSpy).toHaveBeenCalled();
    });

    it('should not call paginatorEvent method if endOfListCondition is true', () => {
      // Arrange
      component.scrollValue = 0;
      spyOn(component, 'endOfListCondition').and.returnValue(true);
      const paginatorEventSpy = spyOn(component, 'paginatorEvent');

      // Act
      component.clickAndLoadMore();

      // Assert
      expect(paginatorEventSpy).not.toHaveBeenCalled();
    });
  });

  describe('paginatorEvent', () => {
    it('should call service.updatePagination and emit "allPagination" if selectOptions is "all"', () => {
      // Arrange
      spyOn(component.filterChanged, 'emit');
      component.selectOptions = 'all';
      const data: IPaginator = { limit: 10, offset: 0 };

      // Act
      component.paginatorEvent(data);

      // Assert
      expect(service.updatePagination).toHaveBeenCalledWith(data);
      expect(component.filterChanged.emit).toHaveBeenCalledWith(
        'allPagination'
      );
    });

    it('should call store.updateStateProp and emit "pagination" if selectOptions is not "all"', () => {
      // Arrange
      spyOn(component.filterChanged, 'emit');
      component.selectOptions = 'notAll';
      const data: IPaginator = { limit: 10, offset: 0 };

      // Act
      component.paginatorEvent(data);

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        null
      );
      expect(component.filterChanged.emit).toHaveBeenCalledWith('pagination');
    });
  });

  describe('sortData', () => {
    it('should call service.sortInit and emit filterChanged if selectedBatchesOnly is false', () => {
      // Arrange
      spyOn(component.filterChanged, 'emit');
      component.selectedBatchesOnly = false;
      const column = 'name';

      // Act
      component.sortData(column);

      // Assert
      expect(service.sortInit).toHaveBeenCalledWith(
        column,
        component.appliedFilterValues
      );
      expect(component.filterChanged.emit).toHaveBeenCalled();
    });

    it('should not call service.sortInit or emit filterChanged if selectedBatchesOnly is true', () => {
      // Arrange
      spyOn(component.filterChanged, 'emit');
      component.selectedBatchesOnly = true;
      const column = 'name';

      // Act
      component.sortData(column);

      // Assert
      expect(service.sortInit).not.toHaveBeenCalled();
      expect(component.filterChanged.emit).not.toHaveBeenCalled();
    });
  });

  describe('updateQuantityValue', () => {
    it('should call service.updateQuanityNeeded with correct parameters', () => {
      // Arrange
      const item: IStockTableRow = {
        stockId: 1,
        itemId: '123',
        name: 'Product A',
        product: 'Product A',
        created: new Date(),
        from: 'Supplier A',
        batch: 'Batch A',
        quantityAvailable: 10,
        quantityNeeded: 5,
        select: false,
        option: '',
        referenceNo: 'Ref123',
        productId: '456',
        isExternal: false,
        transactionId: '789',
      };

      // Act
      component.updateQuantityValue(item);

      // Assert
      expect(service.updateQuanityNeeded).toHaveBeenCalledWith(
        component.selectedStocks,
        item
      );
    });
  });

  describe('radioButtonChanged', () => {
    it('should call store.updateStateProp and rowSelection.emit with correct parameters when event value is "page"', () => {
      // Arrange
      spyOn(component.rowSelection, 'emit');
      const event = { value: 'page' };

      // Act
      component.radioButtonChanged(event);

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        'page'
      );
      expect(component.rowSelection.emit).toHaveBeenCalledWith({
        action: 'page',
        data: 'all',
      });
    });

    it('should call store.updateStateProp and rowSelection.emit with correct parameters when event value is not "page"', () => {
      // Arrange
      spyOn(component.rowSelection, 'emit');
      const event = { value: 'otherValue' };

      // Act
      component.radioButtonChanged(event);

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        'otherValue'
      );
      expect(component.rowSelection.emit).toHaveBeenCalledWith({
        action: 'all',
        data: 'all',
      });
    });
  });
});
