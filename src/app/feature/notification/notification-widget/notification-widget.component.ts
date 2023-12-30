/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, timer } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';

import { NotificationService } from '../notification.service';
import { GlobalStoreService } from 'src/app/shared/store';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';
import { checkIfToday } from 'src/app/shared/configs/app.methods';
import { IUserData } from 'src/app/shared/configs/app.model';
import { AvatarNotificationPipe } from '../notification.pipe';
import { SwitchCompanyComponent } from '../switch-company/switch-company.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

const TIMER_DURATION = 15 * 60 * 1000;
@Component({
  selector: 'app-notification-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatDialogModule,
    AvatarNotificationPipe,
    SwitchCompanyComponent,
  ],
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
})
export class NotificationWidgetComponent implements OnInit, OnDestroy {
  @Output() supplyChainUpdate = new EventEmitter();
  @Output() switchCompany = new EventEmitter();

  pageApis: Subscription[] = [];
  notificationList: any[];
  unreadNotification: number;
  newNotification = false;
  subscription: Subscription;
  userData: Partial<IUserData>;
  notificationObject: any;
  constructor(
    private service: NotificationService,
    private globalStore: GlobalStoreService,
    private routeService: RouterService,
    private storage: StorageService,
    private dialog: MatDialog,
    private util: UtilService
  ) {}

  ngOnInit(): void {
    // Calling notification api to at interval of 10 sec
    this.subscription = timer(0, TIMER_DURATION).subscribe(() => {
      this.loadNotification();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
      } else {
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        this.subscription = timer(0, TIMER_DURATION).subscribe(() => {
          this.loadNotification();
        });
      }
    });

    const userDataSub = this.globalStore.userData$.subscribe({
      next: (data: IUserData) => {
        this.userData = data;
      },
    });
    this.pageApis.push(userDataSub);

    const readNot = this.service.notificationSubject.subscribe({
      next: (res: { type: number; notification?: any }) => {
        const { type, notification } = res;
        if (type === 1) {
          this.readSingleNotification(notification);
        } else {
          this.readAllNotification();
        }
      },
    });
    this.pageApis.push(readNot);

    if (
      this.notificationObject &&
      this.notificationObject.user_id === this.userData.id
    ) {
      this.notificationTarget(this.notificationObject);
    }
  }

  // Load notifications
  loadNotification(): void {
    const limit = 4,
      offset = 0,
      keyword = '',
      nodeId = '';
    const api = this.service
      .getNotifications(limit, offset, keyword, nodeId)
      .subscribe({
        next: (response: any) => {
          const { results, unread } = response;
          this.notificationList = results;
          results.forEach((notification: any) => {
            notification.today = checkIfToday(notification.created_on);
          });
          if (this.unreadNotification === undefined) {
            if (unread !== 0) {
              this.newNotification = true;
            }
          } else if (unread > this.unreadNotification) {
            this.newNotification = true;
          }
          this.unreadNotification = unread;
        },
        error: err => {
          console.log('err', err);
        },
      });
    this.pageApis.push(api);
  }

  clearNewNotification(): void {
    this.newNotification = false;
  }

  // read all notification
  readAllNotification(): void {
    this.readNotification(
      {
        all: true,
      },
      true
    );
  }

  readSingleNotification(notification: any): void {
    const { is_read, id } = notification;
    if (!is_read) {
      const a = [id];
      this.readNotification(
        {
          ids: a,
        },
        false,
        notification
      );
    }
    this.notificationTarget(notification);
  }

  readNotification(reqObj: any, readAll: boolean, notification?: any): void {
    const api = this.service.readNotification(reqObj).subscribe({
      next: () => {
        if (readAll) {
          this.unreadNotification = 0;
          this.util.customSnackBar(
            'All notifications marked as read',
            ACTION_TYPE.SUCCESS
          );
        } else {
          this.unreadNotification -= 1;
          notification.is_read = true;
          this.util.customSnackBar(
            'Notification marked as read',
            ACTION_TYPE.SUCCESS
          );
        }
      },
      error: (err: any) => {
        console.log('(err)', err);
      },
    });
    this.pageApis.push(api);
  }

  notificationTarget(notification: any): void {
    if (notification.target_node) {
      const company = this.userData.nodes.find(
        (c: any) => c.id === notification.target_node
      );

      if (!company) {
        this.storage.saveInStorage(
          'notificationObject',
          JSON.stringify(notification)
        );
        // todo
        // this.getUser();
      } else {
        if (
          notification.target_node !==
          this.storage.retrieveStoredData('companyID')
        ) {
          this.openTeamAddDialog(notification, company);
        } else {
          this.redirectNotification(notification);
        }
      }
    } else {
      this.routeService.navigateUrl('user-profile');
    }
  }

  // popup to change node
  openTeamAddDialog(notification: any, company: any): void {
    const dialogRef = this.dialog.open(SwitchCompanyComponent, {
      disableClose: true,
      width: '427px',
      height: 'auto',
      data: company,
      panelClass: 'custom-modalbox',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'change') {
        const { target_node } = notification;
        this.switchCompany.emit(target_node);
        this.redirectNotification(notification);
        this.notificationObject = null;
      } else {
        this.notificationObject = null;
      }
    });
  }

  redirectNotification(notification: any): void {
    const { supply_chain } = notification;
    if (
      supply_chain &&
      supply_chain !== this.storage.retrieveStoredData('supplyChainId')
    ) {
      this.supplyChainUpdate.emit(supply_chain);
    }
    this.storage.saveInStorage('notificationObject', null);
    this.notificationObject = null;
    this.service.handleEventRouting(notification);
  }

  viewAll(): void {
    this.routeService.navigateUrl('/user-profile');
  }

  trackByFn(index: number, item: any): number {
    return item.itemId;
  }

  // Un-subscribing subscription to prevent memory leak
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
