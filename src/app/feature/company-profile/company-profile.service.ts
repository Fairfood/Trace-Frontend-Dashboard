/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { environment } from 'src/environments/environment';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import {
  HTTP_OPTION_3,
  HTTP_OPTION_4,
  emailRegex,
} from 'src/app/shared/configs/app.constants';
const BASE_URL = environment.baseUrl;
// services
import { StorageService } from 'src/app/shared/service';
import { CompanyProfileStoreService } from './company-profile-store.service';
/**
 * Service for managing company profiles.
 */
@Injectable({
  providedIn: 'root',
})
export class CompanyProfileService {
  companyImageUpdated: boolean;
  currentImageData: any;

  /**
   * Constructor.
   * @param http - Angular's HttpClient for HTTP requests.
   * @param storage - Service for interacting with local storage.
   * @param store - Store service for managing company profile data.
   * @param fb - Angular's FormBuilder for creating form groups.
   */
  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private store: CompanyProfileStoreService,
    private fb: FormBuilder
  ) {}

  /**
   * Retrieves the supply chain data from local storage.
   * @returns The supply chain data.
   */
  supplyChainData(): any {
    return this.storage.retrieveStoredData('supplyChainId');
  }

  /**
   * Fetches the company profile details.
   * @param id - The company ID.
   */
  fetchCompanyProfileDetails(id: string): void {
    const companyId = this.storage.retrieveStoredData('companyID');
    const url = `${BASE_URL}/supply-chain/company/${
      id ? `${id}/?supply_chain=${this.supplyChainData()}` : `${companyId}/`
    }`;

    this.http
      .get(url, headerOptions(HTTP_OPTION_4))
      .pipe(
        tap((d: any) => {
          const { data } = d;
          this.store.updateProfileData(data);
        })
      )
      .subscribe();
  }

  /**
   * Updates the company details.
   * @param id - The company ID.
   * @param params - The parameters to be updated.
   * @returns An observable of the HTTP response.
   */
  updateCompanyDetails(id: any, params: any): Observable<any> {
    return this.http.patch(
      `${BASE_URL}/supply-chain/company/${id}/`,
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  /**
   * Generates request options from the form value.
   * @param formValue - The form value.
   * @returns The generated request options.
   */
  generateRequestOptions(formValue: any): any {
    const {
      name,
      description,
      street,
      country,
      province,
      regNo,
      zipCode,
      city,
      latitude,
      longitude,
      inName,
      inEmail,
      inMobile,
      inDialCode,
    } = formValue;
    return {
      identification_no: regNo,
      city,
      description_basic: description,
      name,
      street,
      zipcode: zipCode,
      terms: true,
      country,
      province,
      latitude,
      longitude,
      in_name: inName,
      in_email: inEmail,
      in_dial_code: inDialCode,
      in_mobile: inMobile,
      phone: {
        dial_code: inDialCode,
        phone: inMobile,
      },
      incharge: {
        first_name: inName,
        last_name: '',
        email: inEmail,
      },
    };
  }

  /**
   * Gets active supply chains.
   * @param id - The ID.
   * @param limit - The limit.
   * @param offset - The offset.
   * @returns An observable of the active supply chains.
   */
  getActiveSupplyChains(
    id: any,
    limit: number,
    offset: number
  ): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/supply-chain/admin/supplychain/node/${id}/?limit=${limit}&offset=${offset}`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Gets wallets.
   * @returns An observable of the wallets.
   */
  getWallets(): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/supply-chain/node/wallet/`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Gets activity log.
   * @param limit - The limit.
   * @param offset - The offset.
   * @param nodeId - The node ID.
   * @param supplyChain - The supply chain.
   * @returns An observable of the activity log.
   */
  activityLog(
    limit = 10,
    offset = 0,
    nodeId = '',
    supplyChain?: string
  ): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/activity/node/?limit=${limit}&offset=${offset}&supply_chain=${
          supplyChain || ''
        }&node=${nodeId}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Lists company claims.
   * @param nodeId - The node ID.
   * @param limit - The limit.
   * @param offset - The offset.
   * @returns An observable of the company claims.
   */
  listCompanyClaims(nodeId: string, limit = 10, offset = 0): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/claims/node/${nodeId}/?limit=${limit}&offset=${offset}`,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /**
   * Creates a form group for basic details.
   * @returns The form group for basic details.
   */
  basicDetailsForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      regNo: [''],
      description: ['', Validators.maxLength(500)],
      city: ['', Validators.required],
      country: ['', Validators.required],
      province: ['', Validators.required],
      street: ['', Validators.required],
      zipCode: [''],
      inName: ['', Validators.required],
      inEmail: ['', [Validators.required, Validators.pattern(emailRegex)]],
      inMobile: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern('^(?!0+$)[0-9]{1,15}$'),
        ],
      ],
      inDialCode: ['', Validators.required],
      latitude: [
        '',
        [
          Validators.pattern(/^[-+]?[0-9]{1,7}(\.[0-9]+)?$/),
          Validators.min(-90),
          Validators.max(90),
        ],
      ],
      longitude: [
        '',
        [
          Validators.pattern(/^[-+]?[0-9]{1,7}(\.[0-9]+)?$/),
          Validators.min(-180),
          Validators.max(180),
        ],
      ],
    });
  }
}
