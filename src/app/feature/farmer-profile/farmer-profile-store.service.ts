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
  INIT_TABLE,
  IReference,
  IStateFarmerProfile,
} from './farmer-profile.config';
import {
  BASE_URL,
  HTTP_OPTION_3,
  HTTP_OPTION_4,
} from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';

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
  farmerDetails$: Observable<IFarmerDetails> = this.select(
    (state: IStateFarmerProfile) => state.farmerDetails
  );
  updatingDetails$: Observable<boolean> = this.select(
    (state: IStateFarmerProfile) => state.isUpdating
  );
  farmerReference$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.farmerReferences
  );
  masterReferences$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.referenceMaster
  );
  plots$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.plots
  );
  activities$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.activities
  );
  payments$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.payments
  );
  attachments$: Observable<IReference> = this.select(
    (state: IStateFarmerProfile) => state.attachments
  );
  constructor(private http: HttpClient) {
    super(initialState);
  }

  updateFarmerDetails(data: any): void {
    this.setState({
      farmerDetails: data,
    });
  }

  updatingData(isUpdating: boolean): void {
    this.setState({
      isUpdating,
    });
  }

  updateReference(data: IReference): void {
    this.setState({
      farmerReferences: data,
    });
  }

  setMasterReference(data: IReference): void {
    this.setState({
      referenceMaster: data,
    });
  }

  setPlotsArray(data: IReference): void {
    this.setState({
      plots: data,
    });
  }

  setActivities(data: IReference): void {
    this.setState({
      activities: data,
    });
  }

  setPayments(data: IReference): void {
    this.setState({
      payments: data,
    });
  }

  setAttachments(data: IReference): void {
    this.setState({
      attachments: data,
    });
  }

  transformDetails(farmerDetails: any): void {
    const { first_name, last_name, phone, family_members, total_income } =
      farmerDetails;
    const { total_amount, amount_from_products, amount_from_premiums } =
      total_income;

    const product =
      `${
        amount_from_products &&
        amount_from_products[0]?.amount.toLocaleString('en-US')
      } ${amount_from_products && amount_from_products[0]?.currency}` || 0;

    const premium =
      `${
        amount_from_premiums &&
        amount_from_premiums[0]?.amount.toLocaleString('en-US')
      } ${amount_from_premiums && amount_from_premiums[0]?.currency}` || 0;

    const total =
      `${total_amount && total_amount[0]?.amount.toLocaleString('en-US')} ${
        total_amount && total_amount[0]?.currency
      }` || 0;
    const result = {
      ...farmerDetails,
      firstName: first_name,
      lastName: last_name,
      familyMembers: family_members,
      dialCode: phone?.dial_code,
      phoneNumber: phone?.phone,
      avatar: `${first_name[0] || ''}${last_name[0] || ''}`,
      income: {
        product: product,
        premium: premium,
        others: `0 ${total_amount && total_amount[0]?.currency}`,
        total: total,
      },
    };
    this.updateFarmerDetails(result);
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

  updateFarmerDetailAPI(id: string, params: any): Observable<any> {
    return this.http.patch(
      BASE_URL + '/supply-chain/farmer/' + id + '/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  updateFarmConnectionDetails(id: string, params: any): void {
    this.updateFarmerDetailAPI(id, params)
      .pipe(
        map((res: any) => {
          const { data, success } = res;
          if (success) {
            this.transformDetails(data);
            this.updatingData(false);
            return data;
          }
          return res;
        })
      )
      .subscribe();
  }

  createFarmerReference(param: any, farmerId: string): Observable<any> {
    return this.http.post(
      `${BASE_URL}/supply-chain/supply-chains/farmer-references/?farmer=${farmerId}`,
      param,
      headerOptions(HTTP_OPTION_3)
    );
  }

  updateFarmerReference(param: any, refId: string): Observable<any> {
    return this.http.patch(
      `${BASE_URL}/supply-chain/supply-chains/farmer-references/${refId}/`,
      param,
      headerOptions(HTTP_OPTION_3)
    );
  }

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
            this.setMasterReference({ count, results, loading: false });
          }
          return res;
        })
      )
      .subscribe();
  }

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
            this.updateReference({ count, results, loading: false });
          }
          return res;
        })
      )
      .subscribe();
  }

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
            this.setPlotsArray({ count, results, loading: false });
          }
          return res;
        })
      )
      .subscribe();
  }

  createFarmerPlot(farmerId: string, reqObj: any): Observable<any> {
    return this.http.post(
      `${BASE_URL}/supply-chain/supply-chains/farmer-plots/?farmer=${farmerId}`,
      reqObj,
      headerOptions(HTTP_OPTION_3)
    );
  }

  updatePlot(plotId: string, reqObj: any): Observable<any> {
    return this.http.patch(
      `${BASE_URL}/supply-chain/supply-chains/farmer-plots/${plotId}/`,
      reqObj,
      headerOptions(HTTP_OPTION_3)
    );
  }

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
            this.setActivities({ count, results, loading: false });
          }
          return res;
        })
      )
      .subscribe();
  }

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
            this.setPayments({ count, results, loading: false });
          }
          return res;
        })
      )
      .subscribe();
  }

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
            this.setAttachments({ count, results, loading: false });
          }
          return res;
        })
      )
      .subscribe();
  }

  addAttachements(formData: any, id?: string): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/supply-chain/supply-chains/farmer-attachments/`,
        formData,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

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

  deletePlot(plotId: string): Observable<any> {
    return this.http.delete(
      `${BASE_URL}/supply-chain/supply-chains/farmer-plots/${plotId}/`,
      headerOptions(HTTP_OPTION_3)
    );
  }
}
