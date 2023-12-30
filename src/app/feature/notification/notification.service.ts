/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map } from 'rxjs';

import {
  HTTP_OPTION_3,
  NotificationEvent,
  NotificationRequestType,
} from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { RouterService } from 'src/app/shared/service';
import { environment } from 'src/environments/environment';
const BASE_URL = environment.baseUrl;
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notificationSubject: Subject<any> = new Subject<any>();
  constructor(private http: HttpClient, private routeService: RouterService) {}

  getNotifications(
    limit: number,
    offset: number,
    keyword: string,
    node: string
  ): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/communications/notifications/?limit=${limit}&offset=${offset}&search=${keyword}&node=${node}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  readNotification(params: any): Observable<any> {
    return this.http
      .patch(
        `${BASE_URL}/communications/notifications/read/`,
        params,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  handleEventRouting(notification: any) {
    const { event, event_id, context } = notification;
    switch (event) {
      case NotificationEvent.TransactionReport:
        this.routeService.navigateArray([
          'transaction-report',
          'external',
          event_id,
        ]);
        break;
      case NotificationEvent.Connections:
        this.routeService.navigateArray(['connections']);
        break;
      case NotificationEvent.UserProfile:
        this.routeService.navigateArray(['user-profile']);
        break;
      case NotificationEvent.Stock:
        this.handleStockEvent(notification);
        break;
      case NotificationEvent.RequestForInformation:
        this.handleRequestForInformationEvent(notification);
        break;
      case NotificationEvent.MapConnection:
        this.handleMapConnectionEvent(notification);
        break;
      case NotificationEvent.ClaimDetails:
        this.routeService.navigateArray(['claims/details', event_id]);
        break;
      case NotificationEvent.ClaimDetailsWithContext:
        this.routeService.navigateArray([
          'claims/details',
          context.verification_id,
        ]);
        break;
      default:
        this.routeService.navigateArray(['company-profile']);
    }
  }

  handleStockEvent(notification: any) {
    const { event_id, type } = notification;
    const requestType = type === NotificationRequestType.Type1 ? 1 : 2;
    this.navigateToRequests(requestType, event_id);
  }

  handleRequestForInformationEvent(notification: any) {
    const { event_id, type } = notification;
    const requestType = notification.type === 24 || type === 22 ? 1 : 2;
    this.navigateToRequests(requestType, event_id);
  }

  handleMapConnectionEvent(notification: any) {
    const { event_id, type } = notification;
    const requestType = type === 26 ? 1 : 2;
    this.navigateToRequests(requestType, event_id);
  }

  navigateToRequests(requestType: number, eventId: any) {
    this.routeService.router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() =>
        this.routeService.navigateArray(['requests', requestType, eventId])
      );
  }
}
