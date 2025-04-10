/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilService } from 'src/app/shared/service';
import { PLOT_TYPES } from '../farmer-profile.config';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

@Injectable({
  providedIn: 'root',
})
export class NewPlotService {
  constructor(private fb: FormBuilder, private utils: UtilService) {}

  getPlotForm(): FormGroup {
    return this.fb.group({
      addressDetails: this.fb.group({
        plotType: ['', Validators.required],
        plotName: ['', [Validators.required, Validators.maxLength(20)]],
        street: [''],
        city: [''],
        province: ['', Validators.required],
        country: ['', Validators.required],
        latitude: [''],
        longitude: [''],
        zipcode: [''],
        geoJson: [''],
      }),
      plot: this.fb.group({
        cropType: ['', Validators.required],
        totalArea: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.maxLength(6),
          ],
        ],
      }),
      farmer: [''],
    });
  }

  /* istanbul ignore next */
  setFormValidator(form: any, controlName: string): void {
    setTimeout(() => {
      form.get(controlName).setValidators(Validators.required);
      form.get(controlName).updateValueAndValidity();
    }, 200);
  }

  /* istanbul ignore next */
  setLatitudeValidators(form: any, controlName: string): void {
    setTimeout(() => {
      form
        .get(controlName)
        .setValidators([
          Validators.pattern(/^[-+]?[0-9]{1,7}(.[0-9]+)?$/),
          Validators.min(-90),
          Validators.max(90),
        ]);
      form.get(controlName).updateValueAndValidity();
    }, 200);
  }

  setlongitudeValidators(form: any, controlName: string): void {
    setTimeout(() => {
      form
        .get(controlName)
        .setValidators([
          Validators.pattern(/^[-+]?[0-9]{1,7}(.[0-9]+)?$/),
          Validators.min(-180),
          Validators.max(180),
        ]);
      form.get(controlName).updateValueAndValidity();
    }, 200);
  }

  /* istanbul ignore next */
  clearValidators(form: any, controlName: string): void {
    form.get(controlName).clearValidators();
    form.get(controlName).updateValueAndValidity();
  }

  constructApiPayload(formValue: any): any {
    const { plot, addressDetails, farmer } = formValue;
    const {
      plotName,
      city,
      country,
      latitude,
      longitude,
      province,
      zipcode,
      street,
      geoJson,
      plotType,
    } = addressDetails;
    const { totalArea, cropType } = plot;
    const reqObj: any = {
      house_name: '',
      street,
      city,
      latitude,
      longitude,
      country,
      province,
      zipcode,
      name: plotName,
      location_type: plotType,
      total_plot_area: totalArea,
      crop_types: cropType,
      farmer,
    };
    if (plotType === PLOT_TYPES[2].id) {
      try {
        const parsedGeoJson = JSON.parse(geoJson);
        reqObj.geo_json = JSON.stringify(parsedGeoJson);
      } catch (error) {
        this.utils.customSnackBar('Invalid GeoJson', ACTION_TYPE.FAILED);
        return {
          error: true,
          reqObj: null,
        };
      }
      reqObj.latitude = 0;
      reqObj.longitude = 0;
      reqObj.country = country;
      reqObj.province = province;
    } else {
      reqObj.geo_json = '';
    }

    return {
      error: false,
      reqObj,
    };
  }

  showErrorMessage(message: string): void {
    this.utils.customSnackBar(message, ACTION_TYPE.FAILED);
  }
}
