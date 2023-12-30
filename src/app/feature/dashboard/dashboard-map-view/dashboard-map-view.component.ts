/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
// maps related services
import { GoogleMapsModule } from '@angular/google-maps';
import MarkerClusterer from '@googlemaps/markerclustererplus';
// model, config
import { ICommonObj } from 'src/app/shared/configs/app.model';
import {
  IChartData,
  IDashboardStatistics,
  IDashboardStatus,
  IStatItem,
} from '../dashboard.model';
import { MAPVIEW_TABS } from '../dashboard.config';

declare const google: any;
// services
import { mapStyle } from 'src/app/shared/service';
import { DashboardService } from '../dashboard.service';
import { DashboardStoreService } from '../dashboard-store.service';
// components
import { FairFoodCustomTabComponent, LoaderComponent } from 'fairfood-utils';
import { ChartDonutComponent } from 'src/app/shared/components/chart-donut';

/**
 * Component responsible for displaying the map view on the dashboard.
 */
@Component({
  selector: 'app-dashboard-map-view',
  templateUrl: './dashboard-map-view.component.html',
  styleUrls: ['./dashboard-map-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsModule,
    LoaderComponent,
    ChartDonutComponent,
    FairFoodCustomTabComponent,
  ],
})
export class DashboardMapViewComponent implements OnInit {
  dashboardData: IDashboardStatus;
  tabGroup: ICommonObj[] = MAPVIEW_TABS;
  activeTabId: string = MAPVIEW_TABS[0].id;
  chartData: IChartData;
  chartDataSupplier: IChartData;
  statistics: IDashboardStatistics;
  dataLoaded: boolean;
  pageApis: Subscription[] = [];
  graphColors: string[];
  // map related
  apiLoaded: Observable<boolean>;
  googleMapObj: any;
  mapDefaultOptions = {
    mapTypeControl: false,
    fullscreenControl: true,
    minZoom: 2,
    maxZoom: 8,
    options: {
      gestureHandling: 'greedy',
    },
  };
  markerCluster: any;
  clusterSmall: string;
  clusterBig: string;

  /**
   * Initializes the DashboardMapViewComponent with required services.
   * @param store - Dashboard store service for managing dashboard data.
   * @param dashboardService - Dashboard service for fetching data.
   */
  constructor(
    private store: DashboardStoreService,
    private dashboardService: DashboardService
  ) {
    this.chartData = { labels: [], values: [], colors: [] };
    this.chartDataSupplier = { labels: [], values: [], colors: [] };
  }

  /**
   * Lifecycle hook called after component initialization.
   * Subscribes to statistics and dashboard data changes.
   */
  ngOnInit(): void {
    const sub1 = this.store.statistics$.subscribe(
      (res: IDashboardStatistics) => {
        if (res) {
          this.statistics = res;
          this.graphColors = this.dashboardService.getChartTheme();
          this.generateFarmerChartData();
          this.generateSupplierChartData();
        }
      }
    );
    this.pageApis.push(sub1);

    const sub2 = this.store.dashboardData$.subscribe(
      (res: IDashboardStatus) => {
        if (res) {
          this.dashboardData = res;
          this.resetMap();
          setTimeout(() => {
            this.plotActors(res.farmers);
          }, 2000);
        }
      }
    );
    this.pageApis.push(sub2);
    this.apiLoaded = this.dashboardService.mapLoaded();
  }

  /**
   * Generates chart data for farmers.
   */
  generateFarmerChartData(): void {
    const { farmer_count, operation_stats } = this.statistics;

    if (operation_stats.farmer) {
      let collectorCount = 0;
      operation_stats?.farmer.forEach((item: IStatItem) => {
        const { name, count } = item;
        if (name === 'Collector') {
          collectorCount = count;
        }
      });
      this.statistics.collectorCount = collectorCount;
      this.chartData = {
        labels: ['Farmers', 'Collectors'],
        values: [farmer_count, collectorCount],
        colors: this.dashboardService.getPrimaryTheme(),
      };
    }
    this.dataLoaded = true;
  }

