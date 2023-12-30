/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICommonIdName } from 'src/app/shared/configs/app.model';
import { Subscription } from 'rxjs';
import { RouterService, UtilService } from 'src/app/shared/service';
import { CLAIM_IMPORT } from './claim-list.config';
import { ClaimService } from '../claim.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { IPaginator } from 'fairfood-utils';

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
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Verified' },
    { id: 3, name: 'Rejected' },
  ];

  toggleFilter: boolean;
  pageApis: Subscription[] = [];
  dataLoading = true;
  dataSource: any;

  appliedFilterValues: any;
  claimListOptions: any;
  tableLength: any;
  supplyChainId = localStorage.getItem('supplyChainId');

  constructor(
    private utils: UtilService,
    private routerService: RouterService,
    private claimService: ClaimService,
    private global: GlobalStoreService
  ) {
    this.claimListOptions = {
      productData: [],
      assignorData: [],
      claimsData: [],
    };
    this.appliedFilterValues = {
      selectedProduct: '',
      selectedClaim: '',
      selectedAssignor: '',
      searchString: '',
      limit: 6,
      offset: 0,
      status: '',
    };
  }

  ngOnInit(): void {
    this.resetFilter();
    this.getAllProductsList();
    const supplyChainIdSub = this.utils.supplyChainData$.subscribe(res => {
      if (res && res !== this.supplyChainId) {
        this.supplyChainId = res;
        this.resetFilter();
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
    const api = this.claimService
      .veriticationRequests(this.appliedFilterValues)
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
    this.routerService.navigateArray(['claims/details', id]);
  }

  resetFilter(): void {
    this.appliedFilterValues = {
      selectedProduct: '',
      selectedClaim: '',
      selectedAssignor: '',
      searchString: '',
      limit: 10,
      offset: 0,
      status: '',
    };
  }

  searchFilter(searchString: string): void {
    this.appliedFilterValues.offset = 0;
    this.appliedFilterValues.limit = 0;
    this.appliedFilterValues.searchString = searchString;
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
    this.appliedFilterValues.limit = 0;
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
    this.getVerificationList();
  }

  ngOnDestroy(): void {
    this.pageApis?.forEach(a => a.unsubscribe());
  }
}
