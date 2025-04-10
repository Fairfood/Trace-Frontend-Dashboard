/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
// services
import { CompanyProfileService } from '../company-profile.service';
// configs, constants
import { ITableColumnHeader } from 'src/app/shared/configs/app.model';
import { CLAIM_COLUMNS } from './company-claim.config';
// components
import {
  LoaderComponent,
  FfPaginationComponent,
  IPaginator,
  FfCustomPaginationComponent,
} from 'fairfood-utils';

@Component({
  selector: 'app-company-claims',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FfPaginationComponent,
    LoaderComponent,
    TranslateModule,
    FfCustomPaginationComponent,
  ],
  templateUrl: './company-claims.component.html',
  styleUrls: ['./company-claims.component.scss'],
})
export class CompanyClaimsComponent implements OnInit, OnDestroy {
  @Input() companyId: any;

  pageApis: Subscription[] = [];
  appliedFilter: { limit: number; offset: number };
  dataSource: any;
  publicClaims: any;
  companyClaimsCount: any;
  loader = true;
  displayedColumns: ITableColumnHeader[] = CLAIM_COLUMNS;

  constructor(
    private companyService: CompanyProfileService,
    private dialog: MatDialog
  ) {
    this.appliedFilter = {
      limit: 10,
      offset: 0,
    };
  }

  ngOnInit(): void {
    this.getCompanyClaims();
  }

  /* istanbul ignore next */
  getCompanyClaims(): void {
    const { limit, offset } = this.appliedFilter;
    const api = this.companyService
      .listCompanyClaims(this.companyId, limit, offset)
      .subscribe((res: any) => {
        const { results, count } = res;
        this.publicClaims = results;
        this.dataSource = results;
        this.companyClaimsCount = count;
        this.loader = false;
      });
    this.pageApis.push(api);
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.appliedFilter.limit = limit;
    this.appliedFilter.offset = offset;
    this.loader = true;
    this.getCompanyClaims();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
