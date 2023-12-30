/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { BASE_URL, HTTP_OPTION_3 } from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import {
  IListingAPIResponse,
  IProgressBar,
  IStockTableRow,
} from './listing.model';
import { ICommonObj } from 'src/app/shared/configs/app.model';

// services
import { StorageService, ExportService } from 'src/app/shared/service';
import { ListingStoreService } from './listing-store.service';
import { ClaimService } from '../../claim';

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private store: ListingStoreService,
    private claim: ClaimService,
    private exportService: ExportService
  ) {}

  /**
   * Stock searching/listing
   * @param filters IStockFilterApplied
   * @returns Observable
   */
  searchStock(filters: any): Observable<any> {
    const {
      selectedProduct,
      selectedClaim,
      selectedSupplier,
      quantityFrom,
      quantityTo,
      quantityIs,
      dateOn,
      dateTo,
      dateFrom,
      searchString,
      orderBy,
      sortBy,
      createdFrom,
      limit,
      offset,
    } = filters;

    // splitting the lengthy url

    const urlPart1 = `${BASE_URL}/products/batch/?limit=${limit ?? 10}&offset=${
      offset ?? 0
    }&supply_chain=${this.storage.retrieveStoredData('supplyChainId')}`;
    const urlPart2 = `&product=${selectedProduct}&claim=${selectedClaim}&supplier=${selectedSupplier}`;
    const urlPart3 = `&date_from=${dateFrom}&date_to=${dateTo}&date_on=${dateOn}`;
    const urlPart4 = `&quantity_from=${quantityFrom}&quantity_to=${quantityTo}&quantity_is=${quantityIs}`;
    const urlPart5 = `&created_from=${createdFrom}&search=${searchString}`;
    const urlPart6 = `&sort_by=${sortBy}&order_by=${orderBy}`;

    return this.http
      .get(
        urlPart1 + urlPart2 + urlPart3 + urlPart4 + urlPart5 + urlPart6,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter), map(this.formatDataForListing));
  }

  formatDataForListing(res: Partial<IListingAPIResponse>): IListingAPIResponse {
    const { results, count } = res;
    const tableData = results.map((item: any) => {
      const {
        number,
        id,
        name,
        product,
        created_on,
        created_from: from,
        supplier,
        current_quantity,
        buyer_ref_number,
        source_transaction,
      } = item;
      return {
        stockId: number,
        itemId: id,
        name,
        product: product?.name,
        created: created_on || '',
        from,
        batch: supplier?.name,
        quantityAvailable: current_quantity,
        quantityNeeded: current_quantity,
        select: false,
        option: '',
        referenceNo: buyer_ref_number,
        productId: product?.id,
        isExternal: !from && !supplier,
        transactionId: source_transaction,
      };
    });

    return {
      results: tableData,
      count,
    };
  }

  removeDuplicates(yourArray: IStockTableRow[]): IStockTableRow[] {
    const uniqueArray = Array.from(
      new Set(yourArray.map(item => item.itemId))
    ).map(id => yourArray.find(item => item.itemId === id));
    return uniqueArray;
  }

  resetBeforeEntireList(): void {
    this.store.updateStateProp<boolean>('toggleFilter', false);
    this.store.updateStateProp<IStockTableRow[]>('selectedStocks', []);
    this.updateProgressBarValue({ value: 1, progress: true });
  }

  updateProgressBarValue(value: IProgressBar): void {
    this.store.updateStateProp<IProgressBar>('progressBarDetails', value);
  }

  endOfListSelection(): void {
    this.store.updateStateProp<IProgressBar>('progressBarDetails', {
      value: 100,
      progress: true,
    });
    setTimeout(() => {
      this.store.updateStateProp<IProgressBar>('progressBarDetails', {
        value: 100,
        progress: false,
      });
    }, 1000);
  }

  getClaims(): Observable<any> {
    return this.claim.getClaims().pipe(
      tap((data: any) => {
        this.store.updateStateProp<Partial<ICommonObj>>('claimData', data);
      })
    );
  }

  exportIconClicked(): Observable<any> {
    return this.exportService.exportIconClicked$;
  }
}
