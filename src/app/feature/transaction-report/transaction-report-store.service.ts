/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITransactionDetail } from './transaction-report.config';
import { BaseStoreService } from 'src/app/shared/store/base-store.service';

interface TransactionState {
  transactionDetails: ITransactionDetail;
}

const initialState: TransactionState = {
  transactionDetails: null,
};

@Injectable({
  providedIn: 'root',
})
export class TransactionReportStoreService extends BaseStoreService<TransactionState> {
  transactionDetails$: Observable<ITransactionDetail> = this.select(
    (state: TransactionState) => {
      return state.transactionDetails;
    }
  );

  constructor() {
    super(initialState);
  }

  updateTransactionDetails(data: Partial<ITransactionDetail>): void {
    this.setState({
      transactionDetails: {
        ...this.state.transactionDetails,
        ...data,
      },
    });
  }
}
