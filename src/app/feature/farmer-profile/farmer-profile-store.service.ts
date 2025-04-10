/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
// rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// services
import { BaseStoreService } from 'src/app/shared/store';

// configs
import {
  IFarmerDetails,
  IReference,
  IStateFarmerProfile,
} from './farmer-profile.config';
import {
  BASE_URL,
  HTTP_OPTION_3,
  HTTP_OPTION_4,
} from 'src/app/shared/configs/app.constants';
import { successFormatter } from 'src/app/shared/configs/app.methods';
import { INIT_TABLE } from './farmer-profile.constants';
import { headerOptions } from 'fairfood-utils';

const initialState: IStateFarmerProfile = {
  farmerDetails: null,
  isUpdating: false,
  farmerReferences: INIT_TABLE,
  referenceMaster: INIT_TABLE,
  plots: INIT_TABLE,
  activities: INIT_TABLE,
  payments: INIT_TABLE,
  attachments: INIT_TABLE,
};

@Injectable({
  providedIn: 'root',
})
export class FarmerProfileStoreService extends BaseStoreService<IStateFarmerProfile> {
  /* istanbul ignore next */
  farmerDetails$: Observable<IFarmerDetails> = this.select(
    (state: IStateFarmerProfile) => state.farmerDetails
  );

  /* istanbul ignore next */
  updatingDetails$: Observable<boolean> = this.select(
    (state: IStateFarmerProfile) => state.isUpdating
  );

