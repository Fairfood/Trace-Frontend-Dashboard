import { TestBed } from '@angular/core/testing';

import { ListingStoreService } from './listing-store.service';

describe('ListingStoreService', () => {
  let service: ListingStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListingStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
