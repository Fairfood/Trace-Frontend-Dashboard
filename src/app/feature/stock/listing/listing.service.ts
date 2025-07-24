/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { BASE_URL, HTTP_OPTION_3 } from 'src/app/shared/configs/app.constants';
import { successFormatter } from 'src/app/shared/configs/app.methods';
import {
  IBatches,
  IFilterParams,
  IListingAPIResponse,
  IStockTableRow,
} from './listing.model';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { headerOptions } from 'fairfood-utils';

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
   * @param filters IFilterParams
   * @returns Observable
   */
  /* istanbul ignore next */
  searchStock(filters: IFilterParams): Observable<any> {
    const { limit, offset } = filters;

    const url = `${BASE_URL}/products/batch/?limit=${limit ?? 10}&offset=${
      offset ?? 0
    }`;

    const remainingItems = this.constructPartialUrls(filters);

    return this.http
      .get(`${url}${remainingItems}`, headerOptions(HTTP_OPTION_3))
      .pipe(map(successFormatter), map(this.formatDataForListing));
  }

  /**
   * Constructing get request url same for search stock and batch summary api
   * @param filters IFilterParams
   * @returns string
   */
  constructPartialUrls(filters: IFilterParams): string {
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
      archived,
      searchBy,
    } = filters;

    const urlPart2 = `&product=${selectedProduct}&claim=${selectedClaim}&supplier=${selectedSupplier}`;
    const urlPart3 = `&date_from=${dateFrom}&date_to=${dateTo}&date_on=${dateOn}`;
    const urlPart4 = `&quantity_from=${quantityFrom}&quantity_to=${quantityTo}&quantity_is=${quantityIs}`;
    const urlPart5 = `&created_from=${createdFrom}&search=${searchString}&archived=${archived}&search_by=${searchBy}`;
    const urlPart6 = `&sort_by=${sortBy}&order_by=${orderBy}&supply_chain=${this.storage.retrieveStoredData(
      'supplyChainId'
    )}`;

    return urlPart2 + urlPart3 + urlPart4 + urlPart5 + urlPart6;
  }

  /**
   * Format the data for listing in the table
   * @param res Partial<IListingAPIResponse>
   * @returns IListingAPIResponse
   */
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

  /**
   * Check for duplicates and remove them from the array
   * Scenario: When two items selected from table then select all is clicked
   *
   * @param yourArray IStockTableRow[]
   * @returns IStockTableRow[]
   */
  removeDuplicates(yourArray: IStockTableRow[]): IStockTableRow[] {
    const uniqueArray = Array.from(
      new Set(yourArray.map(item => item.itemId))
    ).map(id => yourArray.find(item => item.itemId === id));
    return uniqueArray;
  }

  /* istanbul ignore next */
  getClaims(): Observable<any> {
    return this.claim.getClaims().pipe(
      tap((data: any) => {
        this.store.updateStateProp<Partial<ICommonObj>>('claimData', data);
      })
    );
  }

  updateArchiveStatus(data: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/products/batch/toggle-archive/',
      data,
      headerOptions(HTTP_OPTION_3)
    );
  }

  /* istanbul ignore next */
  exportIconClicked(): Observable<any> {
    return this.exportService.exportIconClicked$;
  }

  /**
   * For exporting data existing filters need to be formatted
   * @param appliedFilter IFilterParams
   * @returns any
   */
  formatFilterParams(appliedFilter: IFilterParams): any {
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
    } = appliedFilter;

    return {
      supply_chain: this.storage.retrieveStoredData('supplyChainId'),
      product: selectedProduct,
      claim: selectedClaim,
      supplier: selectedSupplier,
      date_from: dateFrom,
      date_to: dateTo,
      date_on: dateOn,
      quantity_from: quantityFrom,
      quantity_to: quantityTo,
      quantity_is: quantityIs,
      created_from: createdFrom,
      search: searchString,
      sort_by: sortBy,
      order_by: orderBy,
    };
  }

  /**
   * Getting batch count and total quantity based on the filter params
   * @param filters IFilterParams
   * @returns Observable<any>
   */
  /* istanbul ignore next */
  getBatchSummary(filters: IFilterParams): Observable<any> {
    const url = this.constructPartialUrls(filters);
    return this.http
      .get(
        `${BASE_URL}/products/batch-summary/?${url}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Total quantity of selected items/stocks
   * quantityNeeded is the editable field
   * for entire list selected option calling getbatchsummary api
   */
  getSelectedQuantity(selectedItems: any[]): any {
    const total = selectedItems.reduce(
      (acc, obj) => acc + +obj.quantityNeeded,
      0
    );
    return total.toFixed(2);
  }

  mergeChangedBatches(
    currentSelectedBatches: IBatches[],
    changed: IBatches[]
  ): IBatches[] {
    /**
     * Converts to an object beacuse it is easier access than array
     */
    const changedMap: any = {};
    changed.forEach(({ batch, quantity }) => {
      changedMap[batch] = quantity;
    });

    // Update input array with changes
    currentSelectedBatches.forEach(item => {
      const changedQuantity = changedMap[item.batch];
      if (changedQuantity !== undefined) {
        item.quantity = changedQuantity;
      }
    });
    return currentSelectedBatches;
  }

  computeSelectedQuantity(batch: IBatches[]): string {
    const total = batch.reduce((acc, obj) => acc + +obj.quantity, 0);
    return total.toFixed(2);
  }
}
