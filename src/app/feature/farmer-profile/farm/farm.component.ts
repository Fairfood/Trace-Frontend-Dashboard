/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
// material modules
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// component and services
import { NewPlotComponent } from '../new-plot';
import { LoaderComponent } from 'fairfood-utils';
import { ListDetailComponent } from '../list-detail';
import { FarmerProfileStoreService } from '../';
import { UtilService } from 'src/app/shared/service';
// configs and constants
import {
  IFarmerDetails,
  IReference,
  PLOT_TYPES,
} from '../farmer-profile.config';
import { ICommonObj, IListWithIndex } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

@Component({
  selector: 'app-farm',
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    GoogleMapsModule,
    LoaderComponent,
    NewPlotComponent,
    ListDetailComponent,
    TranslateModule,
  ],
})
export class FarmComponent implements OnInit, OnDestroy {
  farmList: any;
  pageApis: Subscription[] = [];
  plotArray: any[];
  activeId: number;
  activePlotDetails: any;
  farmerData: IFarmerDetails;
  loading = true;
  center: google.maps.LatLngLiteral;
  zoom = 10;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
  apiLoaded: Observable<boolean>;
  plotTypes: ICommonObj[] = PLOT_TYPES;
  map: google.maps.Map;
  mapDefaultOptions = {
    mapTypeControl: false,
    fullscreenControl: false,
  };
  geoJsonType = '';

  constructor(
    public dialog: MatDialog,
    private store: FarmerProfileStoreService,
    private dataService: UtilService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.apiLoaded = this.dataService.mapInitialized$;
    const api = this.store.plots$.subscribe({
      next: (res: IReference) => {
        const { loading, results } = res;
        this.farmList = [];
        this.loading = loading;
        if (!loading && results.length > 0) {
          this.plotArray = results.map((item: any) => {
            const { name, province, country, location_type } = item;
            const nameDesc = PLOT_TYPES.find(a => a.id === location_type).name;
            let desc = '';
            if (province && country) {
              desc = `${province}, ${country}`;
            } else {
              desc = this.translate.instant(nameDesc);
            }
            this.farmList.push({
              title: name,
              description: desc,
              rightIcon: {
                isMatIcon: true,
                icon: 'keyboard_arrow_right',
              },
            });
            return {
              ...item,
              address: desc,
            };
          });
          this.plotSelected({ index: 0, item: this.farmList[0] });
        }
      },
    });
    this.pageApis.push(api);

    const sub = this.store.farmerDetails$.subscribe({
      next: (res: IFarmerDetails) => {
        this.farmerData = res;
      },
    });
    this.pageApis.push(sub);
  }

  plotSelected({ index }: IListWithIndex): void {
    this.geoJsonType = '';
    this.activeId = index;
    this.activePlotDetails = this.plotArray[index];

    if (this.activePlotDetails) {
      const { latitude, longitude, location_type, geo_json } =
        this.activePlotDetails;

      const geoJson = JSON.parse(geo_json);

      this.activePlotDetails.plotType = this.plotTypes.find(
        a => a.id === location_type
      ).name;
      this.markerPositions = [];
      if (
        [this.plotTypes[0].id, this.plotTypes[1].id].includes(location_type)
      ) {
        this.markerPositions.push({
          lat: latitude,
          lng: longitude,
        });
        this.center = {
          lat: latitude,
          lng: longitude,
        };
        this.zoom = 10;
      } else if (geoJson?.geometry?.type == 'Point') {
        this.geoJsonType = 'Point';
        this.markerPositions.push({
          lat: geoJson?.geometry?.coordinates[0],
          lng: geoJson?.geometry?.coordinates[1],
        });
        this.center = {
          lat: geoJson?.geometry?.coordinates[0],
          lng: geoJson?.geometry?.coordinates[1],
        };
        this.zoom = 10;
      } else {
        this.drawPolygon(geo_json);
      }
    }
  }

  /* istanbul ignore next */
  drawPolygon(geo_json: string): void {
    const geoJson = JSON.parse(geo_json);
    const bounds = new google.maps.LatLngBounds();
    // geojson format
    const actualCoordinates = geoJson.geometry.coordinates[0];
    actualCoordinates.forEach((element: any[]) => {
      const [lng, lat] = element;
      this.markerPositions.push({
        lat,
        lng,
      });
      bounds.extend({
        lat,
        lng,
      });
    });
    this.center = {
      lat: bounds.getCenter().lat(),
      lng: bounds.getCenter().lng(),
    };
    this.zoom = 15;
  }

  /* istanbul ignore next */
  mapReady(map: google.maps.Map): void {
    this.map = map;
  }

  /* istanbul ignore next */
  createPlot(isEdit?: boolean): void {
    const data: any = {
      farmer: this.farmerData.id,
      isEdit: isEdit ?? false,
    };

    if (isEdit) {
      data.plot = this.activePlotDetails;
    }
    const dialogRef = this.dialog.open(NewPlotComponent, {
      disableClose: true,
      minWidth: '42vw',
      maxWidth: '45vw',
      height: 'auto',
      panelClass: 'custom-modalbox',
      data,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchEverything();
      }
    });
  }

  fetchEverything(): void {
    this.store.fetchFarmerPlots(this.farmerData?.id);
    this.store.getFarmerDetails(this.farmerData?.id);
  }

  /* istanbul ignore next */
  deletePlot(id: string): void {
    const api = this.store.deletePlot(id).subscribe(() => {
      this.dataService.customSnackBar(
        'Plot deleted successfully',
        ACTION_TYPE.SUCCESS
      );
      this.fetchEverything();
    });
    this.pageApis.push(api);
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
