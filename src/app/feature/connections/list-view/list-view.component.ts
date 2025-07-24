/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
// configs
import {
  ICommonObj,
  ITableColumnHeader,
} from 'src/app/shared/configs/app.model';
import {
  COMPANY_COLUMNS,
  FARMER_COLUMNS,
  LOCATION_TYPES,
  SEARCHBY_OPTIONS,
} from './list-view.config';
import {
  ACTION_TYPE,
  exportFileType,
  exportType,
} from 'src/app/shared/configs/app.constants';

// components
import { MapSuppliersRequestComponent } from '../map-suppliers-request';
// services
import { StorageService, UtilService } from 'src/app/shared/service';
import { ConnectionService } from '../connections.service';
import { ListViewService } from './list-view.service';
import { TranslateService } from '@ngx-translate/core';
import { ExportService } from 'src/app/shared/service/export.service';
import { GlobalStoreService } from 'src/app/shared/store';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
})
export class ListViewComponent implements OnInit, OnDestroy {
  loader: boolean;
  tabGroup: ICommonObj[] = [
    {
      id: 'company',
      name: 'Company',
    },
    {
      id: 'farmer',
      name: 'Farmers',
    },
  ];
  searchOptions: any[] = SEARCHBY_OPTIONS;
  activeTab: string;
  toggleFilter: boolean;
  pageApis: Subscription[] = [];
  dataSource: any[] = [];
  dataCount: number;
  displayedColumns: ITableColumnHeader[];
  appliedFilters: any;
  filterValues: any;
  availableFilters: any[] = [];
  operationList: any[] = [];
  orginalConnectionData: any[];
  fullDataLoaded = true;
  nodeId = this.storage.retrieveStoredData('companyID');
  supplyChainId: string = this.storage.retrieveStoredData('supplyChainId');
  companiesWithFarmers: any[] = [];
  private currentSubscription: Subscription | null = null;
  countryList: any[] = [];
  stateList: any[] = [];
  locationTypeList: any = LOCATION_TYPES;
  customPageSize: { limit: number; offset: number };

  constructor(
    private dialog: MatDialog,
    private storage: StorageService,
    private service: ConnectionService,
    private translate: TranslateService,
    private listService: ListViewService,
    private utils: UtilService,
    private exportService: ExportService,
    private global: GlobalStoreService
  ) {}

  ngOnInit(): void {
    this.getCountryList();
    this.initData();
    this.loadFullData();
    const api = this.utils.supplyChainData$.subscribe(() => {
      this.initData();
      this.loadFullData();
    });
    this.pageApis.push(api);
    const exportClicked = this.exportService.exportIconClicked$.subscribe(
      res => {
        if (res) {
          const params = {
            supply_chain: this.supplyChainId,
          };
          this.exportService.initExportData({
            export_type:
              this.activeTab === 'company'
                ? exportType.COMPANY
                : exportType.FARMER,
            filters: JSON.stringify(params),
            file_type: exportFileType.EXCEL,
          });
        }
      }
    );
    this.pageApis.push(exportClicked);
  }

  /**
   * Initially calling to get connected companies / nodes
   */
  initData(): void {
    this.service.getConnections(this.nodeId, this.supplyChainId).subscribe();
    this.loader = true;
    this.activeTab = this.tabGroup[0]?.id;
    this.resetAppliedFilters(1);
    this.displayedColumns = COMPANY_COLUMNS;
    this.filterValues = this.listService.setFilterValues();
    this.getConnectionLabels();
  }
  /* istanbul ignore next */
  loadFullData(): void {
    const sub = this.service.mapData$.subscribe((res: any) => {
      if (res) {
        const { chain } = res;
        this.orginalConnectionData = [...chain];
        this.fullDataLoaded = true;
        this.getManageFarmerList();
      }
    });
    this.pageApis.push(sub);
  }

  // fetching filter item master data
  /* istanbul ignore next */
  getConnectionLabels() {
    const api = this.service.getUsedConnectionLabels().subscribe({
      next: (res: any) => {
        this.filterValues.connectionLabels = res.results;
        this.setConnectionLabelFilter();
        this.getTypes();
      },
      error: () => {
        this.filterValues.connectionLabels = [];
        this.getTypes();
      },
    });
    this.pageApis.push(api);
  }
  /* istanbul ignore next */
  setConnectionLabelFilter(): void {
    if (this.filterValues.connectionLabels.length === 0) {
      this.availableFilters = this.availableFilters.filter(
        a => a.name !== 'Connection labels'
      );
    }
  }
  /* istanbul ignore next */
  getTypes(): void {
    const api = this.service.listOperations().subscribe((res: any) => {
      const { results } = res;
      this.operationList = results;
      this.filterValues.operationsList = this.listService.filterOperations(
        this.activeTab,
        results
      );
      this.getConnections();
    });
    this.pageApis.push(api);
  }
  /* istanbul ignore next */
  getCompanyClaims() {
    const api = this.listService.getCompanyClaims('').subscribe({
      next: (res: any) => {
        this.filterValues.companyClaims = res.results;
      },
      error: () => {
        this.filterValues.companyClaims = [];
      },
    });
    this.pageApis.push(api);
  }
  /* istanbul ignore next */
  getConnections(): void {
    // Cancel any ongoing subscription
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
    }

