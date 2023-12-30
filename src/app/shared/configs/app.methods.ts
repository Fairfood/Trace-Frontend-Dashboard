/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpHeaders } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';
import { IAddionalFilter, IhttpHeadConfig } from './app.model';

/**
 * Validator function that removes spaces from the control's value.
 *
 * @param control - The AbstractControl to validate.
 * @returns Null if the validation passes, otherwise returns an object with the error.
 */
export function removeSpaces(control: AbstractControl): any {
  if (control?.value && !control.value.replace(/\s/g, '').length) {
    control.setValue('');
  }
  return null;
}

/**
 * Custom validator that checks if two fields match.
 *
 * @param controlName - The name of the control to validate.
 * @param matchingControlName - The name of the control to compare against.
 * @returns Validator function for the FormGroup.
 */
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    // Return if another validator has already found an error on the matchingControl
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      return;
    }

    // Set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  };
}

/**
 * Generates HTTP headers based on the provided configuration.
 *
 * @param itemsNeeded - Partial configuration object specifying which headers are needed.
 * @returns HTTP headers options object.
 */
/* istanbul ignore next */
export const headerOptions = (itemsNeeded: Partial<IhttpHeadConfig>) => {
  // Get user data and company ID from local storage
  const userData = JSON.parse(localStorage.getItem('userData'));
  const companyId = localStorage.getItem('companyID');
  // Check if impersonation is enabled
  const impersonate = localStorage.getItem('impersonate');

  // Extract needed properties from the configuration object
  const { timezone, contentType, userId, nodeId, token } = itemsNeeded;

  // Initialize the base header object
  const BASE_HEADER: any = {};

  // Add User-ID header if needed
  if (userId) {
    BASE_HEADER['User-ID'] = userData?.id;
  }

  // Add Bearer token header if needed
  if (token) {
    BASE_HEADER['Bearer'] = userData?.token;
  }

  // Add Node-ID header if needed
  if (nodeId) {
    BASE_HEADER['Node-ID'] = companyId;
  }

  // Add timezone header if needed
  if (timezone) {
    BASE_HEADER['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // Add Content-Type header if needed
  if (contentType) {
    BASE_HEADER['Content-Type'] = 'application/json';
  }

  // Add X-Impersonate header if impersonation is enabled
  if (impersonate) {
    BASE_HEADER['X-Impersonate'] = 'true';
  }

  // Create HTTP headers options object
  const httpOptions = {
    headers: new HttpHeaders({
      ...BASE_HEADER,
    }),
  };

  return httpOptions;
};

/**
 * Formats the response data based on the provided response object.
 *
 * @param res - Response object received from the API.
 * @returns Formatted response data or the original response if code is not 200.
 */
/* istanbul ignore next */
export const successFormatter = (res: any) => {
  const { code, data } = res;

  // Check if the response code is 200 or 201
  if (code === 200 || code === 201) {
    return data; // Return the data if code is 200 or 201
  }

  return res; // Return the original response if code is error
};
/* istanbul ignore next */
export const checkIfToday = (date: number): boolean => {
  const today = new Date().setHours(0, 0, 0, 0);
  const thatDay = new Date(date * 1000).setHours(0, 0, 0, 0);
  return today === thatDay;
};
/* istanbul ignore next */
export function convertDateStringToTimestamp(dateString: string): number {
  return Date.parse(dateString) / 1000;
}
/* istanbul ignore next */
export const mapResults = (d: any) => {
  const { data } = d;
  return data.results;
};
/* istanbul ignore next */
export const getAdditionalFilters = (
  isTransaction: boolean
): IAddionalFilter[] => {
  return [
    {
      name: isTransaction ? 'Transaction date' : 'Created date',
      visible: false,
      id: 'date',
    },
    { name: 'Quantity available', visible: false, id: 'quantity' },
  ];
};
/* istanbul ignore next */
export function getCustomCookie(name: string) {
  const pattern = RegExp(name + '=.[^;]*');
  const matched = document.cookie.match(pattern);
  if (matched) {
    const cookie = matched[0].split('=');
    return cookie[1];
  }
  return 'no-match';
}
