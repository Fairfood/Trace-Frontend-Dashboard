import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingFiltersComponent } from './listing-filters.component';
import { ListingStoreService } from '../listing-store.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { StorageService } from 'src/app/shared/service';
import { ClaimService } from 'src/app/feature/claim';
import { of } from 'rxjs';
import { TABLE_FILTER_PROPS } from '../listing.constants';

describe('ListingFiltersComponent', () => {
  let component: ListingFiltersComponent;
  let fixture: ComponentFixture<ListingFiltersComponent>;
  let listingStoreServiceMock: Partial<ListingStoreService>;
  let globalStoreServiceMock: Partial<GlobalStoreService>;
  let storageServiceMock: Partial<StorageService>;
  let claimServiceMock: Partial<ClaimService>;

  beforeEach(async () => {
    listingStoreServiceMock = {
      filterValues$: of({
        selectedProduct: '',
        selectedClaim: '',
        selectedSupplier: '',
        quantityFrom: '',
        quantityTo: '',
        quantityIs: '',
        dateOn: '',
        dateTo: '',
        dateFrom: '',
        searchString: '',
        archived: false,
      }),
      claimMasterData$: of([]),
      updateStateProp: jasmine.createSpy(),
      getFilterValues: jasmine.createSpy().and.returnValue({}),
      getTableProps: () => {
        return TABLE_FILTER_PROPS;
      },
    };

    globalStoreServiceMock = {
      supplychainProducts$: of([]),
      latestConnectionDetails$: of([]),
    };

    storageServiceMock = {
      retrieveStoredData: jasmine.createSpy().and.returnValue(''),
    };

    claimServiceMock = {};

    await TestBed.configureTestingModule({
      imports: [ListingFiltersComponent],
      providers: [
        { provide: ListingStoreService, useValue: listingStoreServiceMock },
        { provide: GlobalStoreService, useValue: globalStoreServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: ClaimService, useValue: claimServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    spyOn(component, 'initData');
    spyOn(component, 'loadProducts');
    spyOn(component, 'additionalFilterSetting');

    component.ngOnInit();

    expect(component.initData).toHaveBeenCalled();
    expect(component.loadProducts).toHaveBeenCalled();
    expect(component.additionalFilterSetting).toHaveBeenCalled();
  });

  it('should load products and suppliers', () => {
    spyOn(component, 'loadClaims');

    component.loadProducts();

    expect(component.loadClaims).toHaveBeenCalled();
  });

  it('should update filter values and emit event on filterStocklist: supplier', () => {
    spyOn(component.filterChanged, 'emit');
    spyOn(component, 'resetOtherSections');

    component.filterStocklist({ id: 'test', name: 'test1' }, 'supplier');

    expect(component.resetOtherSections).toHaveBeenCalled();
    expect(listingStoreServiceMock.updateStateProp).toHaveBeenCalledWith(
      'filters',
      jasmine.any(Object)
    );
    expect(component.filterChanged.emit).toHaveBeenCalled();
  });

  it('should update filter values and emit event on filterStocklist: product', () => {
    spyOn(component.filterChanged, 'emit');
    spyOn(component, 'resetOtherSections');
    component.filterStocklist({ id: 'test', name: 'test1' }, 'product');

    expect(component.resetOtherSections).toHaveBeenCalled();
    expect(listingStoreServiceMock.updateStateProp).toHaveBeenCalledWith(
      'filters',
      jasmine.any(Object)
    );
    expect(component.filterChanged.emit).toHaveBeenCalled();
  });

  it('should update filter values and emit event on filterStocklist: createdFrom', () => {
    spyOn(component.filterChanged, 'emit');
    spyOn(component, 'resetOtherSections');
    component.filterStocklist({ id: 'test', name: 'test1' }, 'createdFrom');

    expect(component.resetOtherSections).toHaveBeenCalled();
    expect(listingStoreServiceMock.updateStateProp).toHaveBeenCalledWith(
      'filters',
      jasmine.any(Object)
    );
    expect(component.filterChanged.emit).toHaveBeenCalled();
  });

  it('should update filter values and emit event on filterStocklist: claim', () => {
    spyOn(component.filterChanged, 'emit');
    spyOn(component, 'resetOtherSections');
    component.filterStocklist({ id: 'test', name: 'test1' }, 'selectdClaim');

    expect(component.resetOtherSections).toHaveBeenCalled();
    expect(listingStoreServiceMock.updateStateProp).toHaveBeenCalledWith(
      'filters',
      jasmine.any(Object)
    );
    expect(component.filterChanged.emit).toHaveBeenCalled();
  });

  describe('additionalFilterSetting', () => {
    it('additional filter settings', () => {
      spyOn(component.filterChanged, 'emit');
      spyOn(component, 'resetOtherSections');
      component.filterByAdditional({ dateOn: '', dateTo: '', dateFrom: '' });

      expect(component.resetOtherSections).toHaveBeenCalled();
      expect(listingStoreServiceMock.updateStateProp).toHaveBeenCalledWith(
        'filters',
        jasmine.any(Object)
      );
      expect(component.filterChanged.emit).toHaveBeenCalled();
    });
  });

  it('should reset other sections', () => {
    component.resetOtherSections();

    expect(listingStoreServiceMock.updateStateProp).toHaveBeenCalledTimes(6);
  });

  afterEach(() => {
    fixture.destroy();
  });
});
