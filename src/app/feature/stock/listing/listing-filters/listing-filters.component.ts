/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
// components
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import { LoaderComponent, ButtonsComponent } from 'fairfood-utils';
import { FairFoodDropDateComponent } from 'src/app/shared/components/ff-drop-date';
import { FairFoodDropQuantityComponent } from 'src/app/shared/components/ff-drop-quantity';
// configs
import {
  IFilterToggleItems,
  IStockFilter,
  IStockTableRow,
} from '../listing.model';
import { getAdditionalFilters } from 'src/app/shared/configs/app.methods';
import { ICommonObj } from 'src/app/shared/configs/app.model';
// services
import { ListingStoreService } from '../listing-store.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { StorageService } from 'src/app/shared/service';
// material
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ClaimService } from 'src/app/feature/claim';
import { STOCK_TYPES_FILTER } from '../listing.constants';

@Component({
  selector: 'app-listing-filters',
  standalone: true,
  imports: [
    CommonModule,
    FfFilterBoxWrapperComponent,
    LoaderComponent,
    MatMenuModule,
    MatCheckboxModule,
    FairFoodDropDateComponent,
    ButtonsComponent,
    FairFoodDropQuantityComponent,
  ],
  templateUrl: './listing-filters.component.html',
  styleUrls: ['./listing-filters.component.scss'],
})
export class ListingFiltersComponent implements OnInit, OnDestroy {
  @Output() filterChanged = new EventEmitter();

  stocklistFilter: IStockFilter;
  filterDataLoading = true;
  pageApis: Subscription[] = [];
  appliedFilterValues: IFilterToggleItems;
  availableFilters: any;
  createdFromList: ICommonObj[] = STOCK_TYPES_FILTER;

  constructor(
    private store: ListingStoreService,
    private global: GlobalStoreService,
    private storage: StorageService,
    private claim: ClaimService
  ) {
    this.stocklistFilter = {
      productData: [],
      supplierData: [],
      claimsData: [],
    };
  }

  ngOnInit(): void {
    this.initData();
    this.loadProducts();
    this.additionalFilterSetting();
  }

  initData(): void {
    const sub1 = this.store.filterValues$.subscribe(filterValues => {
      this.appliedFilterValues = filterValues;
    });
    this.pageApis.push(sub1);
  }

  loadProducts(): void {
    const sub2 = this.global.supplychainProducts$.subscribe(products => {
      this.stocklistFilter.productData = products;
      this.loadSupplier();
    });

    this.pageApis.push(sub2);
  }

  loadSupplier(): void {
    const sub3 = this.global.latestConnectionDetails$.subscribe(suppliers => {
      const company = {
        id: this.storage.retrieveStoredData('companyID'),
        name: this.storage.retrieveStoredData('companyName'),
      };
      this.stocklistFilter.supplierData = [company, ...suppliers];
      this.loadClaims();
    });

    this.pageApis.push(sub3);
  }

  loadClaims(): void {
    const sub4 = this.store.claimMasterData$.subscribe(claims => {
      this.stocklistFilter.claimsData = claims;
      this.filterDataLoading = false;
    });
    this.pageApis.push(sub4);
  }

  additionalFilterSetting(): void {
    const filterArray = getAdditionalFilters(false);
    const filters = [
      ...filterArray,
      { name: 'Created from', visible: false, id: 'type' },
    ];
    this.availableFilters = JSON.parse(JSON.stringify(filters));
  }

  /**
   * Filter dropdown change watch
   * @param newValue any
   * @param type string
   */
  filterStocklist(newValue: ICommonObj, type: string): void {
    this.resetOtherSections();
    const selectedFilterValue = newValue.id === 'All' ? '' : newValue.id;
    if (type === 'supplier') {
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...this.store.getFilterValues(),
        selectedSupplier: selectedFilterValue,
      });
    } else if (type === 'product') {
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...this.store.getFilterValues(),
        selectedProduct: selectedFilterValue,
      });
    } else if (type === 'createdFrom') {
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...this.store.getFilterValues(),
        createdFrom: selectedFilterValue,
      });
    } else {
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...this.store.getFilterValues(),
        selectedClaim: selectedFilterValue,
      });
    }
    this.store.updateStateProp<string>('selectingOptions', null);
    this.filterChanged.emit();
  }

  /**
   * Additional filter value changes
   * @param filterItems any
   */
  filterByAdditional(filterItems: any): void {
    this.resetOtherSections();
    this.store.updateStateProp<IFilterToggleItems>('filters', {
      ...this.store.getFilterValues(),
      ...filterItems,
    });
    this.store.updateStateProp<string>('selectingOptions', null);
    this.filterChanged.emit();
  }

  resetOtherSections(): void {
    this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
    this.store.updateStateProp<boolean>('selectAll', false);
    this.store.updateStateProp<boolean>('stockAction', false);
  }

  /**
   * Show advanced filter
   * @param item any
   */
  showFilter(item: any): void {
    item.visible = !item.visible;
    // special case for created from dropdown
    if (item.id === 'type' && !item.visible) {
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...this.store.getFilterValues(),
        createdFrom: '',
      });
    } else if (item.id === 'date' && !item.visible) {
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...this.store.getFilterValues(),
        dateFrom: '',
        dateOn: '',
        dateTo: '',
      });
    } else if (item.id === 'quantity' && !item.visible) {
      this.appliedFilterValues.quantityFrom = '';
      this.appliedFilterValues.quantityTo = '';
      this.store.updateStateProp<IFilterToggleItems>('filters', {
        ...this.store.getFilterValues(),
        quantityFrom: '',
        quantityTo: '',
      });
    }
    this.filterChanged.emit();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(api => api.unsubscribe());
  }
}
