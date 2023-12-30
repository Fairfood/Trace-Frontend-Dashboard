/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
// configs
import { BadgeText, ITransactionDetail } from './transaction-report.config';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import {
  HTTP_OPTION_3,
  HTTP_OPTION_4,
} from 'src/app/shared/configs/app.constants';

import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/shared/service';
const BASE_URL = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class TransactionReportService {
  constructor(public http: HttpClient, private storage: StorageService) {}

  getCiTheme(): string {
    return this.storage.retrieveStoredData('ci_theme')
      ? this.storage.retrieveStoredData('ci_theme')
      : 'fairfood';
  }

  getInternalTransactionDetail(
    transaction: string,
    id: string
  ): Observable<ITransactionDetail> {
    return this.http
      .get(
        `${BASE_URL}/transactions/${transaction}/${id}/`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  generateQrcode(batchId: string, transactionData: any): any {
    const theme = localStorage.getItem('ci_theme')
      ? localStorage.getItem('ci_theme')
      : 'fairfood';
    const rootUrl = window.location.origin;
    let qrCodeValue = '';
    let storyTellingUrl = '';
    if (!transactionData?.consumer_interface_url) {
      qrCodeValue =
        rootUrl + '/consumer-interface/#/web/' + theme + '?batch=' + batchId;
      if (transactionData.transaction_type === 1) {
        storyTellingUrl =
          rootUrl +
          '/consumer-interface/#/web/' +
          theme +
          '?batch=' +
          transactionData.destination_batches[0]?.id;
      } else {
        if (transactionData.type !== 2) {
          const batch = transactionData.destination_products[0].id;
          storyTellingUrl = `${rootUrl}/consumer-interface/#/web/${theme}?batch=${batch}`;
        }
      }
    } else {
      qrCodeValue = environment.storyTellingUrl + theme + '?batch=' + batchId;
      if (transactionData.transaction_type === 1) {
        storyTellingUrl =
          environment.storyTellingUrl +
          theme +
          '?batch=' +
          transactionData.destination_batches[0].id;
      } else {
        if (transactionData.type !== 2) {
          storyTellingUrl =
            environment.storyTellingUrl +
            theme +
            '?batch=' +
            transactionData.destination_products[0].id;
        }
      }
    }
    return {
      storyTellingUrl,
      qrCodeValue,
    };
  }

  generateBatchText(transaction: string, type: number): string {
    if (transaction === 'external') {
      if (type === 1) {
        return BadgeText.OUTGOING;
      }
      if (type === 2) {
        return BadgeText.INCOMING;
      }
      return BadgeText.REVERSAL;
    } else {
      if (type === 1) {
        return BadgeText.PROCESSING;
      }
      if (type === 2) {
        return BadgeText.LOSS;
      }
      return BadgeText.MERGE;
    }
  }

  fetchBatchInfo(batchId: string): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/products/batches/batch-farmers/?batch=${batchId}&limit=3&offset=0`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  getTransactionAttachments(
    transactionId: string,
    limit: number,
    offset: number
  ): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/transactions/transaction-attachments/?transaction=${transactionId}&limit=${limit}&offset=${offset}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  addAttachements(transactionId: string, formData: any): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/transactions/transaction-attachments/?transaction=${transactionId}`,
        formData,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }
}
