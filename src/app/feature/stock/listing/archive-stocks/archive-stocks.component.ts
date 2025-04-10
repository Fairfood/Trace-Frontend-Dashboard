import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { ListingFiltersComponent } from '../listing-filters';
import { StockTableComponent } from '../stock-table';
import { ListingActionComponent } from '../listing-action';
import { ButtonsComponent } from 'fairfood-utils';
import { ListingStocksCommonComponent } from '../listing-stocks-common/listing-stocks-common.component';

@Component({
  selector: 'app-archive-stocks',
  standalone: true,
  imports: [
    CommonModule,
    SearchBoxComponent,
    ListingFiltersComponent,
    StockTableComponent,
    ListingActionComponent,
    ButtonsComponent,
  ],
  templateUrl: './archive-stocks.component.html',
  styleUrls: ['./archive-stocks.component.scss'],
})
export class ArchiveStocksComponent
  extends ListingStocksCommonComponent
  implements OnDestroy
{
  ngOnDestroy(): void {
    this.pageApis?.forEach(sub => sub?.unsubscribe());
    // resetting the state of toggle filter
    this.store.updateStateProp<boolean>('toggle', false);
    this.store.resetState();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
