/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

// services
import { RouterService } from 'src/app/shared/service';
import { DashboardService } from '../dashboard.service';
import { DashboardStoreService } from '../dashboard-store.service';
// models
import { IDashboardProducts, IDashboardStatus } from '../dashboard.model';
import { ICommonAPIResponse } from 'src/app/shared/configs/app.model';
import { ITransactionData } from '../../transactions/transactions.model';
// components
import { ButtonsComponent, LoaderComponent } from 'fairfood-utils';

/**
 * Component responsible for displaying recent transactions on the dashboard.
 */
@Component({
  selector: 'app-recent-transaction',
  templateUrl: './recent-transaction.component.html',
  styleUrls: ['./recent-transaction.component.scss'],
  standalone: true,
  imports: [ButtonsComponent, LoaderComponent, CommonModule],
})
export class RecentTransactionComponent implements OnInit, OnDestroy {
  stockData: IDashboardProducts[];
  stockLoading: boolean;
  transactionData: ITransactionData[];
  transactionLoading: boolean;
  pageApis: Subscription[] = [];

  /**
   * Initializes the RecentTransactionComponent with required services.
   * @param service - Dashboard store service for managing dashboard data.
   * @param routeService - Router service for navigation.
   * @param dashboardService - Dashboard service for fetching data.
   */
  constructor(
    private service: DashboardStoreService,
    private routeService: RouterService,
    private dashboardService: DashboardService
  ) {}

  /**
   * Lifecycle hook called after component initialization.
   * Retrieves and updates stock and transaction data.
   */
  ngOnInit(): void {
    this.stockLoading = true;
    this.transactionLoading = true;

    // fetch stock data from dashboard statistics
    const sub = this.service.dashboardData$.subscribe(
      (res: IDashboardStatus) => {
        if (res) {
          const { products } = res;
          this.stockData = products.slice(0, 10) || [];
          this.stockLoading = false;
          this.loadTransactions();
        }
      }
    );
    this.pageApis.push(sub);
  }

  /**
   * Fetches recent transaction data and updates the component.
   */
  loadTransactions(): void {
    const api = this.dashboardService.getRecentTransactions().subscribe({
      next: (res: ICommonAPIResponse<ITransactionData>) => {
        const { results } = res;
        this.transactionData = results || [];
        this.transactionLoading = false;
      },
    });
    this.pageApis.push(api);
  }

  /**
   * Navigates to the stock listing page.
   */
  viewStockClicked(): void {
    this.routeService.navigateUrl('/stock/listing');
  }

  /**
   * Navigates to the transactions page.
   */
  viewTransactionClicked(): void {
    this.routeService.navigateUrl('/transactions');
  }

  trackByFnStock(item: any): string {
    return item.id;
  }

  trackByFnTransaction(item: any): string {
    return item.id;
  }

  /**
   * Lifecycle hook called before the component is destroyed.
   * Unsubscribes from subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.pageApis.forEach(sub => sub.unsubscribe());
  }
}
