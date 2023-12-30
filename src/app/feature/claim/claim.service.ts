/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HTTP_OPTION_4 } from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  mapResults,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { ICommonObj } from 'src/app/shared/configs/app.model';
import { StorageService } from 'src/app/shared/service';

import { environment } from 'src/environments/environment';
import { IClaim, IClaimCriteria, IClaimField } from './claim.model';
const BASE_URL = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  constructor(private http: HttpClient, private storage: StorageService) {}

  supplyChainData(): string {
    return this.storage.retrieveStoredData('supplyChainId');
  }

  /**
   * Fetch all the claims in the supply chain.
   * @returns Observable any
   */
  getClaims(): Observable<IClaim[]> {
    const supplyChainId = this.supplyChainData();
    return this.http
      .get(
        BASE_URL + '/claims/?supply_chain=' + supplyChainId + '&type=1',
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(mapResults));
  }

  formatClaimsData(claimData: IClaim[], companies: ICommonObj[]): any {
    return claimData.map(e => {
      this.processCriteria(e.criteria);
      this.setEvidenceFlag(e.criteria, e);
      this.setTableAndDropdownFlags(e.criteria);
      this.setAssignVerifierFlag(e);
      this.setVerifierName(e, companies);
      this.setDefaultSelectedFlag(e);
      return e;
    });
  }

  processCriteria(criteria: IClaimCriteria[]) {
    criteria.forEach(criterion => {
      this.processFields(criterion.fields);
    });
  }

  setEvidenceFlag(criteria: IClaimCriteria[], claim: IClaim) {
    claim.evidence = criteria.some(criterion => criterion.fields.length > 0);
  }

  processFields(fields: IClaimField[]) {
    fields.forEach(field => {
      if (field.type === 3) {
        field.table = true;
      } else if (field.type === 2) {
        this.processOptions(field);
      }
    });
  }

  setTableAndDropdownFlags(criteria: any[]) {
    criteria.forEach(criterion => {
      if (criterion.fields.some((field: IClaimField) => field.type === 3)) {
        criterion.table = true;
      }
    });
  }

  processOptions(field: IClaimField) {
    field.options = field.options.map((item: string) => {
      return {
        id: item,
        name: item,
      };
    });
  }

  setAssignVerifierFlag(claim: IClaim) {
    claim.assignVerifier = claim.verified_by === 2;
  }

  setVerifierName(claim: IClaim, companies: ICommonObj[]) {
    if (claim.verifiers) {
      const verifier = companies.find(
        company => company.id === claim.verifiers[0]
      );
      claim.verifierName = verifier ? verifier.name : null;
    } else {
      claim.verifiers = [];
    }
  }

  setDefaultSelectedFlag(claim: IClaim) {
    claim.selected = claim.selected || false;
  }

  /* istanbul ignore next */
  claimAttachApi(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/claims/transaction/attach/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }
  /* istanbul ignore next */
  saveClaimData(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/claims/transaction/data/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  /**
   *
   * @param id any
   * @param search string
   * @returns Observable <any>
   */
  /* istanbul ignore next */
  getVerifiers(id: any, search?: string): Observable<any> {
    const supplyChainId = this.supplyChainData();
    return this.http
      .get(
        BASE_URL +
          '/claims/verifier/?claim=' +
          id +
          '&supply_chain=' +
          supplyChainId +
          '&search=' +
          search,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(mapResults));
  }

  /* istanbul ignore next */
  claimAssignorList(assignedTo: boolean, assignedBy: boolean): Observable<any> {
    return this.http
      .get(
        BASE_URL +
          '/claims/verifier/?limit=100&search&assigned_to=' +
          assignedTo +
          '&assigned_by=' +
          assignedBy,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(mapResults));
  }

  /* istanbul ignore next */
  veriticationRequests(reqOptions: any): Observable<any> {
    const supplyChainId = this.supplyChainData();
    const {
      limit,
      selectedProduct,
      selectedClaim,
      selectedAssignor,
      searchString,
      offset,
      status,
    } = reqOptions;
    return this.http
      .get(
        BASE_URL +
          '/claims/verification/sent/?limit=' +
          limit +
          '&offset=' +
          offset +
          '&search=' +
          searchString +
          '&claim=' +
          selectedClaim +
          '&status=' +
          status +
          '&verifier=' +
          selectedAssignor +
          '&supply_chain=' +
          supplyChainId +
          '&product=' +
          selectedProduct,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  getVerificationDetails(id: string): Observable<any> {
    const url = `${BASE_URL}/claims/attached-claim/${id}/`;
    return this.http
      .get(url, headerOptions(HTTP_OPTION_4))
      .pipe(map(successFormatter));
  }

  /* istanbul ignore next */
  getInheritableClaims(params: any): Observable<any> {
    return this.http
      .post(
        `${BASE_URL}/claims/inheritable/`,
        params,
        headerOptions(HTTP_OPTION_4)
      )
      .pipe(
        map((d: any) => {
          const { data } = d;
          return data.inheritable_claims || [];
        })
      );
  }

  /* istanbul ignore next */
  addComments(params: any) {
    return this.http.post(
      `${BASE_URL}/claims/comment/`,
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }
}
