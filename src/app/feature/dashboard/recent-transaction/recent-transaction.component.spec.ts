import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RecentTransactionComponent } from './recent-transaction.component';
import { RouterService } from 'src/app/shared/service';
import { DashboardService } from '../dashboard.service';
import { DashboardStoreService } from '../dashboard-store.service';
import { IDashboardStatus } from '../dashboard.model';
import { ITransactionData } from '../../transactions/transactions.model';
import { ButtonsComponent, LoaderComponent } from 'fairfood-utils';

const mockDashboardData: IDashboardStatus = {
  actions: [],
  chains_with_stock: [],
  company_claims: [],
  farmer_chains: [],
  farmers: [],
  incomplete_chains: [],
  product_claims: [],
  products: [
    { id: '1', name: 'Product 1', quantity: 10 },
    { id: '2', name: 'Product 2', quantity: 25 },
  ],
  selected_supply_chain: '',
  statistics: {},
  supplier_chains: [],
  suppliers: [],
};

class MockDashboardStoreService {
  dashboardData$ = of(mockDashboardData);
}
const mockTransactionData: ITransactionData[] = [
  {
    blockchain_address: 'string',
    id: 'asda',
    quantity: 12,
    buyer_ref_number: 'string',
    currency: 'string',
    date: 213124124,
    number: 324234,
    price: 234,
    products: [
      { id: '1', name: 'Product 1' },
      { id: '2', name: 'Product 2' },
    ],
    rejectable: false,
    result_batches: [],
    seller_ref_number: 'string',
    type: 1,
  },
];
class MockDashboardService {
  getRecentTransactions() {
    return of(mockTransactionData);
  }
}

describe('RecentTransactionComponent', () => {
  let component: RecentTransactionComponent;
  let fixture: ComponentFixture<RecentTransactionComponent>;
  let routerService: jasmine.SpyObj<RouterService>;

  beforeEach(() => {
    const routerServiceSpy = jasmine.createSpyObj('RouterService', [
      'navigateUrl',
    ]);

    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ButtonsComponent,
        LoaderComponent,
        TranslateModule,
        RecentTransactionComponent,
      ],
      providers: [
        { provide: DashboardStoreService, useClass: MockDashboardStoreService },
        { provide: RouterService, useValue: routerServiceSpy },
        { provide: DashboardService, useClass: MockDashboardService },
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
      ],
    });

    fixture = TestBed.createComponent(RecentTransactionComponent);
    component = fixture.componentInstance;

    routerService = TestBed.inject(
      RouterService
    ) as jasmine.SpyObj<RouterService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to stock listing page on viewStockClicked', () => {
    component.viewStockClicked();
    expect(routerService.navigateUrl).toHaveBeenCalledWith('/stock/listing');
  });

  it('should navigate to transactions page on viewTransactionClicked', () => {
    component.viewTransactionClicked();
    expect(routerService.navigateUrl).toHaveBeenCalledWith('/transactions');
  });

  it('should fetch stock data and load transactions on ngOnInit', () => {
    spyOn(component, 'loadTransactions');
    component.ngOnInit();

    expect(component.stockData).toEqual(
      mockDashboardData.products.slice(0, 10)
    );
    expect(component.stockLoading).toBeFalse();

    expect(component.loadTransactions).toHaveBeenCalled();
  });

  it('should track by index properly', () => {
    const result = component.trackByFnStock({ id: '5' });
    expect(result).toEqual('5');
  });

  it('should track by index properly', () => {
    const result = component.trackByFnTransaction({ id: '5' });
    expect(result).toEqual('5');
  });
});
