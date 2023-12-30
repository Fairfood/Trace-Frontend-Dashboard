/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompanyProfileService } from '../company-profile.service';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from 'fairfood-utils';
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet/common-wallet.component';

@Component({
  selector: 'app-wallet-tab',
  templateUrl: './wallet-tab.component.html',
  styleUrls: ['./wallet-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, LoaderComponent, CommonWalletComponent],
})
export class WalletTabComponent implements OnInit, OnDestroy {
  loader = true;
  walletData: any;
  walletCount: any;
  pageApi: Subscription;

  constructor(private companyService: CompanyProfileService) {}

  ngOnInit(): void {
    this.getWallets();
  }

  getWallets() {
    this.pageApi = this.companyService.getWallets().subscribe((res: any) => {
      const { results, count } = res;
      this.walletData = results || [];
      this.walletCount = count;
      this.loader = false;
    });
  }

  ngOnDestroy(): void {
    this.pageApi.unsubscribe();
  }
}
