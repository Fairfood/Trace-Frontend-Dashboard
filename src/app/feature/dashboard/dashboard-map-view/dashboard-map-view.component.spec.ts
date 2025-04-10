// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { DashboardMapViewComponent } from './dashboard-map-view.component';
// import { DashboardStoreService } from '../dashboard-store.service';
// import { DashboardService } from '../dashboard.service';
// import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { IDashboardStatistics } from '../dashboard.model';
// import { FairFoodCustomTabComponent, LoaderComponent } from 'fairfood-utils';
// import { GoogleMapsModule } from '@angular/google-maps';
// import { CommonModule } from '@angular/common';
// import { ChartDonutComponent } from 'src/app/shared/components/chart-donut';
// import { BehaviorSubject } from 'rxjs';

// const GloablMock: IDashboardStatistics = {
//   farmer_count: 10,
//   operation_stats: {
//     farmer: [{ name: 'Collector', count: 5 }],
//     supplier: [
//       { name: 'Supplier1', count: 8 },
//       { name: 'Supplier2', count: 12 },
//     ],
//   },
//   active_actor_count: 13,
//   actor_count: 13,
//   chain_length: 13,
//   company_count: 13,
//   invited_actor_count: 13,
//   mapped_actor_count: 13,
//   pending_invite_count: 13,
//   supplier_count: 13,
//   supply_chain_count: 13,
//   tier_count: 13,
//   traceable_chain_percentage: 13,
//   traceable_chains: 13,
// };

// class mockStoreService {
//   dashboardData$ = new BehaviorSubject({
//     farmers: [
//       {
//         latitude: 39.949925,
//         longitude: 20.097533,
//       },
//       {
//         latitude: -14.32483,
//         longitude: -170.71892,
//       },
//       {
//         latitude: 10.352959,
//         longitude: 76.511975,
//       },
//     ],
//     suppliers: [
//       {
//         latitude: 10.352959,
//         longitude: 76.511975,
//       },
//       {
//         latitude: 39.390897,
//         longitude: -99.066067,
//       },
//       {
//         latitude: 16.5,
//         longitude: 80.6,
//       },
//     ],
//   });
//   statistics$ = {
//     subscribe: jasmine.createSpy('subscribe'),
//   };
//   udpateStatistics = jasmine.createSpy('udpateStatistics');
//   updateWholeData = jasmine.createSpy('updateWholeData');
// }

// describe('DashboardMapViewComponent', () => {
//   let component: DashboardMapViewComponent;
//   let fixture: ComponentFixture<DashboardMapViewComponent>;
//   let storeServiceSpy: jasmine.SpyObj<DashboardStoreService>;

//   beforeEach(() => {
//     const dashboardService = jasmine.createSpyObj('DashboardService', [
//       'getChartTheme',
//       'getMapTheme',
//       'mapLoaded',
//     ]);

//     const translateService = jasmine.createSpyObj('TranslateService', [
//       'instant',
//     ]);

//     // Mock the google object
//     (window as any).google = {
//       maps: {
//         Marker: jasmine.createSpy('Marker'),
//         LatLngBounds: jasmine.createSpyObj('LatLngBounds', ['extend']),
//       },
//     };

//     TestBed.configureTestingModule({
//       imports: [
//         CommonModule,
//         GoogleMapsModule,
//         LoaderComponent,
//         ChartDonutComponent,
//         FairFoodCustomTabComponent,
//         TranslateModule,
//         DashboardMapViewComponent,
//       ],
//       providers: [
//         { provide: DashboardService, useValue: dashboardService },
//         { provide: DashboardStoreService, useClass: mockStoreService },
//         { provide: TranslateService, useValue: translateService },
//       ],
//     });

//     fixture = TestBed.createComponent(DashboardMapViewComponent);
//     component = fixture.componentInstance;
//     storeServiceSpy = TestBed.inject(
//       DashboardStoreService
//     ) as jasmine.SpyObj<DashboardStoreService>;

//     const mockStatistics: IDashboardStatistics = {
//       farmer_count: 10,
//       operation_stats: {
//         farmer: [{ name: 'Collector', count: 5 }],
//         supplier: [
//           { name: 'Supplier1', count: 8 },
//           { name: 'Supplier2', count: 12 },
//         ],
//       },
//       active_actor_count: 13,
//       actor_count: 13,
//       chain_length: 13,
//       company_count: 13,
//       invited_actor_count: 13,
//       mapped_actor_count: 13,
//       pending_invite_count: 13,
//       supplier_count: 13,
//       supply_chain_count: 13,
//       tier_count: 13,
//       traceable_chain_percentage: 13,
//       traceable_chains: 13,
//     };

//     storeServiceSpy.udpateStatistics(mockStatistics);
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should handle tab change correctly', () => {
//     storeServiceSpy.updateWholeData(GloablMock);

//     spyOn(component, 'resetMap');

//     component.changeTab({ id: 'farmer', name: 'Farmer' });

//     expect(component.activeTabId).toBe('farmer');
//     expect(component.resetMap).toHaveBeenCalled();
//   });

//   it('should reset the map correctly', () => {
//     const mockMarkerCluster = {
//       clearMarkers: jasmine.createSpy('clearMarkers'),
//     };
//     component.markerCluster = mockMarkerCluster;

//     component.resetMap();

//     expect(mockMarkerCluster.clearMarkers).toHaveBeenCalled();
//     expect(component.markerCluster).toBeNull();
//   });

//   it('should handle ngOnDestroy correctly', () => {
//     const mockSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') };
//     component.pageApis = [mockSubscription as any];

//     component.ngOnDestroy();

//     expect(mockSubscription.unsubscribe).toHaveBeenCalled();
//   });
// });
