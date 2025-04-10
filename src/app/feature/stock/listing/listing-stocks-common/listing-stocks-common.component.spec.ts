/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingStocksCommonComponent } from './listing-stocks-common.component';
import { ListingService } from '../listing.service';
import { ListingStoreService } from '../listing-store.service';
import {
  ExportService,
  RouterService,
  UtilService,
} from 'src/app/shared/service';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  INIT_FILTERS,
  RESET_FILTER,
  TABLE_FILTER_PROPS,
} from '../listing.constants';
import { StockTableComponent } from '../stock-table';
import { ListingActionComponent } from '../listing-action';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { ListingFiltersComponent } from '../listing-filters';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import {
  IFilterParams,
  IListingAPIResponse,
  ITableAction,
} from '../listing.model';
import { TranslateService } from '@ngx-translate/core';

const dummyStockList = [
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

describe('ListingStocksCommonComponent', () => {
  let component: ListingStocksCommonComponent;
  let fixture: ComponentFixture<ListingStocksCommonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ListingService,
          useClass: ListingServiceStub,
        },
        {
          provide: ListingStoreService,
          useClass: ListingStoreStub,
        },
        {
          provide: UtilService,
          useClass: UtilServiceStub,
        },
        {
          provide: ExportService,
          useValue: jasmine.createSpyObj('ExportService', ['initExportData']),
        },
        {
          provide: RouterService,
          useClass: RouterStub,
        },
        {
          provide: TranslateService,
          useValue: jasmine.createSpyObj('TranslateService', ['instant']),
        },
      ],
      imports: [
        CommonModule,
        HttpClientModule,
        ListingStocksCommonComponent,
        StockTableComponent,
        SearchBoxComponent,
        RouterModule,
        MatDialogModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingStocksCommonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component and call necessary methods on ngOnInit', () => {
    // Act
    spyOn(component, 'initSubscription');
    spyOn(component, 'getClaimData');
    spyOn(component, 'exportSubscription');
    component.ngOnInit();

    // Assert
    expect(component.initSubscription).toHaveBeenCalled();
    expect(component.getClaimData).toHaveBeenCalled();
    expect(component.exportSubscription).toHaveBeenCalled();
  });

  it('should call initApiCall with INIT_FILTERS when getClaims() succeeds', () => {
    // Act
    spyOn(component, 'initApiCall');
    component.getClaimData();

    // Assert
    expect(component.pageApis.length).toBe(1); // Ensure that an API subscription is added
    expect(component.pageApis[0].unsubscribe).toBeDefined(); // Ensure that the subscription is for an API call
    expect(component.initApiCall).toHaveBeenCalledWith(INIT_FILTERS);
  });

  describe('initApiCall with INIT_FILTERS', () => {
    it('only filters', () => {
      // Arrange
      const filters: IFilterParams = INIT_FILTERS;

      // Act (1: Initial call)
      component.initApiCall(filters);

      // Assert (1)
      expect(component.tableLength).toBe(1);
      expect(component.dataLoading).toBeFalse();
    });

    it('filters with type as pagination', () => {
      // Arrange
      const filters: IFilterParams = INIT_FILTERS;
      component.stocks = [
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
      component.initApiCall(filters, 'pagination');

      expect(component.stocks.length).toBe(2);
      expect(component.dataLoading).toBeFalse();
    });
    it('filters with type as allPagination', () => {
      // Arrange
      spyOn(component, 'selectCurrentPageItems');
      const filters: IFilterParams = INIT_FILTERS;
      component.stocks = [
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
      component.initApiCall(filters, 'allPagination');

      expect(component.stocks.length).toBe(2);
      expect(component.dataLoading).toBeFalse();

      expect(component.selectCurrentPageItems).toHaveBeenCalledWith('all');
    });
  });

  describe('initSubscription', () => {
    it('should update selectedStocks property when observable emits new values', () => {
      // Act
      component.initSubscription();

      // Assert
      expect(component.selectedStocks).toEqual([]);
      expect(component.toggleFilter).toBeFalse();
    });
  });

  describe('rowSelectionCondirion', () => {
    it('should update hideViewSelected to false and call selectCurrentPageItems if action is "page" and data is "all"', () => {
      // Arrange
      const event: ITableAction = { action: 'page', data: 'all' };

      // Act
      spyOn(component, 'selectCurrentPageItems');
      component.rowSelectionCondition(event);

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'hideViewSelected',
        false
      );
      expect(component.selectCurrentPageItems).toHaveBeenCalledWith('page');
    });

    it('should update hideViewSelected to false and call clearAndResetToDefault if action is "page" and data is not "all"', () => {
      // Arrange
      const event: ITableAction = { action: 'page', data: 'none' };

      // Act
      spyOn(component, 'clearAndResetToDefault');
      component.rowSelectionCondition(event);

      // Assert
      expect(component.clearAndResetToDefault).toHaveBeenCalled();
    });

    it('should update hideViewSelected to true and call selectCurrentPageItems if action is not "page" and data is not "none"', () => {
      // Arrange
      const event: ITableAction = { action: 'all', data: 'all' };

      // Act
      spyOn(component, 'selectCurrentPageItems');
      component.rowSelectionCondition(event);

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'hideViewSelected',
        true
      );
      expect(component.selectCurrentPageItems).toHaveBeenCalledWith('all');
    });

    it('should update hideViewSelected to false and call clearAndResetToDefault if action is not "page" and data is "none"', () => {
      // Arrange
      const event: ITableAction = { action: 'all', data: 'none' };

      // Act
      spyOn(component, 'clearAndResetToDefault');
      component.rowSelectionCondition(event);

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'hideViewSelected',
        false
      );
      expect(component.clearAndResetToDefault).toHaveBeenCalled();
    });
  });

  it('should reset all state properties and call initApiCall with INIT_FILTERS', () => {
    // Arrange

    // Act
    spyOn(component, 'disableStockActions');
    spyOn(component, 'initApiCall');
    component.clearAndResetToDefault();

    // Assert
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'selectAll',
      false
    );
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'selectedStocks',
      []
    );

    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'changedBatches',
      []
    );

    expect(component.store.updateStateProp).toHaveBeenCalledWith('batches', []);

    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'toggle',
      false
    );
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'filters',
      RESET_FILTER
    );
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'tableProps',
      TABLE_FILTER_PROPS
    );
    expect(component.disableStockActions).toHaveBeenCalled();
    expect(component.scrollValue).toEqual(0);
    expect(component.stocks).toEqual([]);
    expect(component.initApiCall).toHaveBeenCalledWith(INIT_FILTERS);
  });

  it('should enable stock actions', () => {
    // Arrange

    // Act
    component.enableStockActions();

    // Assert

    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'stockAction',
      true
    );
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'enableSendStock',
      true
    );
  });

  it('should disable stock actions', () => {
    // Arrange

    // Act
    component.disableStockActions();

    // Assert
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'stockAction',
      false
    );
    expect(component.store.updateStateProp).toHaveBeenCalledWith(
      'enableSendStock',
      false
    );
  });

  it('should set dataLoading to true and call initApiCall with searchString when searchFilter is called', () => {
    // Arrange
    const searchString = 'test';

    // Act
    spyOn(component, 'initApiCall');
    component.searchFilter(searchString);

    // Assert
    expect(component.dataLoading).toBeTrue();
    expect(component.initApiCall).toHaveBeenCalledWith({
      ...INIT_FILTERS,
      searchString,
    });
  });

  describe('Select current page items or all', () => {
    it('should select current page items and enable stock actions when action is "page"', () => {
      // Arrange
      component.stocks = dummyStockList;
      const batches = dummyStockList.map(e => {
        return {
          batch: e.itemId,
          quantity: e.quantityNeeded,
        };
      });

      // Act
      spyOn(component, 'enableStockActions');
      component.selectCurrentPageItems('page');

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        true
      );

      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectedStocks',
        dummyStockList
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'batches',
        batches
      );
      expect(component.enableStockActions).toHaveBeenCalled();
    });

    it('should select current page items and enable stock actions when action is not "page"', () => {
      // Arrange
      component.stocks = dummyStockList;
      const batches = dummyStockList.map(e => {
        return {
          batch: e.itemId,
          quantity: e.quantityNeeded,
        };
      });

      // Act
      spyOn(component, 'enableStockActions');
      spyOn(component, 'fetchSummaryData');
      component.selectCurrentPageItems('all');

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        true
      );

      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectedStocks',
        dummyStockList
      );
      expect(component.store.updateStateProp).not.toHaveBeenCalledWith(
        'batches',
        batches
      );
      expect(component.enableStockActions).toHaveBeenCalled();
    });
  });

  describe('Fetch summary data api', () => {
    it('should fetch summary data and update state when API call succeeds', () => {
      // Arrange
      const summaryData = [
        {
          batch: '1',
          quantity: 10,
        },
      ];

      // Act
      component.fetchSummaryData();

      // Assert
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'batches',
        summaryData
      );
    });
  });

  // it('should unsubscribe from subscriptions and reset toggle state on ngOnDestroy', () => {
  //   // Arrange
  //   component.pageApis = [new Subscription(), new Subscription()];
  //   spyOn(component.pageApis[0], 'unsubscribe');
  //   spyOn(component.pageApis[1], 'unsubscribe');

  //   // Act
  //   component.ngOnDestroy();

  //   // Assert
  //   expect(component.pageApis[0].unsubscribe).toHaveBeenCalled();
  //   expect(component.pageApis[1].unsubscribe).toHaveBeenCalled();
  //   expect(component.store.updateStateProp).toHaveBeenCalledWith(
  //     'toggle',
  //     false
  //   );
  // });
});

