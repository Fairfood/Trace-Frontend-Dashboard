import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
// services
import { DashboardStoreService } from '../dashboard-store.service';
// config
import { ITableColumnHeader } from 'src/app/shared/configs/app.model';
import { SUPPLY_CHAIN_COLUMNS } from '../dashboard.config';
import { IDashboardStatus, ISupplyChainOverview } from '../dashboard.model';
// components
import {
  FfPaginationComponent,
  IPaginator,
  LoaderComponent,
} from 'fairfood-utils';

@Component({
  selector: 'app-supply-chain-overview',
  templateUrl: './supply-chain-overview.component.html',
  styleUrls: ['./supply-chain-overview.component.scss'],
  imports: [CommonModule, LoaderComponent, FfPaginationComponent],
  standalone: true,
})
export class SupplyChainOverviewComponent implements OnDestroy, OnInit {
  displayedColumns: ITableColumnHeader[] = SUPPLY_CHAIN_COLUMNS;
  sub: Subscription;
  dashboardData: IDashboardStatus;
  supplyChainData: ISupplyChainOverview[] = [];
  dataLoading = true;

  itemsPerPage = 10; // Number of items to display per page
  currentPage = 1; // Current page number
  displayedData: ISupplyChainOverview[] = [];
  constructor(private service: DashboardStoreService) {}

  ngOnInit(): void {
    this.initData();
  }

  initData(): void {
    this.sub = this.service.dashboardData$.subscribe(
      (res: IDashboardStatus) => {
        this.dashboardData = res;
        const { supply_chain_overview } = res;
        if (supply_chain_overview) {
          this.supplyChainData = supply_chain_overview.slice();
          this.updateDisplayedData();
        }
        this.dataLoading = false;
      }
    );
  }

  // Method to update displayedData based on currentPage
  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedData = this.supplyChainData.slice(startIndex, endIndex);
  }

  paginatorEvent({ offset, limit }: IPaginator): void {
    this.itemsPerPage = limit;
    this.currentPage = offset / limit + 1;
    this.updateDisplayedData();
  }

  trackByFnCommon(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