    this.currentSubscription = this.service
      .connectionList(this.appliedFilters)
      .subscribe({
        next: (res: any) => {
          const { count, results } = res;
          this.dataSource = results;
          this.dataCount = count;
          this.customPageSize = {
            limit: this.appliedFilters?.limit,
            offset: this.appliedFilters?.offset,
          };
          this.loader = false;
        },
      });
    this.pageApis.push(this.currentSubscription);
  }

  resetAppliedFilters(type: number): void {
    this.appliedFilters = {
      limit: 10,
      offset: 0,
      searchString: '',
      type,
      relationship: '',
      primaryOperation: '',
      status: '',
      country: '',
      province: '',
      location_type: '',
      searchBy: '',
    };
  }
  /* istanbul ignore next */
  changeTab({ id }: ICommonObj): void {
    this.activeTab = id;
    this.loader = true;
    this.toggleFilter = false;
    if (id === 'company') {
      this.displayedColumns = COMPANY_COLUMNS;
      this.resetAppliedFilters(1);
    } else {
      this.displayedColumns = FARMER_COLUMNS;
      this.resetAppliedFilters(2);
    }
    this.filterValues.operationsList = this.listService.filterOperations(
      this.activeTab,
      this.operationList
    );
    this.getConnections();
  }
  /* istanbul ignore next */
  searchFilter(data: string): void {
    this.loader = true;
    this.appliedFilters.limit = 10;
    this.appliedFilters.offset = 0;
    this.appliedFilters.searchString = data;
    this.getConnections();
  }
  /* istanbul ignore next */
  filterClicked(): void {
    this.toggleFilter = !this.toggleFilter;

    if (!this.toggleFilter) {
      this.resetAppliedFilters(this.activeTab === 'company' ? 1 : 2);
      this.loader = true;
      this.stateList = [];
      this.getConnections();
    }
  }
  /* istanbul ignore next */
  addNewConnection(): void {
    this.listService.addNewConnection();
  }
  /* istanbul ignore next */
  farmerConnection(item?: any): void {
    this.listService.farmerConnection(item);
  }
  /* istanbul ignore next */
  paginatorEvent(data: any): void {
    const { limit, offset } = data;
    this.appliedFilters.limit = limit;
    this.appliedFilters.offset = offset;
    this.loader = true;
    this.getConnections();
  }

  // go to details page
  /* istanbul ignore next */
  viewDetails(element: any): void {
    this.listService.viewDetails(element);
  }

  // request to map supplier
  /* istanbul ignore next */
  mapSuppliers(data: any): void {
    this.dialog.open(MapSuppliersRequestComponent, {
      disableClose: true,
      width: '30vw',
      height: 'auto',
      data: {
        map: true,
        id: data?.id,
        supplyChain: this.supplyChainId,
      },
      panelClass: 'custom-modalbox',
    });
  }

  // resent invite dialog open
  /* istanbul ignore next */
  resentInvite(id: string): void {
    const data = { supply_chain: this.supplyChainId, node: id };
    const api = this.service.resendFarmerInvite(data).subscribe({
      next: () => {
        const message = this.translate.instant('team.resendInvite');
        this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
      },
      error: () => {
        const message = this.translate.instant('team.resendInviteFailed');
        this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
      },
    });
    this.pageApis.push(api);
  }
  /* istanbul ignore next */
  sentInvite(id: string): void {
    const dialogRef = this.dialog.open(MapSuppliersRequestComponent, {
      disableClose: true,
      width: '30vw',
      height: 'auto',
      data: {
        map: false,
        id,
        supplyChain: this.supplyChainId,
      },
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.success) {
          const message = this.translate.instant('team.invite');
          this.utils.customSnackBar(message, ACTION_TYPE.SUCCESS);
        }
      }
    });
  }
  /* istanbul ignore next */
  getManageFarmerList(): void {
    this.companiesWithFarmers = this.listService.formatConnectedFarmerData(
      this.orginalConnectionData,
      this.nodeId
    );
  }
  /* istanbul ignore next */
  filterItems(newValue: any, type: string): void {
    const { id } = newValue;
    this.appliedFilters[type] = id === 'All' ? '' : id;
    this.loader = true;
    if (type == 'country') {
      this.appliedFilters['province'] = '';
      if (id != 'All') {
        const selectedSub = newValue.sub_divisions;
        this.setStateList(selectedSub, true);
      } else {
        this.stateList = [];
      }
    }
    this.getConnections();
  }
  /* istanbul ignore next */
  addCompanyPopup(item: any): void {
    const { connection_details } = item;
    const connectionType =
      connection_details?.connection_type === 1 ? 'buyer' : 'supplier';
    this.listService.addCompanyPopup({ ...item, connectionType });
  }
  /* istanbul ignore next */
  bulkUpload(): void {
    this.listService.dynamicTemplateRedirection();
  }

  getCountryList(): void {
    const sub2 = this.global.countryList$.subscribe({
      next: (res: any) => {
        if (res) {
          this.countryList = res;
        }
      },
    });
    this.pageApis.push(sub2);
  }

  setStateList(selectedSub: any, firstSelected?: boolean): void {
    this.stateList = Object.keys(selectedSub).map((key: any) => {
      selectedSub[key].name = key;
      selectedSub[key].id = key;
      return selectedSub[key];
    });
  }

  handleSearchByOptionChange(option: any): void {
    const { id } = option;
    id == 'all' ? '' : id;
    this.appliedFilters.searchBy = id;
    this.getConnections();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
