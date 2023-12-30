/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import MarkerClusterer from '@googlemaps/markerclustererplus';

import { TraceStoreService } from '../trace-store.service';
import { UtilService } from 'src/app/shared/service';
declare const google: any;

@Component({
  selector: 'app-tr-mapview',
  templateUrl: './tr-mapview.component.html',
})
export class TrMapviewComponent implements OnInit, OnDestroy {
  lat = 51.673858;
  lng = 7.815982;
  map: any;
  googleMapObj: any;
  markerSmall: any;
  markerBig: any;
  mapPolylines: any[] = [];
  markerIcon: any;
  selectedMarkerIcon: any;
  infoWindow: any;
  markers: any[] = [];
  markerCluster: any;
  gMapLoaded = false;
  mapActors: any[];
  mapDefaultOptions = {
    mapTypeControl: false,
    fullscreenControl: false,
    minZoom: 2,
    maxZoom: 8,
    options: {
      gestureHandling: 'greedy',
    },
  };
  polygonMap: any;
  stages: any;
  stagesLoaded: boolean;
  pageApis: Subscription[] = [];
  actorLoaded: boolean;

  @ViewChild('mapIdentifier', { read: ElementRef })
  public googleMap: ElementRef<any>;

  apiLoaded: Observable<boolean>;

  constructor(private store: TraceStoreService, private utils: UtilService) {}

  ngOnInit(): void {
    this.apiLoaded = this.utils.mapInitialized$;
    const sub1 = this.store.mapCordinates$.subscribe({
      next: (res: any) => {
        this.mapActors = res;
        this.actorLoaded = true;
      },
    });

    const stageSub = this.store.transactionStages$.subscribe({
      next: (res: any) => {
        this.stages = res;
        this.stagesLoaded = true;
      },
    });

    this.pageApis.push(sub1);
    this.pageApis.push(stageSub);
  }

  // Intialize map , markers , infowindow etc
  initialiseActorSubscription(): void {
    const actorSub = this.store.actorsData$.subscribe({
      next: (res: any) => {
        // when stage changes update mapview to focus on the selected actor
        if (this.polygonMap) {
          this.polygonMap.setMap(null);
        }
        this.setMapView(res, 'stage');
      },
    });
    this.pageApis.push(actorSub);
  }

  // Intialize map , markers , infowindow etc
  mapReady(map: any): void {
    this.googleMapObj = map;
    this.createMapJourney();
  }

  // set marker icon
  private setMapStyle() {
    const markerSmallSvg = [
      '<?xml version="1.0"?>',
      '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle class="fill-secondary" cx="4.99988" cy="4.99994" r="5" fill="#003a60"/>',
      '</svg>',
    ].join('\n');
    const markerBigSvg = [
      '<?xml version="1.0"?>',
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle class="fill-secondary" cx="20" cy="20" r="18" fill="#003a60"/>',
      '<circle class="stroke-secondary" cx="20" cy="20" r="14.5" stroke="#003a60"/>',
      '</svg>',
    ].join('\n');
    this.markerSmall = markerSmallSvg;
    this.markerBig = markerBigSvg;
  }

