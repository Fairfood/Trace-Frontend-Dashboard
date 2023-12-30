/* eslint-disable @typescript-eslint/no-explicit-any */
/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// configs and constants
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import {
  HTTP_OPTION_3,
  HTTP_OPTION_4,
  exportFileType,
  exportType,
} from 'src/app/shared/configs/app.constants';
import { IStockActionTable, ITransactionData } from './transactions.model';

// services
import { ExportService } from 'src/app/shared/service/export.service';
import { StorageService } from 'src/app/shared/service';

import { environment } from 'src/environments/environment';
import {
  ICommonAPIResponse,
  ICommonObj,
} from 'src/app/shared/configs/app.model';
import { ITeamMember } from '../company-profile/team-members/team-members.config';
const BASE_URL = environment.baseUrl;

// Helper function to format product names with quantities
const formatTableProduct = (productArray: Partial<ICommonObj>[]): string => {
  const names = productArray.map((product: any) => {
    const { name, quantity } = product;
    return `${name}(${quantity.toFixed(2)}kg)`;
  });

  let result: string;

  if (names.length > 2) {
    result = names.slice(0, 2).join(', ');
    result += ` and ${names.length - 2} more`;
  } else {
    result = names.join(', ');
  }

  return result;
};

// Helper function to format stock IDs
const stockIdFormater = (productArray: any[]): string => {
  const stockIds = productArray.map((m: any) => m.number);

  let result: string;

  if (stockIds.length > 2) {
    result = stockIds.slice(0, 2).join(', ');
    result += ` and ${stockIds.length - 2} more`;
  } else {
    result = stockIds.join(', ');
  }

  return result;
};

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private exportService: ExportService
  ) {}

  // Helper method to retrieve supply chain data from storage
  supplyChainData(): any {
    return this.storage.retrieveStoredData('supplyChainId');
  }

  // Helper method to retrieve member type from storage
  memberType(): string {
    return this.storage.retrieveStoredData('memberType');
  }

  /**
   * Fetch all the transactions in the supply chain.
   * @returns Observable any
   */
  getTransactionHistory(
    reqOptions: any
  ): Observable<ICommonAPIResponse<ITransactionData>> {
    const supplyChainId = this.supplyChainData();
    const {
      transactionType,
      selectedProduct,
      dateFrom,
      dateTo,
      dateOn,
      quantityFrom,
      quantityTo,
      selectedCompany,
      searchString,
      offset,
      limit,
      orderBy,
      sortBy,
      creator,
    } = reqOptions;

    // splitting the lengthy url

    const urlPart1 = `${BASE_URL}/transactions/external/?offset=${offset}&limit=${limit}&supply_chain=${supplyChainId}`;
    const urlPart2 = `&product=${selectedProduct}&node=${selectedCompany}`;
    const urlPart3 = `&date_from=${dateFrom}&date_to=${dateTo}&date_on=${dateOn}`;
    const urlPart4 = `&quantity_from=${quantityFrom}&quantity_to=${quantityTo}`;
    const urlPart5 = `&search=${searchString}&type=${transactionType}&creator=${creator}`;
    const urlPart6 = `&sort_by=${sortBy}&order_by=${orderBy}`;

    return this.http
      .get(
        urlPart1 + urlPart2 + urlPart3 + urlPart4 + urlPart5 + urlPart6,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  // Helper method to construct export parameters for external transactions
  externalTransactionExport(params: any): any {
    const supplyChainId = this.supplyChainData();
    const {
      transactionType,
      selectedProduct,
      dateFrom,
      dateTo,
      dateOn,
      quantityFrom,
      quantityTo,
      selectedCompany,
      searchString,
      orderBy,
      sortBy,
    } = params;
    return {
      supply_chain: supplyChainId,
      product: selectedProduct || '',
      date_from: dateFrom,
      date_to: dateTo,
      date_on: dateOn,
      quantity_from: quantityFrom,
      quantity_to: quantityTo,
      search: searchString,
      type: transactionType,
      sort_by: sortBy,
      order_by: orderBy,
      node: selectedCompany,
    };
  }

  /**
   * Fetch all the internal Transactions(stock actions like merge, convert and remove) in the supply chain.
   * @returns Observable any
   */
  getStockactionsList(byStockAction: number, reqOptions: any): Observable<any> {
    const supplyChainId = this.supplyChainData();
    const {
      dateFrom,
      dateTo,
      dateOn,
      quantityFrom,
      quantityTo,
      searchString,
      offset,
      limit,
      orderBy,
      sortBy,
      selectedSourceProduct,
      selectedDestinationProduct,
      creator,
    } = reqOptions;

    // splitting the lengthy url

    const urlPart1 = `${BASE_URL}/transactions/internal/?offset=${offset}&limit=${limit}&supply_chain=${supplyChainId}`;
    const urlPart2 = `&destination_product=${selectedDestinationProduct}&source_product=${selectedSourceProduct}`;
    const urlPart3 = `&date_from=${dateFrom}&date_to=${dateTo}&date_on=${dateOn}`;
    const urlPart4 = `&quantity_from=${quantityFrom}&quantity_to=${quantityTo}`;
    const urlPart5 = `&search=${searchString}&type=${byStockAction}&creator=${creator}`;
    const urlPart6 = `&sort_by=${sortBy}&order_by=${orderBy}`;

    return this.http
      .get(
        urlPart1 + urlPart2 + urlPart3 + urlPart4 + urlPart5 + urlPart6,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((d: any) => {
          const { data } = d;
          return data;
        })
      );
  }

  // Helper method to construct export parameters for stock actions
  stockActionExport(params: any, stockAction: number): any {
    const supplyChainId = this.supplyChainData();
    const {
      dateFrom,
      dateTo,
      dateOn,
      quantityFrom,
      quantityTo,
      searchString,
      orderBy,
      sortBy,
      selectedSourceProduct,
      selectedDestinationProduct,
    } = params;

    return {
      supply_chain: supplyChainId,
      destination_product: selectedDestinationProduct || '',
      source_product: selectedSourceProduct || '',
      date_from: dateFrom,
      date_to: dateTo,
      date_on: dateOn,
      quantity_from: quantityFrom,
      quantity_to: quantityTo,
      search: searchString,
      type: stockAction,
      sort_by: sortBy,
      order_by: orderBy,
    };
  }

  // Helper method to navigate to the consumer interface
  traceSource(el: any): void {
    const theme = localStorage.getItem('ci_theme')
      ? localStorage.getItem('ci_theme')
      : 'fairfood';
    const url =
      window.location.origin +
      '/consumer-interface/#/web/' +
      theme +
      '?batch=' +
      el.batch;
    window.open(url, '_blank');
  }

  /**
   * External transaction table data construction
   * @param results ITransactionData[]
   * @returns
   */
  configureTableData(results: ITransactionData[]): any {
    const formatedData = results?.map((transaction: ITransactionData) => {
      const {
        id,
        number,
        type,
        result_batches,
        connection,
        products,
        quantity,
        blockchain_address,
        rejectable,
        buyer_ref_number,
        creator,
        date,
      } = transaction;
      const data = {
        itemId: id,
        id: number,
        batch: result_batches[0],
        type: type,
        connection: connection.name,
        product: products[0].name,
        quantity,
        created: date,
        log: blockchain_address,
        option: '',
        rejectable,
        refNo: buyer_ref_number,
        creator: creator?.first_name + ' ' + creator?.last_name,
      };
      return data;
    });

    return formatedData;
  }

  // Helper method to configure internal transaction data
  configureInternalTransaction(
    results: any[],
    stockAction: number
  ): IStockActionTable[] {
    const stockData: IStockActionTable[] = results.map((stockItem: any) => {
      const {
        number,
        id,
        type,
        date,
        creator,
        source_batches,
        source_quantity,
        destination_batches,
        destination_quantity,
      } = stockItem;
      const data: IStockActionTable = {
        id: number,
        itemId: id,
        type,
        created: date,
        creator: creator?.first_name + ' ' + creator?.last_name,
      };

      if (stockAction === 1) {
        data['sourceProduct'] = formatTableProduct(source_batches);
        data['sourceQuantity'] = source_quantity.toFixed(2);
        data['destinationProduct'] = formatTableProduct(destination_batches);
      } else if (stockAction === 3) {
        data['sourceProduct'] = formatTableProduct(source_batches);
        data['sourceQuantity'] = source_quantity.toFixed(2);
        data['destinationProduct'] = formatTableProduct(destination_batches);
        data['quantity'] = destination_quantity.toFixed(2);
      } else {
        data['sourceProduct'] = formatTableProduct(source_batches);
        data['removedStockId'] = stockIdFormater(source_batches);
        data['sourceQuantity'] = source_quantity.toFixed(2);
      }
      return data;
    });

    return stockData;
  }

  // Helper method to load team members
  loadTeamMembers(reqOptions: {
    limit: number;
    offset: number;
  }): Observable<ICommonAPIResponse<ITeamMember>> {
    const { limit, offset } = reqOptions;
    return this.http
      .get(
        `${BASE_URL}/supply-chain/node/member/?limit=${limit}&offset=${offset}`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  // Helper method to initiate export of transaction data
  exportData(
    transactionType: string,
    appliedFilterValues: any,
    byStockAction?: any
  ): void {
    if (transactionType === 'external') {
      const params = this.externalTransactionExport(appliedFilterValues);
      this.exportService.initExportData({
        export_type: exportType.EXTERNAL_TRANSACTION,
        filters: JSON.stringify(params),
        file_type: exportFileType.EXCEL,
      });
    } else {
      const params = this.stockActionExport(appliedFilterValues, byStockAction);
      this.exportService.initExportData({
        export_type: exportType.INTERNAL_TRANSACTION,
        filters: JSON.stringify(params),
        file_type: exportFileType.EXCEL,
      });
    }
  }

  // Helper method to observe export icon clicks
  exportIconClicked(): Observable<any> {
    return this.exportService.exportIconClicked$;
  }
}
