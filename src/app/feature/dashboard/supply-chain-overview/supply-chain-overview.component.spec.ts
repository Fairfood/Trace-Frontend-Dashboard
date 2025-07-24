import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FfPaginationComponent, LoaderComponent } from 'fairfood-utils';
import { SupplyChainOverviewComponent } from './supply-chain-overview.component';
import { DashboardStoreService } from '../dashboard-store.service';
import { IDashboardStatus } from '../dashboard.model';

const mockDashboardData: IDashboardStatus = {
  actions: [],
  chains_with_stock: [],
  company_claims: [],
  farmer_chains: [],
  farmers: [],
  incomplete_chains: [],
  product_claims: [],
  products: [],
  selected_supply_chain: '',
  statistics: {},
  supplier_chains: [],
  suppliers: [],
  supply_chain_overview: [
    {
      active_actor_count: 10,
      actor_count: 10,
      chain_length: 10,
      company_count: 10,
      farmer_count: 10,
      complexity: 10,
      tier_count: 10,
      id: 'VyQkO',
      name: 'Black',
    },
    {
      active_actor_count: 10,
      actor_count: 10,
      chain_length: 10,
      company_count: 10,
      farmer_count: 10,
      complexity: 10,
      tier_count: 10,
      id: 'VyQk32O',
      name: 'Nut,eggs, and dairy products',
    },
  ],
};

class MockDashboardStoreService {
  dashboardData$ = of(mockDashboardData);
}

describe('SupplyChainOverviewComponent', () => {
  let component: SupplyChainOverviewComponent;
  let fixture: ComponentFixture<SupplyChainOverviewComponent>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('DashboardStoreService', [
      'dashboardData$',
    ]);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        LoaderComponent,
        FfPaginationComponent,
        TranslateModule.forRoot(),
        SupplyChainOverviewComponent,
      ],
      providers: [
        { provide: DashboardStoreService, useClass: MockDashboardStoreService },
      ],
    });

    fixture = TestBed.createComponent(SupplyChainOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should track by index properly', () => {
    const result = component.trackByFnCommon(5);
    expect(result).toEqual(5);
  });

  it('should assign dashboardData and supplyChainData on successful response', () => {
    component.initData();
    fixture.detectChanges();

    expect(component.dashboardData).toEqual(mockDashboardData);
    expect(component.supplyChainData).toEqual(
      mockDashboardData.supply_chain_overview.slice()
    );
  });

  it('should set dataLoading to false after receiving data', () => {
    component.initData();
    fixture.detectChanges();

    expect(component.dataLoading).toBeFalsy();
  });

  it('should update displayedData when currentPage changes', () => {
    component.currentPage = 2;
    component.itemsPerPage = 1;
    component.supplyChainData = [
      {
        active_actor_count: 0,
        actor_count: 0,
        chain_length: 0,
        company_count: 0,
        farmer_count: 0,
        complexity: 0,
        tier_count: 0,
        id: '1',
        name: 'Chain 1',
      },
      {
        active_actor_count: 0,
        actor_count: 0,
        chain_length: 0,
        company_count: 0,
        farmer_count: 0,
        complexity: 0,
        tier_count: 0,
        id: '2',
        name: 'Chain 2',
      },
    ];
    component.updateDisplayedData();

    expect(component.displayedData).toEqual([
      {
        active_actor_count: 0,
        actor_count: 0,
        chain_length: 0,
        company_count: 0,
        farmer_count: 0,
        complexity: 0,
        tier_count: 0,
        id: '2',
        name: 'Chain 2',
      },
    ]);
  });

  it('should update displayedData when paginatorEvent is called', () => {
    spyOn(component, 'updateDisplayedData');
    component.paginatorEvent({ offset: 10, limit: 5 });
    expect(component.currentPage).toEqual(3);
    expect(component.updateDisplayedData).toHaveBeenCalled();
  });

  it('should unsubscribe from subscriptions onDestroy', () => {
    const mockSubscription = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    component.sub = mockSubscription;

    // Trigger ngOnDestroy
    component.ngOnDestroy();

    // Check if unsubscribe is called on the mockSubscription
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });
});
