/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICommonIdName, ICommonObj } from 'src/app/shared/configs/app.model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { RouterService, UtilService } from 'src/app/shared/service';
import { CLAIM_IMPORT, CLAIM_TABS } from './claim-list.config';
import { ClaimService } from '../claim.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { IPaginator } from 'fairfood-utils';
import { TranslateService } from '@ngx-translate/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule, ...CLAIM_IMPORT],
  templateUrl: './claim-list.component.html',
  styleUrls: ['./claim-list.component.scss'],
})
export class ClaimListComponent implements OnInit, OnDestroy {
  // default verificaton status
  statusFilter: ICommonIdName[] = [
    { id: 1, name: this.translate.instant('status.pending') },
    { id: 2, name: this.translate.instant('status.verified') },
    { id: 3, name: this.translate.instant('status.rejected') },
  ];

  toggleFilter: boolean;
  pageApis: Subscription[] = [];
  dataLoading = true;
  dataSource: any;

  appliedFilterValues: any;
  claimListOptions: any;
  tableLength: any;
  supplyChainId = localStorage.getItem('supplyChainId');
  claimTabs: ICommonObj[] = CLAIM_TABS;
  activeClaimTab: string;
  paginationReset: IPaginator;
  subscription: Subscription;
  customPageSize: { limit: any; offset: any };
  routerSubscription!: Subscription;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private utils: UtilService,
    private routerService: RouterService,
    private claimService: ClaimService,
    private global: GlobalStoreService,
    private translate: TranslateService,
    public router: Router
  ) {
    this.claimListOptions = {
      productData: [],
      assignorData: [],
      claimsData: [],
    };
    this.subscription = this.claimService.paginationState$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(state => {
        this.appliedFilterValues = state;
        this.customPageSize = {
          limit: this.appliedFilterValues?.limit,
          offset: this.appliedFilterValues?.offset,
        };
        this.toggleFilter = this.checkToggleFilter();
      });

    this.routerSubscription = this.router.events
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          const nextRoute = event.url;
          if (
            nextRoute !== '/claims' &&
            !nextRoute.startsWith('/claims/details')
          ) {
            this.claimService.resetPaginationState();
            this.claimService.selectedTab = 0;
          }
        }
      });
  }

  ngOnInit(): void {
    this.activeClaimTab = CLAIM_TABS[this.claimService.selectedTab]?.id;
    this.getAllProductsList();
    const supplyChainIdSub = this.utils.supplyChainData$.subscribe(res => {
      if (res && res !== this.supplyChainId) {
        this.supplyChainId = res;
        this.getAllProductsList();
      }
    });

    this.pageApis.push(supplyChainIdSub);
  }

  // method to get all products
  getAllProductsList(): void {
    const productSub = this.global.supplychainProducts$.subscribe({
      next: (res: any) => {
        if (res) {
          this.claimListOptions.productData = res;
          this.getClaims();
        }
      },
      error: () => {
        this.claimListOptions.productData = [];
        this.getClaims();
      },
    });

    this.pageApis.push(productSub);
  }

  // claims
  getClaims(): void {
    const API_CALL = this.claimService.getClaims().subscribe({
      next: (claims: any) => {
        this.claimListOptions.claimsData = claims;
        this.getAssignorData();
      },
      error: () => {
        this.claimListOptions.claimsData = [];
        this.getAssignorData();
      },
    });
    this.pageApis.push(API_CALL);
  }

  getAssignorData(): void {
    const API_CALL = this.claimService
      .claimAssignorList(true, false)
      .subscribe({
        next: (claims: any) => {
          this.claimListOptions.assignorData = claims;
          this.getVerificationList();
        },
        error: () => {
          this.claimListOptions.assignorData = [];
          this.getVerificationList();
        },
      });
    this.pageApis.push(API_CALL);
  }

  // List all verifications requests originated from the selected node
  getVerificationList(): void {
    this.dataLoading = true;
    this.dataSource = [];
    const isReceived = this.claimService.selectedTab == 1 ? true : false;
    const api = this.claimService
      .veriticationRequests(this.appliedFilterValues, isReceived)
      .subscribe((res: any) => {
        const { results, count } = res;
        this.tableLength = count;
        this.dataSource = results;
        this.dataLoading = false;
      });
    this.pageApis.push(api);
  }

  // filtering table data using status
  filterByStatus(status: any): void {
    this.resetFilter();
    this.appliedFilterValues.status = status.id;
    this.toggleFilter = false;
    this.getVerificationList();
  }

  // View claim details
  viewDetails(id: string): void {
    this.claimService.setPaginationState(this.appliedFilterValues);
    this.routerService.navigateArray(['claims/details', id]);
  }

  resetFilter(): void {
    this.claimService.resetPaginationState();
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
  }

  searchFilter(searchString: string): void {
    this.appliedFilterValues.offset = 0;
    this.appliedFilterValues.limit = 10;
    this.appliedFilterValues.searchString = searchString;
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
    this.getVerificationList();
  }

  filterClicked(): void {
    this.toggleFilter = !this.toggleFilter;
    if (!this.toggleFilter) {
      this.resetFilter();
      this.getVerificationList();
    }
  }

  filterClaims(selectedObj: any, label: string): void {
    this.appliedFilterValues.offset = 0;
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
    const selectedValue = selectedObj.id === 'All' ? '' : selectedObj.id;
    if (label === 'product') {
      this.appliedFilterValues.selectedProduct = selectedValue;
    } else if (label === 'assignor') {
      this.appliedFilterValues.selectedAssignor = selectedValue;
    } else if (label === 'claim') {
      this.appliedFilterValues.selectedClaim = selectedValue;
    } else {
      this.appliedFilterValues.status = selectedValue;
    }
    this.getVerificationList();
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.appliedFilterValues.limit = limit;
    this.appliedFilterValues.offset = offset;
    this.customPageSize = {
      limit: this.appliedFilterValues?.limit,
      offset: this.appliedFilterValues?.offset,
    };
    this.getVerificationList();
  }

  trackByFn(index: number): number {
    return index;
  }

  changeTab(tab: ICommonObj): void {
    this.activeClaimTab = tab.id;
    this.toggleFilter = false;
    this.paginationReset = {
      limit: 10,
      offset: 0,
    };
    this.resetFilter();
    if (tab.id === CLAIM_TABS[1].id) {
      this.claimService.selectedTab = 1;
      this.getVerificationList();
    } else {
      this.claimService.selectedTab = 0;
      this.getVerificationList();
    }
  }

  private checkToggleFilter(): boolean {
    return !!(
      this.appliedFilterValues.selectedClaim ||
      this.appliedFilterValues.selectedAssignor ||
      this.appliedFilterValues.status ||
      this.appliedFilterValues.selectedProduct
    );
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
