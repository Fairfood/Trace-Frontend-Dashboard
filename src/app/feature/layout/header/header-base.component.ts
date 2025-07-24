/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, concatMap, map, of } from 'rxjs';

import {
  IDropdownItem,
  ICommonObj,
  IUserData,
  ISupplyChain,
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
  supplyChainList: ISupplyChain[];
  filteredSupplyChain: IDropdownItem[] = [];
  // selected supplychain details id and name
  selectedSupplyChain: IDropdownItem;
  isHomePage: boolean;

  constructor(
    protected util: UtilService,
    protected globalStore: GlobalStoreService,
    protected routeService: RouterService,
    protected storage: StorageService
  ) {
    // first time load
    util.loadGoogleMaps();
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
    of(null)
      .pipe(
        // First API call
        concatMap(() => this.util.searchProduct('')),
        // Second API call
        concatMap(() => this.util.getCompany()),
        // Third API call
        concatMap(() => this.util.searchConnectedCompany('', true))
      )
      .subscribe({
        next: () => {
          // All calls completed successfully
          console.log('All API calls completed');
        },
        error: error => {
          // Handle error
          console.error('Error:', error);
        },
      });
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

  /* istanbul ignore next */
  gotoHome(): void {
    this.routeService.navigateUrl('/dashboard');
  }

  /**
   * WHen user changes the company it will be set as active node or default node
   */
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

  /* istanbul ignore next */
  setSupplychains(callProductList?: boolean): void {
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

          if (callProductList) {
            this.util.searchProduct('').subscribe();
            this.util.getCompany().subscribe();
          }
        },
        error: (err: any) => {
          console.log(err);
          this.handleSupplyChainError();
        },
      });
    this.pageApis.push(api);
  }

  /* istanbul ignore next */
  private handleSupplyChainError(): void {
    this.supplyChainList = [];
    this.filteredSupplyChain = [];
    this.globalStore.initSupplychainData(this.supplyChainList);
  }

  /* istanbul ignore next */
  private processSupplyChainResponse(response: any): any {
    const { count, results } = response;
    const supplyChainList = count > 0 ? results : [];
    let selectedSupplyChain;
    let filteredSupplyChain: any;

    if (supplyChainList.length > 0) {
      selectedSupplyChain = this.selectSupplyChain(supplyChainList);
      filteredSupplyChain = this.createFilteredSupplyChain(supplyChainList);
    } else {
      filteredSupplyChain = [];
    }

    this.globalStore.initSupplychainData(supplyChainList);

    return { supplyChainList, selectedSupplyChain, filteredSupplyChain };
  }

  selectSupplyChain(supplyChainList: ISupplyChain[]): IDropdownItem {
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

  createFilteredSupplyChain(supplyChainList: ISupplyChain[]): IDropdownItem[] {
    const filteredSupplyChain = supplyChainList.map(({ id, name }) => ({
      id,
      name,
    }));

    if (this.isHomePage) {
      filteredSupplyChain.unshift({ id: 'All', name: 'All supply chain' });
    }

    return filteredSupplyChain;
  }

  /* istanbul ignore next */
  toggleSidebar(): void {
    this.util.toggleSidebar();
  }
}