  // create map journey
  createMapJourney(): void {
    this.setMapStyle();

    // marker icon for actors
    this.markerIcon = {
      url: 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(this.markerSmall),
      scaledSize: new google.maps.Size(10, 10),
      anchor: new google.maps.Point(5, 5),
    };
    // marker icon for selected actors
    this.selectedMarkerIcon = {
      url: 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(this.markerBig),
      size: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 20),
      zIndex: 100,
    };
    // Intializing info window
    this.infoWindow = new google.maps.InfoWindow();
    // Intializing markers
    for (const actor of this.mapActors) {
      const marker = new google.maps.Marker({
        position: {
          lat: actor.latitude,
          lng: actor.longitude,
        },
        icon: this.markerIcon,
        title: actor.name, //+ ' (' + stage.actor_name + ')',
        optimized: false,
      });
      marker['customInfo'] = actor;
      this.markers.push(marker);
    }
    // Adding markers to cluster
    this.markerCluster = new MarkerClusterer(this.googleMapObj, this.markers, {
      styles: [
        {
          textColor: 'white',
          url:
            'data:image/svg+xml;charset=UTF-8;base64,' + btoa(this.markerBig),
          height: 40,
          width: 40,
        },
        {
          textColor: 'white',
          url:
            'data:image/svg+xml;charset=UTF-8;base64,' + btoa(this.markerBig),
          height: 40,
          width: 40,
        },
        {
          textColor: 'white',
          url:
            'data:image/svg+xml;charset=UTF-8;base64,' + btoa(this.markerBig),
          height: 40,
          width: 40,
        },
      ],
      gridSize: 10,
    });
    // ploting polylines and setting intial view of map (full journey)
    setTimeout(() => {
      this.setMapView(this.markers, 'fullchain');
      this.plotPolyLines(
        this.markerCluster.clusters_,
        this.markerCluster.markers_
      );
    }, 1000);
    setTimeout(() => {
      this.initialiseActorSubscription();
    }, 2000);
  }

  // function to set mapview based on stage
  setMapView(markers: any, type: string): void {
    const bounds = new google.maps.LatLngBounds();
    let actorDetails;
    for (const marker of markers) {
      if (type === 'fullchain') {
        actorDetails = marker.customInfo;
      } else {
        actorDetails = marker;
      }
      bounds.extend(
        new google.maps.LatLng(actorDetails.latitude, actorDetails.longitude)
      );
    }
    this.googleMapObj.fitBounds(bounds);
  }

  // ploting polyline between markers
  plotPolyLines(clusters: any, markers: any) {
    this.removeAllLine();
    let position1, position2;
    for (const marker of markers) {
      position1 = this.findMarkerPosition(marker, clusters);
      for (const connection of marker.customInfo.connected_to) {
        const connectedMarker = markers.find(
          (mark: any) => mark.customInfo.id === connection
        );
        position2 = this.findMarkerPosition(connectedMarker, clusters);
        if (position1 && position2) {
          this.drawLine(
            position1.lat(),
            position1.lng(),
            position2.lat(),
            position2.lng()
          );
        }
      }
    }
  }

  // remove all polylines from map
  removeAllLine(): void {
    for (const line of this.mapPolylines) {
      line.setMap(null);
    }
    this.mapPolylines = [];
  }

  // Search marker in clusters etc and find coridnates of that marker
  findMarkerPosition(marker: any, cluster: any): any {
    if (marker) {
      let clusterIndex;
      for (let i = 0; i < cluster.length; i++) {
        const index = cluster[i].markers_.indexOf(marker);
        if (index !== -1) {
          clusterIndex = i;
          break;
        }
      }
      if (clusterIndex) {
        return this.markerCluster.clusters_[clusterIndex].center_;
      } else {
        return marker.position;
      }
    }
  }

  // Draw polyline in map based on connection status
  drawLine(lat1: any, lng1: any, lat2: any, lng2: any): void {
    const linePath = [
      { lat: lat1, lng: lng1 },
      { lat: lat2, lng: lng2 },
    ];
    const lineOptions = {
      path: linePath,
      map: this.googleMapObj,
      strokeColor: '#003a60',
      strokeOpacity: 1,
      strokeWeight: 1,
      geodesic: false,
    };
    const line = new google.maps.Polyline(lineOptions);
    this.mapPolylines.push(line);
  }

  // method to plot polygon
  plotPolygon(arr: any[]): void {
    const triangleCoords: any[] = [];
    arr.forEach(e => {
      const cords = {
        lat: e[0],
        lng: e[1],
      };
      triangleCoords.push(cords);
    });

    // Construct the polygon.
    this.polygonMap = new google.maps.Polygon({
      paths: triangleCoords,
      strokeColor: '#700f0d',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#700f0d',
      fillOpacity: 0.35,
    });
    this.polygonMap.setMap(this.googleMapObj);
    const bounds = new google.maps.LatLngBounds();
    for (const markers of triangleCoords) {
      bounds.extend(new google.maps.LatLng(markers.lat, markers.lng));
    }

    this.googleMapObj.fitBounds(bounds);
    setTimeout(() => {
      this.googleMap.nativeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
      });
    });
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
