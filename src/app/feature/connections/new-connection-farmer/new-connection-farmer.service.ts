/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  removeSpaces,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { BASE_URL } from 'src/app/shared/configs/app.constants';

import { RouterService, StorageService } from 'src/app/shared/service';
import { ConnectionService } from '../connections.service';

@Injectable({
  providedIn: 'root',
})
export class NewConnectionFarmerService {
  connectionInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private router: RouterService,
    private storage: StorageService,
    private connectionService: ConnectionService
  ) {}

  createBasicDetailsForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, removeSpaces]],
      lastName: ['', [Validators.required, removeSpaces]],
      primaryOperation: ['', Validators.required],
      identificationNo: [''],
    });
  }

  createMiscForm(): FormGroup {
    return this.fb.group({
      connectionOf: ['', Validators.required],
      connectedTo: ['', Validators.required],
      supplierFor: [''],
      supplyChain: ['', Validators.required],
      relation: [1, Validators.required],
      message: ['', Validators.maxLength(200)],
    });
  }

  createAddressForm(): FormGroup {
    return this.fb.group({
      street: [''],
      city: ['', [Validators.required, removeSpaces]],
      province: ['', Validators.required],
      country: ['', Validators.required],
      latitude: [
        '0',
        [
          Validators.pattern(/^[-+]?[0-9]{1,7}(\.[0-9]+)?$/),
          Validators.min(-90),
          Validators.max(90),
        ],
      ],
      longitude: [
        '0',
        [
          Validators.pattern(/^[-+]?[0-9]{1,7}(\.[0-9]+)?$/),
          Validators.min(-180),
          Validators.max(180),
        ],
      ],
      zipcode: [''],
      email: ['', Validators.email],
      dialCode: [''],
      mobile: [
        '',
        [Validators.minLength(2), Validators.pattern('^(?!0+$)[0-9]{1,15}$')],
      ],
    });
  }

  backToConnections(): void {
    this.router.navigateUrl('/connections');
    this.connectionInfo$.next(null);
  }

  backToStock(): void {
    this.router.navigateUrl('/stock/receive');
    this.connectionInfo$.next(null);
  }

  setOperationList(): Observable<any> {
    return this.connectionService.setOperationList(2);
  }

  formatRequestData(form1: any, form2: any, form3: any): any {
    const { connectionOf, connectedTo, supplyChain, relation } = form3;

    const { firstName, lastName, primaryOperation, identificationNo } = form1;

    const { email, dialCode, mobile, ...restOfItems } = form2;
    return {
      connection_of: connectionOf,
      connected_to: connectedTo,
      supplier_for: [],
      supply_chain: supplyChain,
      relation,
      primary_operation: primaryOperation,
      identification_no: identificationNo,
      ...restOfItems,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: {
        dial_code: dialCode,
        phone: mobile,
      },
    };
  }

  inviteFarmer(id: string, params: any): Observable<any> {
    return this.http
      .post(
        BASE_URL + '/supply-chain/invite/farmer/',
        params,
        this.connectionService.options(id)
      )
      .pipe(map(successFormatter));
  }

  fetchNodeId(): any {
    return {
      nodeId: this.storage.retrieveStoredData('companyID'),
      schainId: this.storage.retrieveStoredData('supplyChainId'),
      chainName: this.storage.retrieveStoredData('supplyChainName'),
    };
  }

  backButton(incomingData: any): void {
    /**
     * If the user is coming from stock page, then redirect to stock page
     * and delete any connection related info from service
     */
    if (incomingData.stock) {
      this.backToStock();
    } else {
      this.backToConnections();
    }
    this.connectionInfo$.next(null);
  }

  listBuyers(reqObj: any): Observable<any> {
    return this.connectionService.connectionList(reqObj).pipe(
      map(res => {
        const { results, count } = res;
        const buyers: any = [];
        results.forEach((buyer: any) => {
          const { connection_details, id, full_name } = buyer;
          buyers.push({
            id,
            name: full_name,
            tier: Math.abs(connection_details.tier),
          });
        });
        return { buyers, count };
      })
    );
  }
}
