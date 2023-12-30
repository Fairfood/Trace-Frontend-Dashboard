/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseStoreService } from 'src/app/shared/store/base-store.service';
import { IDashboardStatistics, IDashboardStatus } from './dashboard.model';

interface DashboardState {
  statistics: IDashboardStatistics;
  dashboardData: IDashboardStatus;
}

const initialState: DashboardState = {
  statistics: null,
  dashboardData: null,
};

@Injectable({
  providedIn: 'root',
})
export class DashboardStoreService extends BaseStoreService<DashboardState> {
  statistics$: Observable<IDashboardStatistics> = this.select(
    (state: DashboardState) => {
      return state.statistics;
    }
  );

  dashboardData$: Observable<IDashboardStatus> = this.select(
    (state: DashboardState) => {
      return state.dashboardData;
    }
  );

  constructor() {
    super(initialState);
  }

  udpateStatistics(data: IDashboardStatistics): void {
    this.setState({
      statistics: data,
    });
  }

  updateWholeData(data: any): void {
    this.setState({
      dashboardData: data,
    });
  }

  resetState(): void {
    this.setState(initialState);
  }
}
