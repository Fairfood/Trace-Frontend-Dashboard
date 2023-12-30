/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

import { NewPlotComponent } from '../new-plot/new-plot.component';
import { FarmerProfileStoreService } from '../farmer-profile-store.service';

import { IFarmerDetails, IReference } from '../farmer-profile.config';
import { UtilService } from 'src/app/shared/service';
import { IListWithIndex } from 'src/app/shared/configs/app.model';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
@Component({
  selector: 'app-farm',
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss'],
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
  zoom = 2;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPositions: google.maps.LatLngLiteral[] = [];
  apiLoaded: Observable<boolean>;
  constructor(
    public dialog: MatDialog,
    private store: FarmerProfileStoreService,
    private dataService: UtilService
  ) {}

  ngOnInit(): void {
    this.apiLoaded = this.dataService.mapInitialized$;
    const api = this.store.plots$.subscribe({
      next: (res: IReference) => {
        const { loading, results } = res;
        this.farmList = [];
        this.loading = loading;
        if (!loading) {
          this.plotArray = results.map((item: any) => {
            const { name, province, country } = item;
            const desc = `${province}, ${country}`;
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
    this.activeId = index;
    this.activePlotDetails = this.plotArray[index];
    const { latitude, longitude } = this.activePlotDetails;
    this.markerPositions = [];
    this.markerPositions.push({
      lat: latitude,
      lng: longitude,
    });
    this.center = {
      lat: latitude,
      lng: longitude,
    };
  }

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
    this.store.fetchFarmerPlots(this.farmerData.id);
    this.store.getFarmerDetails(this.farmerData.id);
  }

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

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
