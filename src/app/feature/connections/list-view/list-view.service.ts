/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

// config
import { HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { RouterService, StorageService } from 'src/app/shared/service';

import { environment } from 'src/environments/environment';
import { NewConnectionFarmerService } from '../new-connection-farmer/new-connection-farmer.service';
import { NewConnectionCompanyService } from '../new-connection-company';
const BASE_URL = environment.baseUrl;

export interface IFilterMaster {
  relationship: any[];
  tier: any[];
  status: any[];
  companyClaims: any[];
  operationsList: any[];
  connectionLabels: any[];
}
@Injectable({
  providedIn: 'root',
})
export class ListViewService {
  constructor(
    private http: HttpClient,
    private router: RouterService,
    private newFarmerService: NewConnectionFarmerService,
    private newCompanyService: NewConnectionCompanyService,
    private storage: StorageService
  ) {}

  getCompanyClaims(scope: string) {
    return this.http
      .get(
        BASE_URL + '/claims/?limit=1000&type=2&scope=' + scope,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  setFilterValues(): any {
    return {
      relationship: [
        { id: 1, name: 'Supplier' },
        { id: 2, name: 'Buyer' },
      ],
      tier: [],
      status: [
        { id: 1, name: 'Verified' },
        { id: 2, name: 'Invited' },
        { id: 3, name: 'Mapped' },
      ],
      companyClaims: [],
      operationsList: [],
      connectionLabels: [],
    };
  }

  filterOperations(type: string, data: any[]): any[] {
    return data.filter((e: any) => {
      const { node_type } = e;
      if (type === 'company') {
        return node_type === 1;
      } else {
        return node_type === 2;
      }
    });
  }

  // go to details page
  viewDetails(element: any): void {
    if (element.type === 1) {
      window.open('company-profile/' + element.id);
    } else {
      window.open('farmer-profile/' + element.id);
    }
  }

  formatConnectedFarmerData(
    orginalConnectionData: any[],
    nodeId: string
  ): any[] {
    let companiesWithFarmers: any[] = [];
    const farmerList = orginalConnectionData.filter(e => {
      return e.type === 2;
    });
    const companiesList = orginalConnectionData.filter(e => {
      return e.type === 1;
    });
    companiesWithFarmers.push({ id: nodeId });
    farmerList.filter(el => {
      el.connected_to[0].managers.filter((m: any) => {
        if (m.id === nodeId) {
          companiesWithFarmers.push({ id: el.connected_to[0].parent_id });
        }
      });
    });
    const newList = companiesWithFarmers.filter(
      (v, i) => companiesWithFarmers.findIndex(item => item.id === v.id) === i
    );
    companiesWithFarmers = newList;
    companiesWithFarmers.filter(el => {
      companiesList.filter(e => {
        if (e.id === el.id) {
          el.name = e.name;
        }
      });
    });
    companiesWithFarmers.filter(e => {
      if (e.id === nodeId) {
        e.name = 'My Company';
      }
    });

    return companiesWithFarmers;
  }

  dynamicTemplateRedirection(): void {
    this.router.navigateUrl('/template-upload/connections');
  }

  redirectToNewFarmer(data: any): void {
    this.newFarmerService.connectionInfo$.next(data);
    this.router.navigateUrl('/connections/new-farmer');
  }

  redirectToNewCompany(data: any): void {
    this.newCompanyService.connectionInfo$.next(data);
    this.router.navigateUrl('/connections/new-company');
  }

  commonCompanyProps(): any {
    return {
      stock: false,
      addConnection: true,
      companyName: '',
    };
  }

  commonProps(): any {
    return {
      chainName: this.storage.retrieveStoredData('supplyChainName'),
      nodeId: this.storage.retrieveStoredData('companyID'),
      nodeName: this.storage.retrieveStoredData('companyName'),
      schainId: this.storage.retrieveStoredData('supplyChainId'),
    };
  }

  addCompanyPopup(item: any): void {
    const data = {
      ...this.commonProps(),
      ...this.commonCompanyProps(),
      ...item,
    };
    this.redirectToNewCompany(data);
  }

  farmerConnection(item?: any): void {
    const data: any = {
      stock: false,
      farmerName: '',
      ...this.commonProps(),
    };

    if (item) {
      const { full_name, id } = item;
      data.connectionId = id;
      data.connectionName = full_name;
      data.isSupplier = true;
    }
    this.redirectToNewFarmer(data);
  }

  addNewConnection(): void {
    const data = {
      ...this.commonProps(),
      ...this.commonCompanyProps(),
      connectionType: 'supplier',
      fullView: true,
    };
    this.redirectToNewCompany(data);
  }
}
