import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ListingService } from './listing.service';

describe('ListingService', () => {
  let service: ListingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(ListingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
