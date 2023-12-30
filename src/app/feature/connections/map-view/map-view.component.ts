/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

import { ConnectionService } from '../connections.service';
import { StorageService, UtilService, mapStyle } from 'src/app/shared/service';

import { ConnectionTypeSelectionComponent } from '../connection-type-selection';
import { ListViewService } from '../list-view/list-view.service';
declare const google: any;
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  nodeId = this.storage.retrieveStoredData('companyID');
  mapImages: any;
  mapLoaded: boolean;
  // mapview variables
  infoWindow: any;
  loaderConnection = true;
  mapData: any = [];
  // Map property variables
  mapZoom = 2;
  minZoom = 2;
  mapLat = 0.0;
  mapLng = 0.0;
  mapStyle = mapStyle;
  map: any;
  markerIcon: any;
  markerIconMe: any;
  selectedMarkerIconMe: any;
  selectedMarkerIcon: any;
  streamSelectedIcon: any;
  markerMe: any;
  selectedMarker: any;
  markers: any = [];
  markerCluster: any;
  mapPolylines: any = [];
  mapStreamlines: any = [];
  connectionStream: any = [];
  connectionStreamMarkers: any = [];

  connectionLabelLines: any = [];
  connectionLabelMarkers: any = [];

  selectedMarkerInCluster: any;
  selectmarkerIdCluster: any;
  mapBounds: any = null;
  mapDetailBox = false;
  legendOpen = true;
  farmerList: any;
  selectedCompany: any;
  selectedCompanyId: any;
  supplierTierLength: any;
  buyerTierLength: any;
  tierData: any;
  currentTheme: any;
  selectedConnectionLabel: string;
  pageApis: Subscription[] = [];
  selectedSupplyChain: any = this.storage.retrieveStoredData('supplyChainId');
  selectedChainName: string =
    this.storage.retrieveStoredData('supplyChainName');
  supplyChainList: any;
  connectionsData: any;

  mapDefaultOptions = {
    mapTypeControl: false,
    fullscreenControl: false,
    minZoom: 2,
    maxZoom: 8,
    options: {
      gestureHandling: 'greedy',
    },
  };

  supply_for_selected: any[];
  supply_for: any[];

  connectionLabels: any[] = [];
  editConnection: boolean;
  apiLoaded: Observable<boolean> = this.utils.mapInitialized$;
  submitted: boolean;
  memberType = +this.storage.retrieveStoredData('memberType');

  // Listening to click events in info window and calling corresponding function based on key (#id in element 'key-id')
  @HostListener('click', ['$event.target.id']) onClick(id: any) {
    let windowElement;
    const key = id.split('-');
    if (id) {
      if (key[0] === 'view') {
        this.goToActor(id.split('-')[1]);
      }
      if (key[0] === 'close') {
        this.infoWindow.close();
      }
      if (key[0] === 'welcome') {
        localStorage.setItem('first', 'true');
        this.infoWindow.close();
      }
      if (key[0] === 'add') {
        this.connectionType(id.split('-')[1]);
      }
      if (key[0] === 'actordetail') {
        this.selectedMarkerInCluster = this.markers.find(
          (mark: any) => mark.customInfo.id === id.split('-')[2]
        );
        windowElement = document.getElementById(
          'actordetail-3-' + this.selectmarkerIdCluster
        );
        if (windowElement) {
          windowElement.style.backgroundColor = '#003a60';
        }
        this.selectmarkerIdCluster = this.selectedMarkerInCluster.customInfo.id;
        windowElement = document.getElementById(
          'actordetail-3-' + this.selectmarkerIdCluster
        );
        windowElement.style.backgroundColor = this.currentTheme
          ? this.currentTheme.colour_map_selected
          : '#EA2553';
        this.traceConnectedActors(this.selectedMarkerInCluster);
      }
    }
  }
  constructor(
    private connectionService: ConnectionService,
    public dialog: MatDialog,
    private storage: StorageService,
    private utils: UtilService,
    private listViewService: ListViewService
  ) {
    this.mapImages = {
      clusterSmall: '../../../../assets/images/marker_blue.svg',
      clusterBig: '../../../../assets/images/cluster_big.svg',
      myCompany: '../../../../assets/images/mycompany.png',
      actors: '../../../../assets/images/actors.png',
      activeActors: '../../../../assets/images/active_actors.png',
      clusteredImg: '../../../../assets/images/clustered.png',
      verifiedConnectionImg:
        '../../../../assets/images/Verified_connection.png',
      claimedConnectionImg: '../../../../assets/images/Claimed_connection.png',
      activeConnectionsImg: '../../../../assets/images/Active_connection.png',
      mySelected: '../../../../assets/images/my_selected.svg',
      pseudoSelected: '../../../../assets/images/pseudo_selected.svg',
      my_company: '../../../../assets/images/my_company.svg',
    };
  }

  ngOnInit(): void {
    // if (this.storage.retrieveStoredData('theme-type') === 'custom') {
    // } else {
    //   this.mapLoaded = true;
    // }

    const screenSize = window.screen.width;
    if (screenSize > 1400) {
      this.minZoom = 3;
    }

    this.loadSupplyChain();
  }

  initSubscriptions(): void {
    // Method to observe & update latest emitted supplychain data (Behaviour subject)
    const api = this.utils.supplyChainData$.subscribe(supplyChainId => {
      this.selectedSupplyChain =
        supplyChainId || this.storage.retrieveStoredData('supplyChainId');
      this.initCalls();
    });
    this.pageApis.push(api);
    this.initCalls();
  }

  initCalls(): void {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    this.loadSupplyChainData();
    // disabled connection label functionality
    // this.getConnectionLabels();
  }

  closeMapBox(): void {
    console.log('close map box');
  }

  plotMycompany(): void {
    const api = this.connectionService
      .getCompanyDetails(this.nodeId)
      .subscribe((res: any) => {
        const marker: any = new google.maps.Marker({
          position: {
            lat: res.data.latitude,
            lng: res.data.longitude,
          },
          icon: this.markerIcon,
          // customInfo: {},
          optimized: false,
          map: this.map,
        });
        this.mapLat = res.data.latitude;
        this.mapLng = res.data.longitude;
        this.infoWindow = new google.maps.InfoWindow();
        const content = `<div class="info-container row m-0 p-0">
        <div class="inner-left p-0 col-3">
        <div class="txt-img text-center"> <h1 class="text-xxxs font-1-normal mb-0">T0</h1></div>
        </div>
        <div class="inner-right p-0 col-9">
          <div class="h-1">${
            res.data.name.length > 48
              ? res.data.name.slice(0, 49) + '...'
              : res.data.name
          }</div>
          <div class="h-2">My company</div>
          <div class="h-2">${res.data.province},${res.data.country}</div>
        </div>
      </div>`;
        this.infoWindow.setContent(content);
        this.infoWindow.setPosition(marker.position);
        this.infoWindow.setOptions({
          pixelOffset: new google.maps.Size(175, 120),
        });
        this.infoWindow.open(this.map);
      });
    this.pageApis.push(api);
  }

  // disabled calling for now
  getConnectionLabels(): void {
    const api = this.connectionService
      .getUsedConnectionLabels()
      .subscribe((res: any) => {
        this.connectionLabels = res.results;
        this.selectedConnectionLabel = '';
      });
    this.pageApis.push(api);
  }

  getTheme(): void {
    const localObj = this.storage.retrieveStoredData('company-theme');
    this.currentTheme = JSON.parse(localObj);
    if (this.currentTheme) {
      this.setMapMarkers(this.currentTheme);
    }
  }

  setMapMarkers(theme: any): void {
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
    const mySelectedSvg = [
      '<?xml version="1.0"?>',
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle cx="10" cy="10" r="10" fill="{{ color }}"/>',
      '<circle cx="10" cy="10" r="7" fill="white"/>',
      '</svg>',
    ].join('\n');
    const pseudoSelectedSvg = [
      '<?xml version="1.0"?>',
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle cx="20" cy="20" r="10" fill="{{ color }}"/>',
      '</svg>',
    ].join('\n');
    const myCompanySvg = [
      '<?xml version="1.0"?>',
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle cx="10" cy="10" r="10" fill="{{ color }}"/>',
      '<circle cx="10" cy="10" r="7" fill="white"/>',
      '</svg>',
    ].join('\n');

    const activeActorsSvg = [
      '<?xml version="1.0"?>',
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">',
      '<circle cx="10" cy="10" r="8" fill="{{ color }}"/>',
      '</svg>',
    ].join('\n');

    this.mapImages.clusterSmall = clusterSmallSvg.replace(
      '{{ color }}',
      theme.colour_map_marker
    );
    this.mapImages.clusterSmall =
      'data:image/svg+xml;charset=UTF-8;base64,' +
      btoa(this.mapImages.clusterSmall);

    this.mapImages.clusterBig = clusterBigSvg.replace(
      '{{ color }}',
      theme.colour_map_clustor
    );
    this.mapImages.clusterBig =
      'data:image/svg+xml;charset=UTF-8;base64,' +
      btoa(this.mapImages.clusterBig);

    this.mapImages.mySelected = mySelectedSvg.replace(
      '{{ color }}',
      theme.colour_map_selected
    );
    this.mapImages.mySelected =
      'data:image/svg+xml;charset=UTF-8;base64,' +
      btoa(this.mapImages.mySelected);

    this.mapImages.pseudoSelected = pseudoSelectedSvg.replace(
      '{{ color }}',
      theme.colour_map_selected
    );
    this.mapImages.pseudoSelected =
      'data:image/svg+xml;charset=UTF-8;base64,' +
      btoa(this.mapImages.pseudoSelected);

    this.mapImages.my_company = myCompanySvg.replace(
      '{{ color }}',
      theme.colour_map_marker
    );
    this.mapImages.my_company =
      'data:image/svg+xml;charset=UTF-8;base64,' +
      btoa(this.mapImages.my_company);

    this.mapImages.activeActors = activeActorsSvg.replace(
      '{{ color }}',
      theme.colour_map_selected
    );
    this.mapImages.activeActors =
      'data:image/svg+xml;charset=UTF-8;base64,' +
      btoa(this.mapImages.activeActors);
    this.map.setOptions({
      styles: mapStyle,
    });
    this.mapLoaded = true;
  }

  loadSupplyChainData(): void {
    this.setConnections();
    this.removeAllLine();
    this.resetStream();
  }

  loadSupplyChain(): void {
    const api = this.utils.getSupplyChains().subscribe((data: any) => {
      this.supplyChainList = data;
      this.initSubscriptions();
    });
    this.pageApis.push(api);
  }

  setConnections(): void {
    this.loaderConnection = true;
    this.mapData = [];
    const api = this.connectionService.mapData$.subscribe((res: any) => {
      if (res) {
        const { chain } = res;
        this.connectionsData = res;
        this.mapData = [...chain];
        this.setMapComponents();
      }
    });
    this.pageApis.push(api);
  }

  // create map and its components based on nodes
  setMapComponents(): void {
    // Intialize infowindow and listening to close clicks
    this.infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(this.infoWindow, 'closeclick', () => {
      if (this.selectedMarker.customInfo.tier !== 0) {
        this.setInitMap();
      }
    });
    // plot other markers and cluster
    for (let i = 0; i < this.mapData.length; i++) {
      let markerIcon = this.markerIcon;
      if (this.mapData[i].tier === 0) {
        markerIcon = this.selectedMarkerIconMe;
      }

      const marker: any = new google.maps.Marker({
        position: {
          lat: this.mapData[i].latitude,
          lng: this.mapData[i].longitude,
        },
        icon: markerIcon,
        customInfo: this.mapData[i],
        optimized: false,
      });

      if (this.mapData[i].tier === 0) {
        this.markerMe = marker;
      }
      // opening info window and changing marker of other actors
      marker.addListener('mouseover', () => {
        this.openInfoWindow(marker, 'marker_detail');
        if (this.selectedMarker) {
          if (this.selectedMarker.customInfo.tier === 0) {
            this.selectedMarker.setIcon(this.markerIconMe);
          } else if (
            this.selectedMarker.customInfo.id === this.selectmarkerIdCluster
          ) {
            this.selectedMarker.setIcon(this.streamSelectedIcon);
          } else {
            this.selectedMarker.setIcon(this.markerIcon);
          }
        }

        if (marker.customInfo.tier === 0) {
          this.markerMe.setIcon(this.selectedMarkerIconMe);
        } else if (marker.customInfo.id === this.selectmarkerIdCluster) {
          marker.setIcon(this.streamSelectedIcon);
        } else {
          marker.setIcon(this.selectedMarkerIcon);
        }
        this.selectedMarker = marker;
      });
      google.maps.event.addListener(marker, 'click', () => {
        if (this.selectmarkerIdCluster) {
          this.selectedMarkerInCluster.setIcon(this.markerIcon);
        }
        if (marker.customInfo.tier !== 0) {
          marker.setIcon(this.streamSelectedIcon);
        }
        this.traceConnectedActors(marker);
      });
      this.markers.push(marker);
    }

    // making cluster and listening to hover event
    this.clusterMarkers(this.markers);
    setTimeout(() => {
      this.setInitMap();
      this.plotPolyLines(
        this.markerCluster.clusters_,
        this.markerCluster.markers_
      );
    }, 4000);
    this.groupConnectionBasedOnTier(this.markers);
  }

  // function set the zoom and center of map based on markers / Reset map
  setInitMap(): void {
    if (this.markers.length > 0) {
      this.mapDetailBox = false;

      if (!this.selectmarkerIdCluster) {
        if (this.selectedMarker) {
          if (this.selectedMarker.customInfo.tier === 0) {
            this.selectedMarker.setIcon(this.markerIconMe);
          } else {
            this.selectedMarker.setIcon(this.markerIcon);
          }
        }
        this.selectedMarker = null;
        this.selectedMarker = this.markerMe;
        this.openInfoWindow(this.markerMe, 'marker_detail');
        this.markerMe.setIcon(this.selectedMarkerIconMe);
      }
      let bounds = null;
      bounds = new google.maps.LatLngBounds();
      for (const marker of this.markers) {
        bounds.extend(
          new google.maps.LatLng(marker.position.lat(), marker.position.lng())
        );
      }
      this.map.fitBounds(bounds);
    }
  }

  // open infow window
  openInfoWindow(marker: any, type: string): void {
    const result = this.connectionService.infoWindowSetup(
      marker,
      type,
      this.selectedChainName
    );
    this.infoWindow.setContent(result?.content);
    this.infoWindow.setPosition(result.marker.position);
    this.infoWindow.setOptions({ pixelOffset: new google.maps.Size(175, 120) });
    this.infoWindow.open(this.map);
  }

  // highlight stream of actor
  traceConnectedActors(actor: any): void {
    if (actor.customInfo.tier === 0) {
      this.resetConnectionMap();
    } else {
      this.resetStream();
      this.selectmarkerIdCluster = actor.customInfo.id;
      this.selectedMarkerInCluster = actor;
      this.removeAllLine();
      this.clearAllMarkers();
      this.plotConnectedActortoMyCompany(actor);
      if (actor.customInfo.tier > 0) {
        this.plotConnectedActortoLastTier(actor, this.supplierTierLength);
      } else if (actor.customInfo.tier < 0) {
        this.plotConnectedActortoLastTier(actor, this.buyerTierLength);
      }
      setTimeout(() => {
        this.clusterMarkers(this.connectionStreamMarkers);
      }, 300);
    }
  }

  clusterMarkers(markers: any): void {
    if (this.markerCluster) {
      this.clearAllMarkers();
    }
    if (!this.currentTheme) {
      const cT = localStorage.getItem('company-theme');
      this.currentTheme = JSON.parse(cT);
    }
    // const vm = this;
    this.markerCluster = new MarkerClusterer(this.map, markers, {
      styles: [
        {
          textColor: this.currentTheme.colour_map_marker_text,
          url: this.mapImages.clusterBig,
          height: 26,
          width: 26,
          textLineHeight: 26,
        },
      ],
      gridSize: 20,
    });
    google.maps.event.addListener(this.markerCluster, 'clusterclick', () => {
      this.infoWindow.close();
    });
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const vm = this;
    google.maps.event.addListener(
      this.markerCluster,
      'mouseover',
      function (c: any) {
        vm.openClusterInfoWindow(c.clusterIcon_);
        if (vm.selectedMarker) {
          if (vm.selectedMarker.customInfo.tier === 0) {
            vm.selectedMarker.setIcon(vm.markerIconMe);
          } else {
            vm.selectedMarker.setIcon(vm.markerIcon);
          }
        }
      }
    );
  }

  clearAllMarkers(): void {
    this.markerCluster.clearMarkers();
    // this.markerCluster.setMap(null);
    this.markers.forEach((marker: any) => {
      marker.setMap(null);
    });
  }

  resetConnectionMap(): void {
    this.resetStream();
    this.connectionLabelMarkers = [];
    this.selectedConnectionLabel = '';
    this.clusterMarkers(this.markers);
    setTimeout(() => {
      this.setInitMap();
      this.plotPolyLines(
        this.markerCluster.clusters_,
        this.markerCluster.markers_
      );
    }, 1000);
  }

  resetStream(): void {
    this.removeStream();
    this.connectionStreamMarkers = [];
    this.connectionStream = [];
    this.selectmarkerIdCluster = null;
    this.selectedMarkerInCluster = null;
  }

  // ploting polyline between markers
  plotPolyLines(clusters: any, markers: any): void {
    this.removeAllLine();
    let position1: any, position2: any;
    for (const marker of markers) {
      for (const connection of marker.customInfo.connected_to) {
        let connectedMarker;

        if (marker.customInfo.tier !== 0) {
          // //console.log('then else')
          connectedMarker = markers.find(
            (mark: any) => mark.customInfo.id === connection.parent_id
          );
          // //console.log('then connectedMarker', connectedMarker);
          position1 = this.findMarkerPosition(marker, clusters);
          position2 = this.findMarkerPosition(connectedMarker, clusters);
          this.drawLine(
            position1.lat(),
            position1.lng(),
            position2.lat(),
            position2.lng(),
            connection.connection_status
          );
        }
      }
    }
    this.loaderConnection = false;
  }

  // remove all line from map
  removeAllLine(): void {
    for (const line of this.mapPolylines) {
      line.setMap(null);
    }
    this.mapPolylines = [];
  }

  // remove all line from map
  removeStream(): void {
    for (const line of this.mapStreamlines) {
      line.setMap(null);
    }
    this.mapStreamlines = [];
  }

  // Search marker in clusters etc and find coridnates of that marker
  findMarkerPosition(marker: any, cluster: any): void {
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
      // //console.log('marker postion at maker.postion ', marker)
      return marker.position;
    }
  }

  // Draw polyline in map based on connection status
  drawLine(lat1: any, lng1: any, lat2: any, lng2: any, status: any): void {
    const linePath = [
      { lat: lat1, lng: lng1 },
      { lat: lat2, lng: lng2 },
    ];
    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 1,
      strokeColor: this.currentTheme
        ? this.currentTheme.colour_font_alpha
        : '#003A60',
    };
    let lineOptions;
    if (status === 201) {
      lineOptions = {
        path: linePath,
        map: this.map,
        strokeColor: this.currentTheme
          ? this.currentTheme.colour_font_alpha
          : '#003A60',
        strokeOpacity: 1,
        strokeWeight: 1,
        geodesic: false,
      };
    } else {
      lineOptions = {
        path: linePath,
        strokeOpacity: 0,
        icons: [
          {
            icon: lineSymbol,
            offset: '0',
            repeat: '10px',
          },
        ],
        map: this.map,
      };
    }
    const line = new google.maps.Polyline(lineOptions);
    this.mapPolylines.push(line);
  }

  // Open cluster Info window
  openClusterInfoWindow(cluster: any): void {
    const result = this.connectionService.setupClusterInfoWinodw(
      cluster,
      this.selectedChainName
    );
    this.infoWindow.setContent(result + '</div>');
    this.infoWindow.setPosition(cluster.center_);
    this.infoWindow.open(this.map);
  }

  plotConnectedActortoMyCompany(actorMarker: any): void {
    let connectedActor, connectionForActor;
    actorMarker.customInfo.connected_to.forEach((actor: any) => {
      if (actor.parent_id !== 0) {
        connectedActor = this.markers.find(
          (mark: any) => mark.customInfo.id === actor.parent_id
        );
        this.drawStream(actorMarker, connectedActor, 'plot');
        this.plotConnectedActortoMyCompany(connectedActor);
        if (Math.abs(actorMarker.customInfo.tier) === 1) {
          if (actorMarker.customInfo.tier > 0) {
            actorMarker.customInfo.connected_to.forEach(
              (connected_actor: any) => {
                connected_actor.supplier_for.forEach((supplier_for: any) => {
                  connectionForActor = this.markers.find(
                    (mark: any) => mark.customInfo.id === supplier_for
                  );
                  this.drawStream(this.markers[0], connectionForActor, 'plot');
                  this.plotConnectedActortoLastTier(
                    connectionForActor,
                    this.buyerTierLength
                  );
                });
              }
            );
          } else {
            actorMarker.customInfo.connected_to.forEach(
              (connected_actor: any) => {
                connected_actor.buyer_for.forEach((buyer_for: any) => {
                  connectionForActor = this.markers.find(
                    (mark: any) => mark.customInfo.id === buyer_for
                  );
                  this.drawStream(this.markers[0], connectionForActor, 'plot');
                  this.plotConnectedActortoLastTier(
                    connectionForActor,
                    this.supplierTierLength
                  );
                });
              }
            );
          }
        }
      }
    });
  }

  plotConnectedActortoLastTier(actorMarker: any, tierLength: any): void {
    let connectedActors: any;
    if (Math.abs(actorMarker.customInfo.tier) !== tierLength) {
      let tierIndex: any;
      if (actorMarker.customInfo.tier > 0) {
        tierIndex = actorMarker.customInfo.tier + 1;
      } else {
        tierIndex = actorMarker.customInfo.tier - 1;
      }
      connectedActors = [];
      this.tierData[tierIndex].forEach((mark: any) => {
        mark.customInfo.connected_to.forEach((element: any) => {
          if (element.parent_id === actorMarker.customInfo.id) {
            connectedActors.push(mark);
          }
        });
      });
      connectedActors.forEach((actor: any) => {
        this.drawStream(actor, actorMarker, 'plot');
        this.plotConnectedActortoLastTier(actor, tierLength);
      });
    }
  }

  drawStream(actor1: any, actor2: any, status: any): void {
    if (status === 'plot') {
      this.connectionStream.push({
        actor1: actor1,
        actor2: actor2,
      });
      if (this.connectionStreamMarkers.indexOf(actor1) === -1) {
        this.connectionStreamMarkers.push(actor1);
      }
      if (this.connectionStreamMarkers.indexOf(actor2) === -1) {
        this.connectionStreamMarkers.push(actor2);
      }
    }
    const position1: any = this.findMarkerPosition(
      actor1,
      this.markerCluster.clusters_
    );
    const position2: any = this.findMarkerPosition(
      actor2,
      this.markerCluster.clusters_
    );
    const linePath = [
      { lat: position1.lat(), lng: position1.lng() },
      { lat: position2.lat(), lng: position2.lng() },
    ];
    const lineOptions: any = {
      path: linePath,
      map: this.map,
      strokeColor: this.currentTheme
        ? this.currentTheme.colour_map_selected
        : '#EA2553',
      strokeOpacity: 2,
      strokeWeight: 2,
      geodesic: false,
    };
    const line = new google.maps.Polyline(lineOptions);
    this.mapStreamlines.push(line);
  }

  // Group connection based on tier for stream highlight
  groupConnectionBasedOnTier(connectionList: any): void {
    this.supplierTierLength = 0;
    this.buyerTierLength = 0;
    const tierData: Record<number, any[]> = {};

    connectionList.forEach((connection: any) => {
      const tier = connection.customInfo.tier;

      if (tier !== 0) {
        if (!(tier in tierData)) {
          tierData[tier] = [];
        }

        const absoluteTier = Math.abs(tier);

        if (tier > 0) {
          this.supplierTierLength = Math.max(
            this.supplierTierLength,
            absoluteTier
          );
        } else {
          this.buyerTierLength = Math.max(this.buyerTierLength, absoluteTier);
        }

        tierData[tier].push(connection);
      }
    });

    this.tierData = tierData;
  }

  // remove all markers from map
  removeMarkers(): void {
    if (this.markerMe) {
      this.markerMe.setMap(null);
    }
    this.markerMe = null;
    if (this.markerCluster) {
      this.markerCluster.clearMarkers();
    }
    this.markerCluster = null;
    this.markers = [];
  }

  // Listening to zoom changes and reploting polylines
  zoomChange(number?: any): void {
    setTimeout(() => {
      if (this.markerCluster) {
        if (!this.selectmarkerIdCluster) {
          this.plotPolyLines(
            this.markerCluster.clusters_,
            this.markerCluster.markers_
          );
        }
        if (this.connectionStream.length > 0) {
          this.removeStream();
          this.refreshStream();
        }
      }
    }, 500);
  }

  refreshStream(): void {
    this.removeStream();
    this.connectionStream.forEach((connection: any) => {
      this.drawStream(connection.actor1, connection.actor2, 'refresh');
    });
  }

  // Intialize map , markers , infowindow etc
  mapReady(map: any): void {
    this.map = map;
    // icon for my comany
    this.markerIconMe = {
      url: this.mapImages.my_company,
      size: new google.maps.Size(20, 20),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 10),
      zIndex: 100,
    };

    // icon for other selected Me icons
    this.selectedMarkerIconMe = {
      url: this.mapImages.mySelected,
      size: new google.maps.Size(20, 20),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 10),
      zIndex: 100,
    };

    // psedo selected_icon
    this.streamSelectedIcon = {
      url: this.mapImages.pseudoSelected,
      size: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 20),
      zIndex: 100,
    };

    // icon for other selected actor
    this.selectedMarkerIcon = {
      url: this.mapImages.activeActors,
      size: new google.maps.Size(20, 20),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 10),
      zIndex: 100,
    };

    // icon for other actors
    this.markerIcon = {
      url: this.mapImages.clusterSmall,
      size: new google.maps.Size(20, 20),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 10),
      zIndex: 100,
    };

    this.getTheme();
  }

  // ploting map based on connection labels
  filterMapByConnectionLabel(val: any): void {
    this.selectedConnectionLabel = val.name;
    if (!val) {
      this.resetConnectionMap();
    } else {
      this.removeAllLine();
      this.clearAllMarkers();
      this.connectionLabelMarkers = [];
      if (this.infoWindow) {
        this.infoWindow.close();
      }
      this.markers.forEach((actor: any) => {
        if (actor.customInfo.tier > -1) {
          if (actor.customInfo.tier === 0) {
            this.connectionLabelMarkers.push(actor);
          } else {
            this.connectionlabelCheck(actor);
          }
        }
      });
      setTimeout(() => {
        this.clusterMarkers(this.connectionLabelMarkers);
      }, 300);
      setTimeout(() => {
        this.setInitMap();
        this.plotPolyLines(
          this.markerCluster.clusters_,
          this.markerCluster.markers_
        );
      }, 1000);
    }
  }

  connectionlabelCheck(actor: any): void {
    let index;
    if (actor.customInfo.tier === 1) {
      actor.customInfo.connected_to.forEach((value: any) => {
        if (value.labels != null) {
          value.labels.forEach((label: any) => {
            if (label.name === this.selectedConnectionLabel) {
              actor.customInfo.label_connected_to =
                actor.customInfo.connected_to;
              this.connectionLabelMarkers.push(actor);
            }
          });
        }
      });
    } else {
      actor.customInfo.connected_to.forEach((connectedMarker: any) => {
        this.connectionLabelMarkers.forEach((marker: any) => {
          if (marker.customInfo.id === connectedMarker.parent_id) {
            index = this.connectionLabelMarkers.indexOf(actor);
            if (index === -1) {
              actor.customInfo.label_connected_to = [connectedMarker];
              this.connectionLabelMarkers.push(actor);
            } else {
              this.connectionLabelMarkers[
                index
              ].customInfo.label_connected_to.push(connectedMarker);
            }
          }
        });
      });
    }
  }

  // Function to navigate to a marker in map
  goToActor(id: any): void {
    this.selectedMarker = this.markers.find(
      (marker: any) => marker.customInfo.id === id
    );
    if (this.selectedMarker.customInfo.type === 1) {
      if (this.nodeId === id) {
        window.open('/company-profile');
      } else {
        window.open('/company-profile/' + id);
      }
    } else {
      window.open('/farmer-profile/' + id);
    }
    this.openInfoWindow(this.selectedMarker, 'marker_detail');
    this.mapDetailBox = true;
    this.editConnection = false;
  }

  connectionType(id: string): void {
    const toAdd = this.mapData.find((element: any) => element.id === id);
    const { tier, name } = toAdd;
    if (tier === -1) {
      this.listViewService.addCompanyPopup({
        connectionType: 'buyer',
        ...toAdd,
        full_name: name,
      });
    } else {
      const dialog = this.dialog.open(ConnectionTypeSelectionComponent, {
        data: { ...toAdd },
        width: '400px',
        height: 'auto',
      });
    }
  }

  // Method to toast success/error messages (by default)
  openSnackbar(event: any): void {
    // const data: any = {};
    // data.icon = event._message;
    // data.message = event.messageBody;
    // this.snackBar.openFromComponent(SnackBarComponent, {
    //   duration: 3000,
    //   data: data,
    // });
    // this.utils.customSnackBar(event.messageBody)
    // setTimeout(() => {
    //   this.setInitMap();
    // }, 1000);
  }

  changeSupplyChain(): void {
    this.infoWindow.close();
    this.loadSupplyChainData();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
