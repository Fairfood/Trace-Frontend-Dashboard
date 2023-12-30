/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, map } from 'rxjs';

import {
  IDropdownItem,
  ICommonObj,
  IUserData,
} from 'src/app/shared/configs/app.model';
import { GlobalStoreService } from 'src/app/shared/store';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';

type NodeKeys = 'id' | 'name' | 'brandLogo';
@Component({
  selector: 'app-header-base',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class HeaderBaseComponent {
  pageApis: Subscription[] = [];

  notificationObject: any;
  hideDropdown: boolean;
  userData: IUserData;
  viewingAsAdmin: boolean;
  currentCompany: string;
  nodeDetails: { [K in NodeKeys]: string } = {
    id: '',
    name: '',
    brandLogo: '',
  };
  dataLoaded: boolean;
  supplyChainList: Partial<ICommonObj>[];
  filteredSupplyChain: IDropdownItem[] = [];
  // selected supplychain details id and name
  selectedSupplyChain: IDropdownItem;
  isHomePage: boolean;

  constructor(
    public util: UtilService,
    public globalStore: GlobalStoreService,
    public routeService: RouterService,
    public storage: StorageService
  ) {
    util.loadGoogleMaps().subscribe();
  }

  initSubscription(): void {
    this.util.loadAppConstants();
    setTimeout(() => {
      this.initBackgroundCalls();
    }, 2000);
    const routeSub = this.routeService.routeChangeSubject$.subscribe(url => {
      this.hideDropdown = this.routeService.hideHeaderUrls(url);
      this.isHomePage = this.routeService.isHomePage(url);
      if (this.supplyChainList?.length) {
        this.filteredSupplyChain = this.createFilteredSupplyChain(
          this.supplyChainList
        );
        this.selectedSupplyChain = this.selectSupplyChain(this.supplyChainList);
      }
      if (window.innerWidth <= 992 && this.util.isToggled()) {
        this.util.toggleSidebar();
      }
    });
    this.pageApis.push(routeSub);

    const userDataSub = this.globalStore.userData$.subscribe({
      next: (data: IUserData) => {
        this.userData = data;
      },
    });
    this.pageApis.push(userDataSub);
  }

  initBackgroundCalls(): void {
    this.util.searchProduct('').subscribe();
    this.util.getCompany().subscribe();
    this.util.searchConnectedCompany('', true).subscribe();
  }

  setNodeIdVariable(value: string): void {
    this.nodeDetails.id = value;
  }

  setCurrentCompany(index: number): void {
    const { name } = this.userData.nodes[index];
    this.nodeDetails.name = name;
    this.storage.saveInStorage('companyName', name);
  }

  setBrandLogo(node: any): void {
    this.nodeDetails.brandLogo = node?.theme?.image || '';
  }

  gotoHome(): void {
    this.routeService.navigateUrl('/dashboard');
  }

  setActiveNode(id: string): void {
    const api = this.util
      .updateUser({
        default_node: id,
      })
      .subscribe({
        next: () => {
          this.gotoHome();
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    this.pageApis.push(api);
  }

  storeSupplyChainDetails(supplyChain: Partial<ICommonObj>): void {
    const { id, name } = supplyChain;
    this.storage.saveInStorage('supplyChainId', id);
    this.storage.saveInStorage('supplyChainName', name);
  }

  setSupplychains(): void {
    const api = this.util
      .getSupplyChains()
      .pipe(map((response: any) => this.processSupplyChainResponse(response)))
      .subscribe({
        next: ({
          supplyChainList,
          selectedSupplyChain,
          filteredSupplyChain,
        }: any) => {
          this.supplyChainList = supplyChainList;
          this.selectedSupplyChain = selectedSupplyChain;
          this.filteredSupplyChain = filteredSupplyChain;
        },
        error: (err: any) => {
          console.log(err);
          this.handleSupplyChainError();
        },
      });
    this.pageApis.push(api);
  }

  private handleSupplyChainError(): void {
    this.supplyChainList = [];
    this.filteredSupplyChain = [];
    this.globalStore.initSupplychainData(this.supplyChainList);
  }

  private processSupplyChainResponse(response: any): any {
    const { count, results } = response;
    const supplyChainList = count > 0 ? results : [];
    let selectedSupplyChain;
    let filteredSupplyChain;

    if (supplyChainList.length > 0) {
      selectedSupplyChain = this.selectSupplyChain(supplyChainList);
      filteredSupplyChain = this.createFilteredSupplyChain(supplyChainList);
    } else {
      filteredSupplyChain = [];
    }

    this.globalStore.initSupplychainData(supplyChainList);

    return { supplyChainList, selectedSupplyChain, filteredSupplyChain };
  }

  private selectSupplyChain(supplyChainList: any[]): any {
    const supplyChainId = this.storage.retrieveStoredData('supplyChainId');
    const chainIdIndex = supplyChainList.findIndex(e => e.id === supplyChainId);

    if (supplyChainId && chainIdIndex > -1) {
      const schainName = this.storage.retrieveStoredData('supplyChainName');
      return {
        id: supplyChainId,
        name: schainName || supplyChainList[chainIdIndex].name,
      };
    } else {
      const [firstChain] = supplyChainList;
      this.storeSupplyChainDetails(firstChain);
      return {
        id: firstChain.id,
        name: firstChain.name,
      };
    }
  }

  private createFilteredSupplyChain(supplyChainList: any[]): any[] {
    if (this.isHomePage) {
      return [
        { id: 'All', name: 'All supply chain' },
        ...supplyChainList.map(item => ({ id: item.id, name: item.name })),
      ];
    } else {
      return supplyChainList.map(item => ({ id: item.id, name: item.name }));
    }
  }

  toggleSidebar(): void {
    this.util.toggleSidebar();
  }
}
