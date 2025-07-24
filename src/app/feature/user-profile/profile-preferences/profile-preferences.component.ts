/* eslint-disable @typescript-eslint/no-explicit-any */
'/* eslint-disable @typescript-eslint/no-explicit-any */   ';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { LoaderComponent } from 'fairfood-utils';
//services
import { UtilService } from 'src/app/shared/service';
// configs
import {
  REMAINDERS_NOTIFICATION_PREFERENCES,
  REQUESTS_NOTIFICATION_PREFERENCES,
  TR_CLAIM_NOTIFICATION_PREFERENCES,
} from './profile-preferences.constants';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { NotificationPreference, Params } from './profile-preferences.model';
import { GlobalStoreService } from 'src/app/shared/store';
import { IUserData } from 'src/app/shared/configs/app.model';

@Component({
  selector: 'app-profile-preferences',
  standalone: true,
  imports: [CommonModule, LoaderComponent, MatIconModule],
  templateUrl: './profile-preferences.component.html',
  styleUrls: ['./profile-preferences.component.scss'],
})
export class ProfilePreferencesComponent {
  sub: Subscription;
  pageApis: Subscription[] = [];
  companyList: any[] = [];
  loading = true;
  reqNotificationPreferences: NotificationPreference[] =
    REQUESTS_NOTIFICATION_PREFERENCES;
  trClaimNotificationPreferences: NotificationPreference[] =
    TR_CLAIM_NOTIFICATION_PREFERENCES;
  remaindersNotificationPreferences: NotificationPreference[] =
    REMAINDERS_NOTIFICATION_PREFERENCES;
  allReqNotificationEnabled = false;
  allTrClaimNotificationEnabled = false;
  allRemaindersNotificationEnabled = false;
  currentCompany: any;
  showRequestsSection = false;
  showTrSection = false;
  showRemSection = false;

  constructor(private global: GlobalStoreService, private util: UtilService) {}

  ngOnInit(): void {
    this.sub = this.global.userData$.subscribe((data: IUserData) => {
      if (data) {
        const { nodes } = data;
        this.companyList = nodes.map(node => {
          return {
            ...node,
            selected: false,
          };
        });
        this.currentCompany = this.companyList[0];
        this.getNotificationSettings(this.currentCompany);
      }
    });
  }

  /**
   * The function `toggleNotificationSettings` updates notification settings based on user preferences
   * and event input.
   * @param {any} event - The `event` parameter is typically an event object that represents an action
   * or occurrence in the browser, such as a click event or change event. It is often passed to event
   * handler functions to provide information about the event that occurred.
   * @param {any} preference - Preference is an object that contains information about the notification
   * settings, such as the type of notification and whether it is currently blocked or not.
   */
  toggleNotificationSettings(
    event: any,
    preference: NotificationPreference
  ): void {
    const params: Params[] = [
      {
        node: this.currentCompany.id,
        type: preference.type,
        is_blocked: !event.target.checked,
      },
    ];
    this.updateNotificationSettings(params);
  }

  /**
   * The function `selectAllNotification` toggles the `is_blocked` property of notification preferences
   * based on the type provided and updates the notification settings.
   * @param {any} event - The `event` parameter is an object that represents the event that triggered
   * the function. It could be an event object from a user interaction like a click or change event.
   * @param {string} type - The `type` parameter in the `selectAllNotification` function is a string
   * that determines which notification preferences array to update based on the value it holds.
   */
  selectAllNotification(event: any, type: string): void {
    let data;
    if (type === 'req') {
      this.updatePreferences(
        this.reqNotificationPreferences,
        event.target.checked
      );
      data = this.reqNotificationPreferences;
    } else if (type === 'tr-claim') {
      this.updatePreferences(
        this.trClaimNotificationPreferences,
        event.target.checked
      );
      data = this.trClaimNotificationPreferences;
    } else if (type === 'rem') {
      this.updatePreferences(
        this.remaindersNotificationPreferences,
        event.target.checked
      );
      data = this.remaindersNotificationPreferences;
    } else {
      this.updatePreferences(
        this.reqNotificationPreferences,
        event.target.checked
      );
      this.updatePreferences(
        this.trClaimNotificationPreferences,
        event.target.checked
      );
      this.updatePreferences(
        this.remaindersNotificationPreferences,
        event.target.checked
      );
      data = [
        ...this.reqNotificationPreferences,
        ...this.trClaimNotificationPreferences,
        ...this.remaindersNotificationPreferences,
      ];
    }

    data.forEach(item => {
      item['node'] = this.currentCompany.id;
    });
    this.updateNotificationSettings(data);
    if (
      (type == 'req' && !this.showRequestsSection) ||
      (type == 'tr-claim' && !this.showTrSection) ||
      (type == 'rem' && !this.showRemSection)
    ) {
      this.toggleRequestsSection(type);
    }
  }

