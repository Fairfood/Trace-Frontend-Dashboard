import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { IReference } from '../farmer-profile.config';
import { IPaginator } from 'fairfood-utils';

@Component({
  selector: 'app-farmer-activities',
  templateUrl: './farmer-activities.component.html',
  styleUrls: ['./farmer-activities.component.scss'],
})
export class FarmerActivitiesComponent implements OnInit, OnDestroy {
  @Input() farmerId: string;
  sub: Subscription;
  activities: IReference;

  constructor(private store: FarmerProfileStoreService) {
    this.activities = {
      count: 0,
      results: [],
      loading: true,
    };
  }

  ngOnInit(): void {
    this.sub = this.store.activities$.subscribe({
      next: (res: IReference) => {
        this.activities = res;
      },
    });
  }

  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.store.setActivities({ count: 0, results: [], loading: true });
    this.store.farmerActivities(this.farmerId, limit, offset);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
