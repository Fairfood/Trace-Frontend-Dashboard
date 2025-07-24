/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
// components
import { StockTableComponent } from './stock-table';
import { ListingActionComponent } from './listing-action';
import { ListingFiltersComponent } from './listing-filters';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { ListingStocksCommonComponent } from './listing-stocks-common/listing-stocks-common.component';

@Component({
  selector: 'app-listing',
  standalone: true,
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  imports: [
    CommonModule,
    StockTableComponent,
    ListingActionComponent,
    SearchBoxComponent,
    ListingFiltersComponent,
  ],
})
export class ListingComponent
  extends ListingStocksCommonComponent
  implements OnDestroy
{
  ngOnDestroy(): void {
    this.pageApis?.forEach(sub => sub?.unsubscribe());
    // resetting the state of toggle filter
    this.store.updateStateProp<boolean>('toggle', false);
  }
}