  /**
   * The function `updatePreferences` toggles the `is_blocked` property of each preference in the given
   * array based on the `checked` parameter.
   **/
  updatePreferences(preferences: any[], checked: boolean): void {
    preferences.forEach(preference => {
      preference.is_blocked = !checked;
    });
  }

  /**
   * The function `companySelection` sets certain sections to be hidden and then retrieves notification
   * settings for a selected company.
   **/
  companySelection(company: any) {
    this.showRemSection = false;
    this.showRequestsSection = false;
    this.showTrSection = false;
    this.getNotificationSettings(company);
  }

  /**
   * The function `getNotificationSettings` retrieves notification settings from an API and processes
   * the response accordingly.
   */
  getNotificationSettings(company: any): void {
    this.currentCompany = company;
    const api = this.util.getNotificationSettings(company?.id).subscribe({
      next: (response: any) => {
        this.getSelectedNotificationSettings(response);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
    this.pageApis.push(api);
  }

  /**
   * The function `getSelectedNotificationSettings` updates notification preferences based on data and
   * calculates whether all notifications are enabled.
   * @param {any} data - The `getSelectedNotificationSettings` function takes in an object `data` as a
   * parameter. This object is then used to update the notification preferences for different types of
   * notifications. The function uses a `dataMap` to map each item in the `data` array by its type.
   */
  getSelectedNotificationSettings(data: any): void {
    const IS_NOT_BLOCKED = (obj: any) => !obj.is_blocked;
    const updatePreferences = (preferences: any[]) => {
      preferences.forEach(item => {
        const matchingItem = dataMap.get(item.type);
        if (matchingItem) {
          item.is_blocked = matchingItem.is_blocked;
        }
      });
    };

    const dataMap = new Map();
    data.forEach((item: any) => dataMap.set(item.type, item));

    updatePreferences(this.reqNotificationPreferences);
    this.allReqNotificationEnabled =
      this.reqNotificationPreferences.every(IS_NOT_BLOCKED);

    updatePreferences(this.trClaimNotificationPreferences);
    this.allTrClaimNotificationEnabled =
      this.trClaimNotificationPreferences.every(IS_NOT_BLOCKED);

    updatePreferences(this.remaindersNotificationPreferences);
    this.allRemaindersNotificationEnabled =
      this.remaindersNotificationPreferences.every(IS_NOT_BLOCKED);

    this.loading = false;
  }

  /**
   * The function `updateNotificationSettings` processes data, calls an API to update notification
   * settings, and handles success or failure messages accordingly.
   **/
  updateNotificationSettings(data: any): void {
    const params = data.map(
      ({ name, ...rest }: { name: string; [key: string]: any }) => rest
    );
    const api = this.util.updateNotificationSettings(params).subscribe({
      next: (res: any) => {
        const message = 'Preference updated successfully';
        this.util.customSnackBar(message, ACTION_TYPE.SUCCESS);
        this.getNotificationSettings(this.currentCompany);
      },
      error: () => {
        const message = 'Preference updation Failed';
        this.util.customSnackBar(message, ACTION_TYPE.FAILED);
      },
    });
    this.pageApis.push(api);
  }

  /**
   * The trackByFn function in TypeScript returns the index value passed to it.
   **/
  trackByFn(index: number): number {
    return index;
  }

  /**
   * The function `toggleRequestsSection` toggles between different sections based on the input type.
   **/
  toggleRequestsSection(type: string): void {
    if (type == 'req') {
      this.showRequestsSection = !this.showRequestsSection;
    } else if (type == 'tr-claim') {
      this.showTrSection = !this.showTrSection;
    } else {
      this.showRemSection = !this.showRemSection;
    }
  }

  // Un-subscribing subscription to prevent memory leak
  ngOnDestroy(): void {
    this.pageApis.forEach(m => m.unsubscribe());
  }
}
