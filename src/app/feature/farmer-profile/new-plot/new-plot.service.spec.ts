import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { NewPlotService } from './new-plot.service';
import { UtilService } from 'src/app/shared/service';
import { PLOT_TYPES } from '../farmer-profile.config';

describe('NewPlotService', () => {
  let service: NewPlotService;

  beforeEach(() => {
    const translateServiceMock = {
      currentLang: '',
      get: () => of(''),
      instant: (key: string) => key,
    };
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatSnackBarModule, HttpClientModule],
      providers: [
        NewPlotService,
        UtilService,
        FormBuilder,
        {
          provide: TranslateService,
          useValue: translateServiceMock,
        },
      ],
    });

    service = TestBed.inject(NewPlotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a valid form group', () => {
    const formGroup = service.getPlotForm();
    expect(formGroup).toBeTruthy();
  });

  it('should construct API payload with valid data', () => {
    const formValue = {
      plot: { totalArea: 100, cropType: 'Wheat' },
      addressDetails: {
        plotName: 'Test Plot',
        city: 'Test City',
        country: 'Test Country',
        latitude: 20,
        longitude: 30,
        province: 'Test Province',
        zipcode: '12345',
        street: 'Test Street',
        geoJson: '{"type":"Point","coordinates":[30,20]}',
        plotType: PLOT_TYPES[0].id,
      },
      farmer: 'Test Farmer',
    };

    const apiPayload = service.constructApiPayload(formValue);

    expect(apiPayload.error).toBeFalsy();
    expect(apiPayload.reqObj).toBeTruthy();
  });

  it('should construct API payload with valid data type: polygon', () => {
    const formValue = {
      plot: { totalArea: 100, cropType: 'Wheat' },
      addressDetails: {
        plotName: 'Test Plot',
        city: 'Test City',
        country: 'Test Country',
        latitude: 20,
        longitude: 30,
        province: 'Test Province',
        zipcode: '12345',
        street: 'Test Street',
        geoJson: '{"type":"Point","coordinates":[30,20]}',
        plotType: PLOT_TYPES[2].id,
      },
      farmer: 'Test Farmer',
    };

    const apiPayload = service.constructApiPayload(formValue);
    expect(apiPayload.reqObj.latitude).toBe(0);
    expect(apiPayload.reqObj.longitude).toBe(0);
  });

  it('should show error message', () => {
    spyOn(service['utils'], 'customSnackBar');

    service.showErrorMessage('Test error message');

    expect(service['utils'].customSnackBar).toHaveBeenCalledWith(
      'Test error message',
      ACTION_TYPE.FAILED
    );
  });
});
