/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
// configs
import { ButtonState } from 'fairfood-utils';
import { BASE_URL } from 'src/app/shared/configs/app.constants';
import { removeSpaces } from 'src/app/shared/configs/app.methods';

/**
 * Service for the create connection popup.
 */
@Injectable({
  providedIn: 'root',
})
export class CreateConnectionPopupService {
  /**
   * Constructor of the service.
   * @param fb - FormBuilder for creating forms.
   * @param http - HttpClient for making HTTP requests.
   */
  constructor(private fb: FormBuilder, private http: HttpClient) {}

  /**
   * Creates the address form.
   * @returns Address form.
   */
  addressForm(): any {
    return {
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
    };
  }

  /**
   * Creates the company form.
   * @returns Company form.
   */
  createCompanyForm(): any {
    return this.fb.group({
      connectionOf: ['', Validators.required],
      connectedTo: ['', Validators.required],
      supplierFor: [''],
      basic: this.fb.group({
        name: ['', [Validators.required, removeSpaces]],
        primaryOperation: ['', Validators.required],
        identificationNo: [''],
      }),
      addressDetails: this.fb.group(this.addressForm()),
      supplyChain: ['', Validators.required],
      relation: [1, Validators.required],
      message: ['', Validators.maxLength(200)],
      silentInvite: [false],
    });
  }

  /**
   * Creates the invite form.
   * @returns Invite form.
   */
  createInviteForm(): any {
    return this.fb.group({
      message: ['', Validators.maxLength(200)],
      silentInvite: [false],
      primaryOperation: ['', Validators.required],
      supplyChain: ['', Validators.required],
      relation: [1, Validators.required],
      company: ['', Validators.required],
    });
  }

  /**
   * Creates the invite object from the form.
   * @param form - Invite form.
   * @returns Invite object.
   */
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

  /**
   * Creates the connection object from the form.
   * @param form - Connection form.
   * @returns Connection object.
   */
  createConnectionObject(form: any): any {
    const {
      connectionOf,
      connectedTo,
      supplyChain,
      relation,
      basic,
      addressDetails,
      message,
      silentInvite,
    } = form.value;
    const {
      inFirstName,
      inLastName,
      inEmail,
      inDialCode,
      inMobile,
      ...restOfItems
    } = addressDetails;
    const reqObj: any = {
      connection_of: connectionOf,
      connected_to: connectedTo,
      supplier_for: [],
      supply_chain: supplyChain,
      relation,
      name: basic.name,
      primary_operation: basic.primaryOperation,
      identification_no: basic.identificationNo,
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

  /**
   * Invites a company.
   * @param id - Company ID.
   * @param params - Request parameters.
   * @returns HTTP response for the invite.
   */
  inviteCompany(id: string, params: any) {
    const url = `${BASE_URL}/supply-chain/invite/company/`;
    return this.http.post(url, params, this.options(id));
  }

  /**
   * Gets the initial button state based on whether it is an invite.
   * @param isInvite - Whether it is an invite.
   * @returns Button state.
   */
  initialButtonState(isInvite: boolean): ButtonState {
    if (isInvite) {
      return {
        buttonText: 'Invite connection',
        disabled: true,
      };
    } else {
      return {
        buttonText: 'Continue',
        disabled: true,
      };
    }
  }

  /**
   * Gets the HTTP options.
   * @param id - Company ID.
   * @returns HTTP options.
   */
  options(id?: string) {
    const data = JSON.parse(localStorage.getItem('userData'));
    const nodeId = localStorage.getItem('companyID');
    const impersonate = localStorage.getItem('impersonate');

    const req: any = {
      'Content-Type': 'application/json',
      Bearer: data.token,
      'User-ID': data.id,
      'Node-ID': id ?? nodeId,
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
