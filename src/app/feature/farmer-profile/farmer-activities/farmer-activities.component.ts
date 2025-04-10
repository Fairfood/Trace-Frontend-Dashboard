import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { IReference } from '../farmer-profile.config';
import {
  FfPaginationComponent,
  IPaginator,
  LoaderComponent,
  FfCustomPaginationComponent,
} from 'fairfood-utils';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-farmer-activities',
  templateUrl: './farmer-activities.component.html',
  styleUrls: ['./farmer-activities.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    LoaderComponent,
    FfPaginationComponent,
    FfCustomPaginationComponent,
  ],
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

  /* istanbul ignore next */
  ngOnInit(): void {
    this.sub = this.store.activities$.subscribe({
      next: (res: IReference) => {
        this.activities = res;
      },
    });
  }

  /* istanbul ignore next */
  paginatorEvent(data: IPaginator): void {
    const { limit, offset } = data;
    this.store.updateStateProp<IReference>('activities', {
      count: 0,
      loading: true,
      results: [],
    });
    this.store.farmerActivities(this.farmerId, limit, offset);
  }

  /* istanbul ignore next */
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