  /* istanbul ignore next */
  farmerReference$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.farmerReferences
  );

  /* istanbul ignore next */
  masterReferences$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.referenceMaster
  );

  /* istanbul ignore next */
  plots$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.plots
  );

  /* istanbul ignore next */
  activities$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.activities
  );

  /* istanbul ignore next */
  payments$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.payments
  );

  /* istanbul ignore next */
  attachments$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.attachments
  );

  constructor(private http: HttpClient) {
    super(initialState);
  }

  /* istanbul ignore next */
  updateStateProp<T>(key: string, value: T): void {
    this.setState({ [key]: value });
  }

  /* istanbul ignore next */
  setAttachments(data: IReference): void {
    this.setState({
      attachments: data,
    });
  }

  productAmount(amount: number, currency: string): string {
    return `${this.formatNumber(amount || 0)} ${currency || ''}`;
  }

  transformDetails(farmerDetails: any): void {
    const { first_name, last_name, phone, family_members, total_income } =
      farmerDetails;

    let product = '0',
      premium = '0',
      total = '0',
      others = '0';

    if (total_income) {
      const { total_amount, amount_from_products, amount_from_premiums } =
        total_income;

      if (amount_from_products?.length) {
        const { amount, currency } = amount_from_products[0];
        product = this.productAmount(amount, currency);
      }

      if (amount_from_premiums?.length) {
        const { amount, currency } = amount_from_premiums[0];
        premium = this.productAmount(amount, currency);
      }

      if (total_amount?.length) {
        const { amount, currency } = total_amount[0];
        total = this.productAmount(amount, currency);
        others = this.productAmount(0, currency);
      }
    }

    const result = {
      ...farmerDetails,
      firstName: first_name,
      lastName: last_name,
      familyMembers: family_members,
      dialCode: phone?.dial_code,
      phoneNumber: phone?.phone,
      avatar: `${first_name[0] || ''}${last_name[0] || ''}`,
      income: {
        product,
        premium,
        others,
        total,
      },
      otherApiCall: true,
    };
    this.updateStateProp<any>('farmerDetails', result);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  transformFormValues(farmerDetails: any): any {
    const {
      firstName,
      lastName,
      familyMembers,
      dialCode,
      phoneNumber,
      city,
      country,
      province,
      street,
      email,
      zipCode,
      dob,
      gender,
      type,
      cStatus,
    } = farmerDetails;

    return {
      first_name: firstName,
      last_name: lastName,
      family_members: familyMembers,
      phone: {
        dial_code: dialCode,
        phone: phoneNumber,
      },
      city,
      country,
      province,
      street,
      email,
      zipcode: zipCode,
      dob: new DatePipe('en-US').transform(dob, 'yyyy-MM-dd'),
      gender,
      consent_status: cStatus,
      primary_operation: type,
    };
  }

  /* istanbul ignore next */
  getFarmerDetails(param: any): void {
    const supplyChainId = localStorage.getItem('supplyChainId');
    this.http
      .get(
        BASE_URL +
          '/supply-chain/farmer/' +
          param +
          '/' +
          '?supply_chain=' +
          supplyChainId,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            this.transformDetails(data);
            return data;
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  updateFarmerDetailAPI(id: string, params: any): Observable<any> {
    return this.http.patch(
      BASE_URL + '/supply-chain/farmer/' + id + '/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  /* istanbul ignore next */
  updateFarmConnectionDetails(id: string, params: any): void {
    this.updateFarmerDetailAPI(id, params)
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            this.transformDetails(data);
            this.updateStateProp<boolean>('isUpdating', false);
            return data;
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  createFarmerReference(param: any, farmerId: string): Observable<any> {
    return this.http.post(
      `${BASE_URL}/supply-chain/supply-chains/farmer-references/?farmer=${farmerId}`,
      param,
      headerOptions(HTTP_OPTION_3)
    );
  }

  /* istanbul ignore next */
  updateFarmerReference(param: any, refId: string): Observable<any> {
    return this.http.patch(
      `${BASE_URL}/supply-chain/supply-chains/farmer-references/${refId}/`,
      param,
      headerOptions(HTTP_OPTION_3)
    );
  }

  /* istanbul ignore next */
  fetchReferences(search?: string): void {
    this.http
      .get(
        `${BASE_URL}/supply-chain/supply-chains/references/?search=${
          search ?? ''
        }`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            const { count, results } = data;
            this.updateStateProp<IReference>('referenceMaster', {
              count,
              results,
              loading: false,
            });
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  fetchFarmerReferences(farmerId: string, searchString?: string): void {
    this.http
      .get(
        `${BASE_URL}/supply-chain/supply-chains/farmer-references/?farmer=${farmerId}&search=${
          searchString ?? ''
        }`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            const { count, results } = data;
            this.updateStateProp<IReference>('farmerReferences', {
              count,
              results,
              loading: false,
            });
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  fetchFarmerPlots(farmerId: string): void {
    this.http
      .get(
        `${BASE_URL}/supply-chain/supply-chains/farmer-plots/?farmer=${farmerId}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            const { count, results } = data;
            this.updateStateProp<IReference>('plots', {
              count,
              results,
              loading: false,
            });
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  createFarmerPlot(farmerId: string, reqObj: any): Observable<any> {
    return this.http.post(
      `${BASE_URL}/supply-chain/supply-chains/farmer-plots/?farmer=${farmerId}`,
      reqObj,
      headerOptions(HTTP_OPTION_3)
    );
  }

  /* istanbul ignore next */
  updatePlot(plotId: string, reqObj: any): Observable<any> {
    return this.http.patch(
      `${BASE_URL}/supply-chain/supply-chains/farmer-plots/${plotId}/`,
      reqObj,
      headerOptions(HTTP_OPTION_3)
    );
  }

  /* istanbul ignore next */
  farmerActivities(farmerId: string, limit = 10, offset = 0): void {
    this.http
      .get(
        `${BASE_URL}/activity/node/?node=${farmerId}&limit=${limit}&offset=${offset}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            const { count, results } = data;
            this.updateStateProp<IReference>('activities', {
              count,
              results,
              loading: false,
            });
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  getFarmerPayments(
    farmerId: string,
    search = '',
    offset = 0,
    limit = 10
  ): void {
    this.http
      .get(
        `${BASE_URL}/projects/projects/payments/?farmer=${farmerId}&limit=${limit}&offset=${offset}&search=${search}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            const { count, results } = data;
            this.updateStateProp<IReference>('payments', {
              count,
              results,
              loading: false,
            });
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  fetchFarmerAttachments(farmerId: string, offset = 0, limit = 10): void {
    this.http
      .get(
        `${BASE_URL}/supply-chain/supply-chains/farmer-attachments/?farmer=${farmerId}&limit=${limit}&offset=${offset}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            const { count, results } = data;
            this.updateStateProp<IReference>('attachments', {
              count,
              results,
              loading: false,
            });
          }
          return res;
        })
      )
      .subscribe();
  }

  /* istanbul ignore next */
  addAttachements(formData: any, id?: string): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/supply-chain/supply-chains/farmer-attachments/`,
        formData,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  listOperations(type: number): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/supply-chain/operations/?supply_chain=${localStorage.getItem(
          'supplyChainId'
        )}&node_type=${type}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  deletePlot(plotId: string): Observable<any> {
    return this.http.delete(
      `${BASE_URL}/supply-chain/supply-chains/farmer-plots/${plotId}/`,
      headerOptions(HTTP_OPTION_3)
    );
  }
}
