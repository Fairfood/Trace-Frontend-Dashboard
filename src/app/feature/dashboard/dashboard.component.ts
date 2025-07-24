/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
// services
import { DashboardService } from './dashboard.service';
import { DashboardStoreService } from './dashboard-store.service';
import { RouterService, UtilService } from 'src/app/shared/service';
import { TranslateService } from '@ngx-translate/core';

// configs
import { IChartData, IDashboardStatus } from './dashboard.model';
import { IActivity } from 'src/app/shared/configs/app.model';
import { DASH_IMPORTS } from './dashboard.config';
// components
import { DashboardMapViewComponent } from './dashboard-map-view';
import { SupplyChainOverviewComponent } from './supply-chain-overview';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    ...DASH_IMPORTS,
    DashboardMapViewComponent,
    SupplyChainOverviewComponent,
  ],
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
    private util: UtilService,
    private tranlsate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initSubscriptions();
    const changeCompany = this.util.companyData$
      .pipe(startWith('initial')) // Emit an initial value to trigger on load
      .subscribe((result: string) => {
        const sub1 = this.util.allSupplyChain$.subscribe((res: boolean) => {
          this.activityLoading = true;
          if (res) {
            this.allSupplychain = true;
            this.dashboardService.getStatus(
              this.selectedConnectionLabel,
              'All'
            );
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
      });
    this.pageApis.push(changeCompany);
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
          labels: [
            this.tranlsate.instant('misc.farmers'),
            this.tranlsate.instant('misc.companies'),
          ],
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
  /* istanbul ignore next */
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
  /* istanbul ignore next */
  inviteConnection(action: any): void {
    const schainId = localStorage.getItem('supplyChainId');
    if (action.supply_chain === schainId) {
      this.routeService.navigateUrl('/connections');
    } else {
      this.util.supplyChainData$.next(action.supply_chain);
      this.routeService.navigateUrl('/connections');
    }
  }
  /* istanbul ignore next */
  viewCompanyProfile(): void {
    this.routeService.navigateUrl('/company-profile');
  }
  /* istanbul ignore next */
  trackByFn(index: number): number {
    return index;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
    this.store.resetState();
    this.util.allSupplyChain$.next(false);
  }
}
