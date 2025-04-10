/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CompanyProfileService } from '../company-profile.service';
import { LoaderComponent } from 'fairfood-utils';
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet';

@Component({
  selector: 'app-wallet-tab',
  templateUrl: './wallet-tab.component.html',
  styleUrls: ['./wallet-tab.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    CommonWalletComponent,
    TranslateModule,
  ],
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
