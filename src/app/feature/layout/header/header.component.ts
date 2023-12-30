/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// material
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

// services
import {
  StorageService,
  UtilService,
  RouterService,
} from 'src/app/shared/service';
import { HeaderService } from './header.service';
import { GlobalStoreService } from 'src/app/shared/store';
// component
import { HeaderBaseComponent } from './header-base.component';
import { NotificationWidgetComponent } from '../../notification';
import { DownloadsComponent } from '../downloads/downloads.component';
import { AvatarPipe } from './header.pipe';
import { FfDropdownComponent } from 'fairfood-form-components';
// configs
import { environment } from 'src/environments/environment';
import { ICommonObj } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatIconModule,
    AvatarPipe,
    RouterModule,
    NotificationWidgetComponent,
    DownloadsComponent,
    FfDropdownComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent
  extends HeaderBaseComponent
  implements OnInit, OnDestroy
{
  @Output() dataLoading = new EventEmitter<string>();
  constructor(
    private headerService: HeaderService,
    routeService: RouterService,
    util: UtilService,
    globalStore: GlobalStoreService,
    storage: StorageService
  ) {
    super(util, globalStore, routeService, storage);
  }

  ngOnInit(): void {
    this.dataLoading.emit('started');
    this.initSubscription();
    this.nodeDetails.id = this.storage.retrieveStoredData('companyID');
    this.storage.saveInStorage('ci_theme', 'fairfood');
    this.getUser();
  }

  getUser(): void {
    const userData = this.storage.retrieveStoredData('userData');

    const userId = JSON.parse(userData).id;
    this.notificationObject = JSON.parse(
      this.storage.retrieveStoredData('notificationObject')
    );

    const api = this.util.getUserDetails(userId).subscribe({
      next: (response: any) => {
        this.userData = response;
        const impersonate = this.storage.retrieveStoredData('impersonate');
        const localNodeId = this.storage.retrieveStoredData('companyID');
        this.viewingAsAdmin = impersonate === 'true' ? true : false;

        if (this.userData?.nodes?.length > 0) {
          if (!this.userData.default_node) {
            this.noDefaultNode(this.userData.nodes[0].id);
          } else {
            this.hasDefaultNode(impersonate, localNodeId);
          }
        } else {
          this.emptyNodes(localNodeId);
          this.setSupplychains();
        }
        this.globalStore.updateUserData(this.userData);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    this.pageApis.push(api);
  }

  backtoAdmin(): void {
    localStorage.clear();
    this.storage.clearStorage();
    window.location.href = environment.adminUrl + '?isClearStorage=true';
  }

  // Logout function
  onLoggedout() {
    this.headerService.logout();
  }

  // Function to switch company
  changeCompany(id: string, index: number): void {
    this.setNodeIdVariable(id);
    this.setCurrentCompany(index);
    this.storage.saveInStorage('companyID', id);
    this.userData.default_node = id;
    this.setActiveNode(id);
    this.setSupplychains();
    this.setTheme(id);
    this.util.companyData$.next(id);
  }

  trackById(index: number, item: Partial<ICommonObj>): any {
    return item.id;
  }

  private emptyNodes(localNodeId: string): void {
    this.setNodeIdVariable(localNodeId);
    this.setTheme(localNodeId);
  }

  private noDefaultNode(nodeId: string): void {
    this.storage.saveInStorage('companyID', nodeId);
    this.setNodeIdVariable(nodeId);
    this.setCurrentCompany(0);
    this.setActiveNode(nodeId);
    this.headerService.handleDashboardTheme(this.userData.nodes[0].ci_themes);
    this.setTheme(nodeId);
    this.setSupplychains();
  }

  private hasDefaultNode(impersonate: string, localNodeId: string): void {
    if (!impersonate) {
      this.storage.saveInStorage('companyID', this.userData.default_node);
      const index = this.userData.nodes.findIndex(
        f => f.id === this.userData.default_node
      );
      this.setCurrentCompany(index);
      this.setNodeIdVariable(this.userData.default_node);
      this.setTheme(this.userData.default_node);
    } else {
      this.setNodeIdVariable(localNodeId);
      this.setTheme(localNodeId);
    }

    this.setSupplychains();
  }

  private setTheme(nodeId: string): void {
    const node = this.userData.nodes.find((e: any) => {
      return e.id === nodeId;
    });

    if (node) {
      this.storage.saveInStorage('memberType', node.member_role);
      if (node?.theme?.id) {
        this.headerService.handleThemeUpdate(node);
      } else {
        this.headerService.handleDefaultTheme();
      }
      this.headerService.handleCiThemes(node.ci_themes);
    } else {
      this.headerService.handleNodeWithoutTheme();
    }
    this.setBrandLogo(node);
    this.dataLoading.emit('completed');
    this.dataLoaded = true;
  }

  changeSupplychain(chain: any): void {
    if (this.selectedSupplyChain.id && chain.id !== 'All') {
      this.storeSupplyChainDetails(chain);
      this.util.supplyChainData$.next(this.selectedSupplyChain.id);
      this.util.allSupplyChain$.next(false);
      this.initBackgroundCalls();
    } else {
      this.util.allSupplyChain$.next(true);
    }

    this.selectedSupplyChain = chain;
  }

  notificationChange(id: string): void {
    // when clicked on notification supplychain changed
    const chain = this.filteredSupplyChain.find(a => a.id === id);
    this.storeSupplyChainDetails(chain);
    this.selectedSupplyChain = chain;
    this.util.supplyChainData$.next(this.selectedSupplyChain.id);
  }

  notificationSwitchCompany(companyId: string): void {
    const index = this.userData.nodes.findIndex(a => a.id === companyId);
    this.changeCompany(companyId, index);
  }

  // Un-subscribing subscription to prevent memory leak
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
