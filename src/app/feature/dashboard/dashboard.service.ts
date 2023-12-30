/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// services
import { StorageService, UtilService } from 'src/app/shared/service';
import { DashboardStoreService } from './dashboard-store.service';
import { CompanyProfileService } from '../company-profile/company-profile.service';

// configs
import { environment } from 'src/environments/environment';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import { IMapTheme } from './dashboard.model';
import {
  IActivity,
  ICommonAPIResponse,
} from 'src/app/shared/configs/app.model';
import { ITransactionData } from '../transactions/transactions.model';

const BASE_URL = environment.baseUrl;

/**
 * Service responsible for providing data to the Dashboard component.
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private store: DashboardStoreService,
    private util: UtilService,
    private companyService: CompanyProfileService
  ) {}

  /**
   * Retrieves the supply chain data from local storage.
   * @returns Supply chain data.
   */
  supplyChainData(): string {
    return this.storage.retrieveStoredData('supplyChainId');
  }

  /**
   * Retrieves and updates the status data for a specific label in the dashboard.
   * @param label - The label for which to retrieve the status data.
   * @param supplyChain - Optional supply chain filter.
   */
  getStatus(label: string, supplyChain = ''): void {
    const url = `${BASE_URL}/dashboard/stats/?supply_chain=${
      supplyChain === 'All' ? '' : this.supplyChainData()
    }&labels=${label}`;
    this.http
      .get(url, headerOptions(HTTP_OPTION_4))
      .pipe(
        tap((res: Partial<{ data: any }>) => {
          const { data } = res;

          const { statistics, ...rest } = data;
          this.store.udpateStatistics(statistics);
          this.store.updateWholeData(rest);
        })
      )
      .subscribe();
  }

  /**
   * Retrieves the primary theme colors.
   * @returns Array of primary theme colors.
   */
  getPrimaryTheme(): string[] {
    const theme = this.util.theme;
    return [theme.colour_primary_alpha, theme.colour_primary_beta];
  }

  /**
   * Retrieves the chart theme colors.
   * @returns Object containing chart theme colors.
   */
  getChartTheme(): string[] {
    return this.util.theme.graphColors;
  }

  /**
   * Observable indicating whether the map has been loaded.
   * @returns Observable of boolean indicating map loaded status.
   */
  mapLoaded(): Observable<boolean> {
    return this.util.mapInitialized$;
  }

  /**
   * Retrieves the map theme colors.
   * @returns Object containing map theme colors.
   */
  getMapTheme(): IMapTheme {
    const theme = this.util.theme;
    const {
      colour_map_background,
      colour_map_marker,
      colour_map_clustor,
      colour_map_marker_text,
    } = theme;
    return {
      colour_map_background,
      colour_map_marker,
      colour_map_clustor,
      colour_map_marker_text,
    };
  }

  /**
   * Retrieves the most recent transactions.
   * @param allSupplyChain - Optional parameter to include transactions from all supply chains.
   * @returns Observable of recent transactions.
   */
  getRecentTransactions(
    allSupplyChain = ''
  ): Observable<ICommonAPIResponse<ITransactionData>> {
    const url = `${BASE_URL}/transactions/external/?supply_chain=${
      allSupplyChain === 'All' ? '' : this.supplyChainData()
    }&limit=5`;
    return this.http
      .get(url, headerOptions(HTTP_OPTION_4))
      .pipe(map(successFormatter));
  }

  /**
   * Retrieves recent activities.
   * @returns Observable of recent activities.
   */
  activities(): Observable<IActivity[]> {
    return this.companyService.activityLog(5).pipe(
      map((response: ICommonAPIResponse<IActivity>) => {
        return response.results;
      })
    );
  }
}
