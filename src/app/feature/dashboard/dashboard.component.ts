/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
// services
import { DashboardService } from './dashboard.service';
import { DashboardStoreService } from './dashboard-store.service';
import { RouterService, UtilService } from 'src/app/shared/service';
// configs
import { IChartData, IDashboardStatus } from './dashboard.model';
import { IActivity } from 'src/app/shared/configs/app.model';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  pageApis: Subscription[] = [];
  selectedConnectionLabel = '';
  dashboardStatistics: Partial<IDashboardStatus>;
  dataLoaded: boolean;
  supplyChainSelected: boolean;
  statistics: any;
  actorsData: IChartData;
  activities: any[];
  activityLoading: boolean;
  memberType = +localStorage.getItem('memberType');
  allSupplychain: boolean;
  constructor(
    private dashboardService: DashboardService,
    private store: DashboardStoreService,
    private routeService: RouterService,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    this.initSubscriptions();
    const sub1 = this.util.allSupplyChain$.subscribe((res: boolean) => {
      this.activityLoading = true;
      if (res) {
        this.allSupplychain = true;
        this.dashboardService.getStatus(this.selectedConnectionLabel, 'All');
      } else {
        this.allSupplychain = false;
        this.dashboardService.getStatus(this.selectedConnectionLabel);
      }
    });
    this.pageApis.push(sub1);
    const sub2 = this.util.supplyChainData$.subscribe((res: string) => {
      if (res) {
        this.dashboardService.getStatus(this.selectedConnectionLabel);
      }
    });
    this.pageApis.push(sub2);
  }

  initSubscriptions(): void {
    const sub1 = this.store.dashboardData$.subscribe((res: any) => {
      if (res) {
        this.dashboardStatistics = res;
      }
    });
    this.pageApis.push(sub1);
    const sub2 = this.store.statistics$.subscribe((res: any) => {
      if (res) {
        const { farmer_count, company_count } = res;
        this.actorsData = {
          labels: ['Farmers', 'Companies'],
          values: [farmer_count, company_count],
          colors: this.dashboardService.getPrimaryTheme(),
        };

        this.statistics = res;
        this.activityLogs();

        this.dataLoaded = true;
      }
    });
    this.pageApis.push(sub2);
  }

  // method to get activity details
  activityLogs(): void {
    const api = this.dashboardService.activities().subscribe({
      next: (activities: IActivity[]) => {
        this.activities = activities;
        this.activityLoading = false;
      },
      error: () => {
        this.activityLoading = false;
        this.activities = [];
      },
    });
    this.pageApis.push(api);
  }

  // add / invite connections
  inviteConnection(action: any): void {
    const schainId = localStorage.getItem('supplyChainId');
    if (action.supply_chain === schainId) {
      this.routeService.navigateUrl('/connections');
    } else {
      this.util.supplyChainData$.next(action.supply_chain);
      this.routeService.navigateUrl('/connections');
    }
  }

  viewCompanyProfile(): void {
    this.routeService.navigateUrl('/company-profile');
  }

  trackByFn(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
    this.store.resetState();
    this.util.allSupplyChain$.next(false);
  }
}
