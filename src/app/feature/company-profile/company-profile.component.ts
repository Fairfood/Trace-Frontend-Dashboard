/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
  IMPORTS,
  OTHER_COMPANY_TABS,
  PROFILE_TABS,
  PROFILE_TABS_MORE,
} from './company-profile.config';
import { ICommonObj, IUserData } from 'src/app/shared/configs/app.model';

// services
import { GlobalStoreService } from 'src/app/shared/store';
import { CompanyProfileService } from './company-profile.service';
import { CompanyProfileStoreService } from './company-profile-store.service';
import { StorageService, UtilService } from 'src/app/shared/service';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, ...IMPORTS],
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.scss'],
})
export class CompanyProfileComponent implements OnInit, OnDestroy {
  companyProfileData: any;
  tabGroup: ICommonObj[];
  isConnection: boolean;
  moreTabs: ICommonObj[];
  activeTabId: string;
  pageApis: Subscription[] = [];
  userData: Partial<IUserData>;
  companyId: string;
  companyPic: any;
  isCompanyAdmin: boolean;

  isEdit: boolean;
  dataLoaded: boolean;
  constructor(
    private utils: UtilService,
    private storage: StorageService,
    private global: GlobalStoreService,
    private companyService: CompanyProfileService,
    private store: CompanyProfileStoreService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const otherCompanyId = this.route.snapshot.paramMap.get('companyId');
    if (otherCompanyId) {
      this.tabGroup = OTHER_COMPANY_TABS;
      this.isConnection = true;
    } else {
      this.tabGroup = PROFILE_TABS;
      this.moreTabs = [...PROFILE_TABS_MORE];
      this.isConnection = false;
    }
    this.activeTabId = this.tabGroup[0].id;

    const activeSupplyAdded = this.storage.retrieveStoredData(
      'active-supply-chain-added'
    );
    if (activeSupplyAdded === 'true') {
      const schainId = this.storage.retrieveStoredData('supplyChainId');
      this.utils.supplyChainData$.next(schainId);
      this.storage.saveInStorage('active-supply-chain-added', 'false');
    }
    this.initSubscription(otherCompanyId);
  }

  initSubscription(companyId: string): void {
    const userApi = this.global.userData$.subscribe({
      next: (userData: Partial<IUserData>) => {
        if (userData?.nodes) {
          this.userData = userData;
          this.companyId = this.storage.retrieveStoredData('companyID');
          this.companyService.fetchCompanyProfileDetails(companyId);
        }
      },
    });
    this.pageApis.push(userApi);

    const profileDataSub = this.store.profileData$.subscribe({
      next: (res: any) => {
        if (res) {
          this.companyProfileData = res;
          this.setCompanyData();
        }
      },
    });

    this.pageApis.push(profileDataSub);
  }

  setCompanyData(): void {
    const { image, name, is_admin } = this.companyProfileData;
    this.companyPic = image;
    const splitName = name.split(' ');
    this.companyProfileData.icon =
      (splitName[0].charAt(0) || '') + (splitName[1]?.charAt(0) || '');
    this.isCompanyAdmin = is_admin;
    const sub = this.global.countryList$
      .pipe(
        tap(res => {
          if (res) {
            const found = res.find(
              (a: any) => a.id === this.companyProfileData.country
            );
            this.companyProfileData.countryFlag = found.flag_url;
          }
        })
      )
      .subscribe();
    this.pageApis.push(sub);
    this.dataLoaded = true;
  }

  openImageUpload(data: { type: string; formData: any; image?: string }): void {
    const { type, formData, image } = data;

    if (type === 'upload' || type === 'delete') {
      this.companyService.companyImageUpdated = true;
      this.companyService.currentImageData = formData;
      this.companyPic = image;
    } else {
      this.companyService.companyImageUpdated = true;
      this.companyService.currentImageData = null;
    }
  }

  changeTab(item: any): void {
    this.activeTabId = item.id;
  }

  toggleEdit(val: boolean): void {
    this.isEdit = val;
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
