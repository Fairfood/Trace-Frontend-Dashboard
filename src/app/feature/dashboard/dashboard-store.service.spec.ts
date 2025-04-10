import { TestBed } from '@angular/core/testing';
import { DashboardStoreService } from './dashboard-store.service';
import { IDashboardStatistics } from './dashboard.model';

describe('DashboardStoreService', () => {
  let service: DashboardStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStoreService],
    });
    service = TestBed.inject(DashboardStoreService);
  });

  it('should emit the correct value when udpateStatistics is called', done => {
    const statistics: IDashboardStatistics = {
      active_actor_count: 1,
      actor_count: 2,
      chain_length: 3,
      company_count: 4,
      farmer_count: 5,
      invited_actor_count: 6,
      mapped_actor_count: 7,
      pending_invite_count: 8,
      supplier_count: 9,
      supply_chain_count: 10,
      tier_count: 11,
      traceable_chain_percentage: 12,
      traceable_chains: 13,
      operation_stats: {
        farmer: [
          {
            name: 'test',
            count: 1,
          },
        ],
        supplier: [
          {
            name: 'test',
            count: 1,
          },
        ],
      },
    };

    service.udpateStatistics(statistics);

    service.statistics$.subscribe(emittedStatistics => {
      expect(emittedStatistics).toEqual(statistics);
      done();
    });
  });

  // ... other tests ...
});
