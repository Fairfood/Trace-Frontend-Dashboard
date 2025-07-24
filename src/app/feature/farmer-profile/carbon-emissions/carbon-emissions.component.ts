import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ButtonsComponent,
  FfCustomPaginationComponent,
  IPaginator,
  LoaderComponent,
} from 'fairfood-utils';
import { TransactionsService } from '../../transactions';
import { ICommonAPIResponse } from 'src/app/shared/configs/app.model';
import {
  IAppliedFilterTransaction,
  ITransactionData,
} from '../../transactions/transactions.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import { CARBON_TRANSACTION_TYPE_FILTER } from '../../transactions/transactions.constants';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';

@Component({
  selector: 'app-carbon-emissions',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LoaderComponent,
    FfCustomPaginationComponent,
    ButtonsComponent,
    MatIconModule,
    FfFilterBoxWrapperComponent,
    SearchBoxComponent,
  ],
  templateUrl: './carbon-emissions.component.html',
  styleUrls: ['./carbon-emissions.component.scss'],
})
export class CarbonEmissionsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  loading: boolean;
  tableLength = 0;
  appliedFilterValues: any;
  customPageSize: { limit: any; offset: any };
  toggleFilter: boolean;
  transactionListFilter = CARBON_TRANSACTION_TYPE_FILTER;

  displayedColumns: any[] = [
    {
      name: this.translate.instant('requests.transactionId'),
      class: 'normal-column',
    },
    {
      name: this.translate.instant('carbonEmission.party'),
      class: 'large-column',
    },
    {
      name: this.translate.instant('carbonEmission.carbonCredit'),
      class: 'normal-column',
    },
    {
      name: this.translate.instant('transactions.typeText'),
      class: 'normal-column',
    },
    {
      name: this.translate.instant('misc.date'),
      class: 'large-column',
    },
  ];
  dataSource: any;

  constructor(
    private translate: TranslateService,
    public trService: TransactionsService,
    public route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.initFilters();
  }

  initFilters(): void {
    this.appliedFilterValues = {
      limit: 10,
      offset: 0,
      searchString: '',
    };
    this.getTransactions();
  }

  trackByFn(index: number): number {
    return index;
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.appliedFilterValues.limit = limit;
    this.appliedFilterValues.offset = offset;
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
    this.getTransactions();
  }

  getTransactions(): void {
    const node = this.route.snapshot.paramMap.get('id');
    this.loading = true;
    this.dataSource = [];
    this.trService
      .getCarbonEmissionTransaction(this.appliedFilterValues, node)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(response => {
        const { count, results } = response;
        this.tableLength = count;
        this.loading = false;
        this.dataSource = results || [];
      });
  }

  filterClicked(): void {
    this.toggleFilter = !this.toggleFilter;
    if (!this.toggleFilter) {
      this.initFilters();
    }
  }

  filterTransactionList(selectedObj: any, label: string): void {
    const selectedValue = selectedObj.id === 'All' ? '' : selectedObj.id;
    if (label == 'type') {
      this.appliedFilterValues.transactionType = selectedValue;
    }
    if (selectedValue) {
      this.getTransactions();
    } else {
      this.initFilters();
    }
  }

  searchFilter(search: string): void {
    this.appliedFilterValues.searchString = search;
    if (search) {
      this.getTransactions();
    } else {
      this.initFilters();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
