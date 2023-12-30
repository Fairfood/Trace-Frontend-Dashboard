/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

// services
import { RouterService, StorageService } from 'src/app/shared/service';
import { ConnectionService } from '../connections.service';
// methods and constants
import {
  removeSpaces,
  successFormatter,
} from 'src/app/shared/configs/app.methods';
import { BASE_URL } from 'src/app/shared/configs/app.constants';
import { ICommonObj } from 'src/app/shared/configs/app.model';

@Injectable({
  providedIn: 'root',
})
export class NewConnectionCompanyService {
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
      name: ['', [Validators.required, removeSpaces]],
      primaryOperation: ['', Validators.required],
      identificationNo: [''],
    });
  }

  createMiscForm(): FormGroup {
    return this.fb.group({
      connectionOf: ['', Validators.required],
      connectedTo: ['', Validators.required],
      supplyChain: ['', Validators.required],
      relation: [1, Validators.required],
      message: ['', Validators.maxLength(200)],
      silentInvite: [false],
    });
  }

  createAddressForm(): FormGroup {
    return this.fb.group({
      street: ['', Validators.required],
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
      inFirstName: ['', [Validators.required, removeSpaces]],
      inLastName: ['', [Validators.required, removeSpaces]],
      inEmail: ['', [Validators.required, Validators.email]],
      inDialCode: ['', Validators.required],
      inMobile: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern('^(?!0+$)[0-9]{1,15}$'),
        ],
      ],
    });
  }

  setOperationList(): Observable<any> {
    return this.connectionService.setOperationList(1);
  }

  searchCompanyProxy(data: string, nameFormControl: any): Observable<any> {
    return this.connectionService.searchCompany(data).pipe(
      map(successFormatter),
      tap((responseObj: any) => {
        const { results } = responseObj;
        const companyNames = results;

        const found = companyNames.find(
          (c: Partial<ICommonObj>) =>
            c.name.toLowerCase() === nameFormControl.value.toLowerCase()
        );
        if (found) {
          nameFormControl.setErrors({
            connected: true,
          });
        } else {
          nameFormControl.setErrors(null);
        }
      })
    );
  }

  backToConnections(): void {
    this.router.navigateUrl('/connections');
  }

  backToStock(): void {
    this.router.navigateUrl('/stock/receive');
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

  createInviteObject(form: any): any {
    const { primaryOperation, company, supplyChain, connectedTo } = form.value;
    const params: any = {
      connected_to: connectedTo,
      supply_chain: supplyChain,
      relation: 2,
      company,
      supplier_for: [],
      primary_operation: primaryOperation,
    };

    return params;
  }

  createConnectionObject(form1: any, form2: any, form3: any): any {
    const {
      connectionOf,
      connectedTo,
      supplyChain,
      relation,
      message,
      silentInvite,
    } = form3;
    const {
      inFirstName,
      inLastName,
      inEmail,
      inDialCode,
      inMobile,
      ...restOfItems
    } = form2;
    const { name, primaryOperation, identificationNo } = form1;
    const reqObj: any = {
      connection_of: connectionOf,
      connected_to: connectedTo,
      supplier_for: [],
      supply_chain: supplyChain,
      relation,
      name,
      primary_operation: primaryOperation,
      identification_no: identificationNo,
      ...restOfItems,
      in_fname: inFirstName,
      in_lname: inLastName,
      in_email: inEmail,
      in_dial_code: inDialCode,
      in_mobile: inMobile,
      message,
      incharge: {
        first_name: inFirstName,
        last_name: inLastName,
        email: inEmail,
      },
      phone: {
        dial_code: inDialCode,
        phone: inMobile,
      },
      send_email: !silentInvite,
      buyer_for: [],
    };

    return reqObj;
  }

  inviteCompany(id: string, params: any) {
    const url = `${BASE_URL}/supply-chain/invite/company/`;
    return this.http
      .post(url, params, this.connectionService.options(id))
      .pipe(map(successFormatter));
  }

  fetchDefaultData(): any {
    const data = {
      stock: false,
      addConnection: true,
      connectionType: 'supplier',
      companyName: '',
      fullView: true,
      chainName: this.storage.retrieveStoredData('supplyChainName'),
      nodeId: this.storage.retrieveStoredData('companyID'),
      nodeName: this.storage.retrieveStoredData('companyName'),
      schainId: this.storage.retrieveStoredData('supplyChainId'),
    };

    return data;
  }

  connectionsListing(reqObj: any): Observable<any> {
    return this.connectionService.connectionList(reqObj).pipe(
      map(res => {
        const { results, count } = res;
        const connections: any = [];
        results.forEach((buyer: any) => {
          const { connection_details, id, full_name } = buyer;
          connections.push({
            id,
            name: full_name,
            tier: Math.abs(connection_details.tier),
          });
        });
        return { connections, count };
      })
    );
  }
}