  /**
   * Generates chart data for suppliers.
   */
  generateSupplierChartData(): void {
    const { operation_stats } = this.statistics;
    if (operation_stats.supplier) {
      operation_stats.supplier.forEach((item: IStatItem) => {
        const { name, count } = item;
        this.chartDataSupplier.labels.push(name);
        this.chartDataSupplier.values.push(count);
      });
      this.chartDataSupplier.colors = this.graphColors;
    }
    this.dataLoaded = true;
  }

  /**
   * Handles tab change event and resets the map.
   * @param item - Selected tab item.
   */
  changeTab(item: ICommonObj): void {
    this.activeTabId = item.id;
    this.resetMap();
    if (item.id === 'farmer') {
      setTimeout(() => {
        this.plotActors([...this.dashboardData.farmers]);
      }, 2000);
    } else {
      setTimeout(() => {
        this.plotActors([...this.dashboardData.suppliers]);
      }, 2000);
    }
  }

  /**
   * Resets the map by clearing all markers.
   */
  resetMap(): void {
    if (this.markerCluster) {
      this.markerCluster.clearMarkers();
      this.markerCluster = null;
    }
  }

  /**
   * Plots actors on the map.
   * @param actors - List of actors (farmers or suppliers).
   */
  plotActors(actors: any): void {
    const theme = this.dashboardService.getMapTheme();
    const markerFarms: any[] = [];
    const markerIcon = {
      url: this.clusterSmall,
      size: new google.maps.Size(100, 100),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 10),
      zIndex: 100,
    };
    for (const farmer of actors) {
      const marker = new google.maps.Marker({
        position: {
          lat: farmer.latitude,
          lng: farmer.longitude,
        },
        icon: markerIcon,
        // customInfo: farmer,
        optimized: false,
      });
      marker['customInfo'] = farmer;
      markerFarms.push(marker);
    }
    this.markerCluster = new MarkerClusterer(this.googleMapObj, markerFarms, {
      styles: [
        {
          textColor: theme.colour_map_marker_text,
          url: this.clusterBig,
          height: 26,
          width: 26,
          textLineHeight: 26,
        },
      ],
      gridSize: 25,
    });
    setTimeout(() => {
      this.setMapView(markerFarms);
    }, 2000);
  }

  /**
   * Sets the map view based on the plotted connections.
   * @param markerFarms - List of marker objects.
   */
  setMapView(markerFarms: any[]): void {
    if (markerFarms.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      for (const marker of markerFarms) {
        bounds.extend(
          new google.maps.LatLng(marker.position.lat(), marker.position.lng())
        );
      }
      this.googleMapObj.fitBounds(bounds);
    }
  }

  /**
   * Callback when the map is ready.
   * @param map - Google Maps object.
   */
  mapReady(map: any): void {
    this.googleMapObj = map;
    this.initMapTheme();
  }

  /**
   * Initializes the map theme based on the application theme.
   */
  initMapTheme(): void {
    const theme = this.dashboardService.getMapTheme();
    mapStyle[1].stylers[0] = { color: theme.colour_map_background };
    mapStyle[2].stylers[0] = { color: theme.colour_map_background };

    const clusterSmallSvg = [
      '<?xml version="1.0"?>',
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle cx="10" cy="10" r="8" fill="{{ color }}"/>',
      '</svg>',
    ].join('\n');
    const clusterBigSvg = [
      '<?xml version="1.0"?>',
      '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle cx="13" cy="13" r="13" fill="{{ color }}"/>',
      '</svg>',
    ].join('\n');

    this.clusterSmall = clusterSmallSvg.replace(
      '{{ color }}',
      theme.colour_map_marker
    );
    this.clusterSmall =
      'data:image/svg+xml;charset=UTF-8;base64,' + btoa(this.clusterSmall);

    this.clusterBig = clusterBigSvg.replace(
      '{{ color }}',
      theme.colour_map_clustor
    );
    this.clusterBig =
      'data:image/svg+xml;charset=UTF-8;base64,' + btoa(this.clusterBig);
    this.googleMapObj.setOptions({
      styles: mapStyle,
    });
  }

  /**
   * Track by function for ngFor.
   * @param index - Index of the item.
   * @returns The index.
   */
  trackByFnCommon(index: number): number {
    return index;
  }

  /**
   * Lifecycle hook called before the component is destroyed.
   * Unsubscribes from subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
