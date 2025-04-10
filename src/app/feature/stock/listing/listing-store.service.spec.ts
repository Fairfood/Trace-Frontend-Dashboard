import { take } from 'rxjs';
import { ListingStoreService } from './listing-store.service';

describe('ListingStoreService', () => {
  let listingStoreService: ListingStoreService;

  beforeEach(() => {
    listingStoreService = new ListingStoreService();
  });

  it('should be created', () => {
    expect(listingStoreService).toBeTruthy();
  });

  it('should have initial state values', () => {
    let filterValues: any;
    listingStoreService.filterValues$
      .pipe(take(1))
      .subscribe(value => (filterValues = value));

    // Adjust expectations based on your initial state structure
    expect(filterValues).toEqual(listingStoreService.getFilterValues());
    // ... add more expectations for other state properties
  });

  it('should get filter values', () => {
    let filterValues: any;
    listingStoreService.filterValues$
      .pipe(take(1))
      .subscribe(value => (filterValues = value));
    expect(filterValues).toEqual(listingStoreService.getFilterValues());
  });

  it('should get selected stocks', () => {
    let selectedStocks: any;
    listingStoreService.selectedStockItems$
      .pipe(take(1))
      .subscribe(value => (selectedStocks = value));
    expect(selectedStocks).toEqual(listingStoreService.getSelectedStocks());
  });
});