class ListingStoreStub {
  updateStateProp = jasmine.createSpy('updateStateProp');
  filterValues$ = new BehaviorSubject<any>(null);
  tableFilterValues$ = new BehaviorSubject<any>(null);
  selectAll$ = new BehaviorSubject<boolean>(false);
  selectedStockItems$ = new BehaviorSubject<any[]>([]);
  stockAction$ = new BehaviorSubject<boolean>(false);
  toggle$ = new BehaviorSubject<boolean>(false);
  selectOptions$ = new BehaviorSubject([]);
  viewSelectedToggle$ = new BehaviorSubject<boolean>(false);

  getTableProps() {
    return TABLE_FILTER_PROPS;
  }

  getFilterValues() {
    return RESET_FILTER;
  }

  resetState() {
    console.log('Reset state');
  }

  getSelectedStocks(): any {
    return [];
  }
}

class RouterStub {
  navigate() {
    console.log('Navigate');
  }
}

class UtilServiceStub {
  supplyChainData$ = new BehaviorSubject<any[]>([]);
}

const dummyStock: IListingAPIResponse = {
  count: 1,
  results: [
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
  ],
};

const emptyStock: IListingAPIResponse = {
  count: 0,
  results: [],
};

class ListingServiceStub {
  searchStock(filters: any, type?: string): Observable<IListingAPIResponse> {
    console.log(filters);

    return new Observable(ob => {
      if (type !== 'sorting') {
        ob.next(dummyStock);
      } else {
        ob.next(emptyStock);
      }
    });
  }

  getClaims() {
    const claimsResponse: any = { count: 5, results: [] };
    return new Observable(ob => ob.next(claimsResponse));
  }

  getBatchSummary() {
    return new Observable(ob =>
      ob.next({
        selected_batches: [
          {
            batch: '1',
            quantity: 10,
          },
        ],
      })
    );
  }

  removeDuplicates(): any {
    return dummyStockList;
  }

  formatFilterParams() {
    return {};
  }

  exportIconClicked() {
    return new Observable(ob => ob.next(true));
  }
}
