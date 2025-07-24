/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpHeaders } from '@angular/common/http';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
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
 * Formats the response data based on the provided response object.
 *
 * @param res - Response object received from the API.
 * @returns Formatted response data or the original response if code is not 200.
 */
export const successFormatter = (res: any) => {
  const { code, data } = res;

  // Check if the response code is 200 or 201
  if (code === 200 || code === 201) {
    return data; // Return the data if code is 200 or 201
  }

  return res; // Return the original response if code is error
};
export const checkIfToday = (date: number): boolean => {
  const today = new Date().setHours(0, 0, 0, 0);
  const thatDay = new Date(date * 1000).setHours(0, 0, 0, 0);
  return today === thatDay;
};

export function convertDateStringToTimestamp(dateString: string): number {
  return Date.parse(dateString) / 1000;
}

export const mapResults = (d: any) => {
  const { data } = d;
  return data.results;
};

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

export function getCustomCookie(name: string) {
  const pattern = RegExp(name + '=.[^;]*');
  const matched = document.cookie.match(pattern);
  if (matched) {
    const cookie = matched[0].split('=');
    return cookie[1];
  }
  return 'no-match';
}

/**
 * The function `notOnlyWhitespace` is a custom validator in TypeScript that checks if a form control
 * value contains only whitespace characters.
 **/
export function notOnlyWhitespace(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { notOnlyWhitespace: true } : null;
  };
}
