/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { CompanyProfileService } from '../company-profile.service';
import { CHAIN_COLUMNS } from './supply-chain.config';
// components
import { LoaderComponent, FfPaginationComponent } from 'fairfood-utils';

@Component({
  selector: 'app-supply-chains',
  templateUrl: './supply-chains.component.html',
  styleUrls: ['./supply-chains.component.scss'],
  standalone: true,
  imports: [CommonModule, FfPaginationComponent, LoaderComponent],
})
export class SupplyChainsComponent implements OnInit, OnDestroy {
  @Input() companyId: any;
  loader = true;
  supplyChainData: any;
  supplyChainCount: any;
  supplyChainColumns = CHAIN_COLUMNS;
  limit = 10;
  offset = 0;
  pageApis: Subscription[] = [];

  constructor(private companyService: CompanyProfileService) {}

  ngOnInit(): void {
    this.getActiveSupplyChains();
  }

  getActiveSupplyChains(): void {
    this.supplyChainData = [];
    const api = this.companyService
      .getActiveSupplyChains(this.companyId, this.limit, this.offset)
      .subscribe((res: any) => {
        const { count, results } = res;
        this.supplyChainData = results || [];
        this.supplyChainCount = count;
        this.loader = false;
      });
    this.pageApis.push(api);
  }

  paginatorEvent(data: any): void {
    const { limit, offset } = data;
    this.limit = limit;
    this.offset = offset;
    this.loadSupplyChain();
  }

  loadSupplyChain(): void {
    this.loader = true;
    this.getActiveSupplyChains();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
