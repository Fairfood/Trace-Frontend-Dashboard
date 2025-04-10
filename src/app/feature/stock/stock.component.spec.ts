import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterService } from 'src/app/shared/service';
import { StockProcessService } from './process-stock';
import { ListingStoreService } from './listing/listing-store.service';
import { StockComponent } from './stock.component';
import { RouterModule } from '@angular/router';
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('StockComponent', () => {
  let component: StockComponent;
  let fixture: ComponentFixture<StockComponent>;
  let mockRouterService: jasmine.SpyObj<RouterService>;
  let mockStockProcessService: jasmine.SpyObj<StockProcessService>;
  let mockListingStoreService: jasmine.SpyObj<ListingStoreService>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    mockRouterService = jasmine.createSpyObj('RouterService', [
      'routeChangeSubject$',
    ]);
    mockStockProcessService = jasmine.createSpyObj('StockProcessService', [
      'transactionState',
      'stockStateReset',
      'emitNewTransactionState',
      'claimStateReset',
      'changeClaimData',
      'updateListingInfo',
      'listingInfo',
      'updateSummaryData',
      'summaryData',
    ]);
    mockListingStoreService = jasmine.createSpyObj('ListingStoreService', [
      'resetState',
    ]);

    mockTranslate = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      imports: [
        StockComponent,
        RouterModule,
        ExportIconComponent,
        HttpClientModule,
        TranslateModule,
      ],
      providers: [
        { provide: RouterService, useValue: mockRouterService },
        { provide: StockProcessService, useValue: mockStockProcessService },
        { provide: ListingStoreService, useValue: mockListingStoreService },
        { provide: TranslateService, useValue: mockTranslate },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle help', () => {
    component.toggleHelp = false;
    component.showHideHelp();

    expect(component.toggleHelp).toBe(true);

    component.showHideHelp();
    expect(component.toggleHelp).toBe(false);
  });

  it('should reset stock on ngDestroy', () => {
    component.ngOnDestroy();

    expect(mockStockProcessService.stockStateReset).toHaveBeenCalled();
    expect(mockStockProcessService.emitNewTransactionState).toHaveBeenCalled();
    expect(mockStockProcessService.claimStateReset).toHaveBeenCalled();
    expect(mockStockProcessService.changeClaimData).toHaveBeenCalled();
    expect(mockListingStoreService.resetState).toHaveBeenCalled();
  });

  it('should call resetStock, resetState, and unsubscribe from sub in ngOnDestroy', () => {
    // Arrange
    const resetStockSpy = spyOn(component, 'resetStock');
    component.sub = { unsubscribe: jasmine.createSpy() } as any; // Mocking the subscription
    const initialState = component.sub;

    // Act
    component.ngOnDestroy();

    // Assert
    expect(resetStockSpy).toHaveBeenCalled();
    expect(mockListingStoreService.resetState).toHaveBeenCalled();
    if (initialState) {
      expect(component.sub.unsubscribe).toHaveBeenCalled();
    }
  });
});
