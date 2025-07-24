/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
// components
import {
  LoaderComponent,
  FfPaginationComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';
import { CompanyProfileService } from '../company-profile.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    FfPaginationComponent,
    TranslateModule,
    FfCustomPaginationComponent,
  ],
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  @Input() companyId: string;
  activities: { count: number; results: any[]; loading: boolean };
  sub: Subscription;
  appliedFilter: any;

  constructor(private cService: CompanyProfileService) {
    this.activities = {
      count: 0,
      results: [],
      loading: true,
    };
    this.appliedFilter = {
      limit: 10,
      offset: 0,
    };
  }

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    const { limit, offset } = this.appliedFilter;
    this.sub = this.cService
      .activityLog(limit, offset, this.companyId)
      .subscribe((res: any) => {
        const { results, count } = res;
        this.activities.count = count;
        this.activities.results = results;
        this.activities.loading = false;
      });
  }

  paginatorEvent(data: any): void {
    const { limit, offset } = data;
    this.appliedFilter.limit = limit;
    this.appliedFilter.offset = offset;
    this.activities.loading = true;
    this.loadActivities();
  }

  trackByFn(index: number): any {
    return index;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
