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
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
// services
import { StorageService, UtilService } from 'src/app/shared/service';
import { AuthService } from '../../authentication/auth.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { StockProcessService } from '../../stock/process-stock';
import { ListingStoreService } from '../../stock/listing/listing-store.service';
// model
import { IUserData } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() collapsedEvent = new EventEmitter<boolean>();
  viewAsAdmin: boolean;
  companyDetails: any;
  adminUser: boolean;
  showMenu: string;
  verificationCount = 0;
  pageApis: Subscription[] = [];
  userData: Partial<IUserData>;
  constructor(
    private storeService: StorageService,
    private auth: AuthService,
    private global: GlobalStoreService,
    private util: UtilService,
    private processService: StockProcessService,
    private listing: ListingStoreService
  ) {}

  ngOnInit(): void {
    this.initSubscription();
    this.addExpandClass('assets');
  }

  /**
   * Initializes the subscription for the component.
   */
  initSubscription(): void {
    const api = this.global.userData$.subscribe({
      next: (user: Partial<IUserData>) => {
        if (user) {
          this.userData = user;
          this.setVariables();
        }
      },
    });
    this.pageApis.push(api);

    const api2 = this.util.companyData$.subscribe({
      next: (id: string) => {
        if (id) {
          this.getVerificationCount();
          this.setVariables();
        }
      },
    });
    this.pageApis.push(api2);
  }

  /**
   * Gets the verification count.
   */
  getVerificationCount(): void {
    const api3 = this.util
      .listReceivedVerifications(1)
      .subscribe((res: any) => {
        const { count } = res;
        this.verificationCount = count;
      });
    this.pageApis.push(api3);
  }

  setVariables(): void {
    const id = this.storeService.retrieveStoredData('companyID');
    const company = this.userData.nodes.find(e => e.id === id);
    if (company) {
      this.companyDetails = company;
    }

    this.viewAsAdmin = this.storeService.retrieveStoredData('impersonate')
      ? true
      : false;

    if (this.viewAsAdmin) {
      this.adminUser = true;
    } else {
      if (this.companyDetails) {
        this.adminUser = company.member_role === 1;
      }
    }
  }

  /**
   * Reset the stock store to default state
   * @param stock - boolean value to reset stock or not
   */
  resetStock(stock?: boolean): void {
    if (!stock) {
      setTimeout(() => {
        this.listing.resetState();
      }, 1000);
    }
    if (this.processService.transactionState) {
      this.processService.stockStateReset();
      this.processService.emitNewTransactionState();
    }
    this.processService.claimStateReset();
    this.processService.changeClaimData();
    if (this.processService.listingInfo) {
      this.processService.updateListingInfo(null);
    }
    if (this.processService.summaryData) {
      this.processService.updateSummaryData(null);
    }
  }

  addExpandClass(element: string) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  /**
   * Making sure that not viewing as admin
   * and then logout the user
   */
  logout(): void {
    if (!this.viewAsAdmin) {
      this.auth.logout();
    }
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
