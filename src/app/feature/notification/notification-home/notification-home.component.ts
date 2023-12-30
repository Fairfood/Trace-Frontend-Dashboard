/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
// services
import { NotificationService } from '../notification.service';
import { GlobalStoreService } from 'src/app/shared/store';
// config
import { IDropdownItem, IUserData } from 'src/app/shared/configs/app.model';
import { checkIfToday } from 'src/app/shared/configs/app.methods';
// components
import { LoaderComponent } from 'fairfood-utils';
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { AvatarNotificationPipe, FilterTodayPipe } from '../notification.pipe';

@Component({
  selector: 'app-notification-home',
  standalone: true,
  imports: [
    CommonModule,
    FilterTodayPipe,
    MatMenuModule,
    AvatarNotificationPipe,
    LoaderComponent,
    SearchBoxComponent,
    FfFilterBoxWrapperComponent,
    TranslateModule,
  ],
  templateUrl: './notification-home.component.html',
  styleUrls: ['./notification-home.component.scss'],
})
export class NotificationHomeComponent implements OnDestroy, OnInit {
  params = {
    limit: 50,
    offset: 0,
    search: '',
    selectedNode: '',
  };
  pageApis: Subscription[] = [];
  notificationList: any[];
  nodes: IDropdownItem[] = [];
  showUnread = false;
  todayNotification: boolean;
  earlierNotification: boolean;
  loading = true;

  constructor(
    private service: NotificationService,
    private global: GlobalStoreService
  ) {}

  ngOnInit(): void {
    const userApi = this.global.userData$.subscribe({
      next: (userData: Partial<IUserData>) => {
        if (userData) {
          this.nodes = userData?.nodes.map(s => {
            const { id, name } = s;
            return { id, name };
          });
          this.loadNotifications();
        }
      },
    });
    this.pageApis.push(userApi);
  }

  loadNotifications(): void {
    const { limit, offset, search, selectedNode } = this.params;
    const api = this.service
      .getNotifications(limit, offset, search, selectedNode)
      .subscribe({
        next: (resp: any) => {
          const { results } = resp;
          this.notificationList = this.showUnread
            ? results.filter((not: any) => !not.is_read)
            : results;

          this.notificationList.forEach(not => {
            not.today = checkIfToday(not.created_on);
          });

          this.todayNotification = this.notificationList.some(not => not.today);
          this.earlierNotification = this.notificationList.some(
            not => !not.today
          );
          this.loading = false;
        },
        error: (err: any) => {
          console.log(err);
          this.loading = false;
        },
      });
    this.pageApis.push(api);
  }

  read(notification: any): void {
    this.service.notificationSubject.next({ type: 1, notification });
  }

  markRead(): void {
    this.service.notificationSubject.next({ type: 2 });
    this.notificationList.forEach(notification => {
      notification.is_read = true;
    });
  }

  searchFilter(search: string): void {
    this.loading = true;
    this.params.search = search;
    this.loadNotifications();
  }

  changePreference(data: any): void {
    const { id } = data;
    const selectedValue = id === 'All' ? '' : id;
    this.params.selectedNode = selectedValue;
    this.loading = true;
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
