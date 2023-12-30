/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import {
  BASE_URL,
  HTTP_OPTION_3,
  HTTP_OPTION_4,
} from 'src/app/shared/configs/app.constants';
import {
  headerOptions,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { StorageService } from 'src/app/shared/service';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  mapData$ = new BehaviorSubject(null);
  constructor(private http: HttpClient, private storage: StorageService) {}

  getConnections(id: string, chain: string) {
    return this.http
      .get(
        BASE_URL +
          '/supply-chain/connections/' +
          id +
          '/map/?supply_chain=' +
          chain,
        this.options(id)
      )
      .pipe(
        tap((res: any) => {
          const { data, success } = res;
          if (success) {
            this.mapData$.next(data);
          }
        })
      );
  }

  listOperations(): Observable<any> {
    return this.http
      .get(
        `${BASE_URL}/supply-chain/operations/?supply_chain=${this.storage.retrieveStoredData(
          'supplyChainId'
        )}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  searchCompany(val: string): Observable<any> {
    const url = `${BASE_URL}/supply-chain/company/?search=${val}&connection_status=false`;
    return this.http.get(url, headerOptions(HTTP_OPTION_3));
  }

  inviteCompany(id: string, params: any) {
    const url = `${BASE_URL}/supply-chain/invite/company/`;
    return this.http.post(url, params, this.options(id));
  }

  getBuyers(chainId: string): Observable<any> {
    const url = `${BASE_URL}/supply-chain/buyers/?supply_chain=${chainId}`;
    return this.http
      .get(url, headerOptions(HTTP_OPTION_4))
      .pipe(map(successFormatter));
  }

  verifyBulkUploadTemplate(file: any) {
    const sChainId = localStorage.getItem('supplyChainId');
    return this.http.post(
      BASE_URL + '/supply-chain/bulk/farmer/?supply_chain=' + sChainId,
      file,
      headerOptions(HTTP_OPTION_3)
    );
  }

  inviteFarmer(id: string, params: any) {
    return this.http.post(
      BASE_URL + '/supply-chain/invite/farmer/',
      params,
      this.options(id)
    );
  }

  getBulkUploadTemplate1(
    id: string,
    params: any,
    supplyChainId: string
  ): Observable<any> {
    const data = JSON.parse(localStorage.getItem('userData'));
    const node_id = localStorage.getItem('companyID');
    const headers = new HttpHeaders({
      Bearer: data.token,
      'User-ID': data.id,
      'Node-ID': node_id,
    });
    return this.http.get(
      BASE_URL +
        '/supply-chain/bulk/farmer/?connection=' +
        id +
        '&supply_chain=' +
        supplyChainId +
        '&fields=' +
        params,
      { headers, responseType: 'arraybuffer' }
    );
  }

  /**
   * new api
   * @param params any
   * @returns Observable
   */
  connectionList(params: any): Observable<any> {
    const {
      limit,
      offset,
      searchString,
      type,
      relationship,
      primaryOperation,
      status,
    } = params;
    const url = `${BASE_URL}/supply-chain/supply-chains/connection-nodes/?limit=${limit}&offset=${offset}&search=${
      searchString || ''
    }`;
    const url2 = `&type=${
      type || ''
    }&relationship=${relationship}&primary_operation=${
      primaryOperation || ''
    }&status=${status || ''}`;
    return this.http
      .get(
        `${url}&supply_chain=${this.storage.retrieveStoredData(
          'supplyChainId'
        )}${url2}`,
        headerOptions(HTTP_OPTION_3)
      )
      .pipe(map(successFormatter));
  }

  getUsedConnectionLabels(): Observable<any> {
    const url = `${BASE_URL}/supply-chain/label/?limit=100&used=true&used_in=${this.storage.retrieveStoredData(
      'supplyChainId'
    )}`;
    return this.http
      .get(url, headerOptions(HTTP_OPTION_4))
      .pipe(map(successFormatter));
  }

  getCompanyDetails(id: string): Observable<any> {
    return this.http.get(
      BASE_URL + '/supply-chain/company/' + id + '/',
      this.options(id)
    );
  }

  getSupplychains(id: string): Observable<any> {
    return this.http.get(BASE_URL + '/supply-chain/', this.options(id));
  }

  memberTypeDetails(): number {
    return +localStorage.getItem('memberType');
  }

  infoWindowSetup(marker: any, type: string, selectedChainName: string): any {
    let content;
    if (type === 'welcome_text') {
      content = `<div class="info-welcome-box">
        <div class="h-1">Welcome to nutmeg supply chain</div>
        <div class="h-2 text-xs font-1-normal text-blue">You can click on the actors to add new connections <br> in this ${selectedChainName} supply chain. </div>
          <button class="infowindow-btn btn-custom" id="welcome-1">Ok got it!</button>
      </div>`;
    } else {
      content = `<div class="info-container row-md m-0 p-0">
      <div class="inner-left p-0 col-md-1">
      <div  class="text-center txt-img"> <h1 class="text-xxxs font-1-normal mb-0">T${
        marker.customInfo.tier
      }</h1></div>
      </div>
      <div class="inner-right p-0 col-md-9">
        <div class="h-1">${
          marker.customInfo.name.length > 48
            ? marker.customInfo.name.slice(0, 49) + '...'
            : marker.customInfo.name
        }</div>
        <div class="h-2">${
          marker.customInfo.tier > 0
            ? 'Supplier'
            : marker.customInfo.tier === 0
            ? 'My company'
            : 'Buyer'
        }  ${marker.customInfo.type === 2 ? ', Farmer' : ''}</div>
        <div class="h-2">Product: ${selectedChainName}</div>
        <!-- <div class="h-2">TIER-${marker.customInfo.tier}</div> -->
      </div>
       <div class="ff-flex-between col-md-12">
       <button class="btn btn-white pointer" id="view-${
         marker.customInfo.id
       }" >View details</button>
       <button class="btn btn-red" id="add-${
         marker.customInfo.id
       }" style="display:${
        marker.customInfo.type === 1 &&
        this.memberTypeDetails() !== 3 &&
        (marker.customInfo.tier === 0 || marker.customInfo.add_connections)
          ? 'block'
          : 'none'
      }" >Add connection</button>
        </div>
    </div>`;
    }

    return {
      content,
      marker,
    };
  }

  setupClusterInfoWinodw(cluster: any, selectedChainName: string): any {
    let content = `<div class="infowindow-title font-1-bold text-xs">${cluster.cluster_.markers_?.length} actors in this location</div><div class="info-scroll">`;
    for (const marker of cluster.cluster_.markers_) {
      content += `<div id="actordetail-0-${
        marker.customInfo.id
      }" class="info-container info-container-list b-b row-md m-0 p-0 pointer">
      <div class="inner-left p-0 col-md-1" id="actordetail-1-${
        marker.customInfo.id
      }">
        <div class="txt-img text-center" id="actordetail-3-${
          marker.customInfo.id
        }"> <h1 class="text-xxxs font-1-normal mb-0" id="actordetail-2-${
        marker.customInfo.id
      }">T${marker.customInfo.tier}</h1></div>
      </div>
      <div class="inner-right p-0 col-md-9" id="actordetail-4-${
        marker.customInfo.id
      }">
      <div class="h-1" id="actordetail-5-${marker.customInfo.id}">${
        marker.customInfo.name.length > 52
          ? marker.customInfo.name.slice(0, 53) + '...'
          : marker.customInfo.name
      }</div>
        <div class="h-2" id="actordetail-6-${marker.customInfo.id}">${
        marker.customInfo.tier > 0
          ? 'Supplier'
          : marker.customInfo.tier === 0
          ? 'My company'
          : 'Buyer'
      }  ${marker.customInfo.type === 2 ? ', Farmer' : ''}</div>
        <div class="h-2" id="actordetail-7-${
          marker.customInfo.id
        }">Product: ${selectedChainName}</div>
      </div>
      <div class="ff-flex-between col-md-12 " id="actordetail-8-${
        marker.customInfo.id
      }">
      <button class="btn btn-white pointer" id="view-${
        marker.customInfo.id
      }" >View details</button>
      <button class="btn btn-red" id="add-${
        marker.customInfo.id
      }" style="display:${
        marker.customInfo.type === 1 &&
        this.memberTypeDetails() !== 3 &&
        (marker.customInfo.tier === 0 || marker.customInfo.add_connections)
          ? 'block'
          : 'none'
      }" >Add connection</button>
       </div>
    </div>`;
    }
    return content;
  }

  getConnectionDetails(id: string) {
    return this.http.get(
      BASE_URL + '/supply-chain/company/' + id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  getFarmerDetails(id: string) {
    return this.http.get(
      BASE_URL + '/supply-chain/farmer/' + id + '/',
      headerOptions(HTTP_OPTION_4)
    );
  }

  resendFarmerInvite(data: any) {
    return this.http.post(
      BASE_URL + '/supply-chain/invitation/resend/',
      data,
      headerOptions(HTTP_OPTION_4)
    );
  }

  createConnectonRequest(params: any): Observable<any> {
    return this.http.post(
      BASE_URL + '/requests/connection/',
      params,
      headerOptions(HTTP_OPTION_4)
    );
  }

  setOperationList(type: number): Observable<any> {
    return this.listOperations().pipe(
      map(res => {
        const { results } = res;
        return results.filter((e: any) => {
          // farmer node type is 2
          // company type is 1
          return e.node_type === type;
        });
      })
    );
  }

  // httpOptions
  options(id?: string) {
    const data = JSON.parse(localStorage.getItem('userData'));
    const nodeId = localStorage.getItem('companyID');
    const impersonate = localStorage.getItem('impersonate');

    const req: any = {
      'Content-Type': 'application/json',
      Bearer: data.token,
      'User-ID': data.id,
      'Node-ID': id ? id : nodeId,
    };

    if (impersonate) {
      req['X-Impersonate'] = 'true';
    }
    const httpOptions = {
      headers: new HttpHeaders(req),
    };
    return httpOptions;
  }
}
