import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// components
import { DashboardComponent } from './dashboard.component';
// standalone
import { LoaderComponent, ButtonsComponent } from 'fairfood-utils';
import { ChartDonutComponent } from 'src/app/shared/components/chart-donut';
import { SupplyChainOverviewComponent } from './supply-chain-overview';
import { RecentTransactionComponent } from './recent-transaction';
import { DashboardMapViewComponent } from './dashboard-map-view';

// routes
export const layout: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
];
@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    MatProgressBarModule,
    ChartDonutComponent,
    RouterModule.forChild(layout),
    LoaderComponent,
    ButtonsComponent,
    RecentTransactionComponent,
    SupplyChainOverviewComponent,
    DashboardMapViewComponent,
  ],
})
export class DashboardModule {}
