import { TestBed } from '@angular/core/testing';
import { DynamicTemplateStore } from './dynamic-template-upload-store.service';

describe('DynamicTemplateStore', () => {
  let service: DynamicTemplateStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicTemplateStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to verification correctly', () => {
    spyOn(service, 'getCurrentTabs').and.returnValue([
      { id: 'verification', active: false },
    ]);

    spyOn(service, 'updateStateProp');
    service.goToVerification();

    expect(service.updateStateProp).toHaveBeenCalledTimes(2);
  });

  it('should navigate to summary correctly', () => {
    spyOn(service, 'getCurrentTabs').and.returnValue([
      { id: 'summary', active: false },
    ]);
    spyOn(service, 'updateStateProp');
    service.goToSummary();
    expect(service.updateStateProp).toHaveBeenCalledTimes(2);
  });

  it('should navigate to link fields correctly', () => {
    spyOn(service, 'updateStateProp');
    spyOn(service, 'getCurrentTabs').and.returnValue([]);
    service.goToLinkFields();
    expect(service.updateStateProp).toHaveBeenCalledWith(
      'tabGroup',
      jasmine.any(Array)
    );
    expect(service.updateStateProp).toHaveBeenCalledWith(
      'currentStep',
      'linkFields'
    );
    expect(service.updateStateProp).toHaveBeenCalledWith(
      'selectedTemplateData',
      null
    );
  });

  it('should handle validation API success correctly', () => {
    spyOn(service, 'updateStateProp');
    const res: any = { data: [], errors: [], data_count: 5 };
    service.validationApiSuccess(res);
    expect(service.updateStateProp).toHaveBeenCalledWith('dataRows', res.data);
    expect(service.updateStateProp).toHaveBeenCalledWith(
      'errorRows',
      res.errors
    );
    expect(service.updateStateProp).toHaveBeenCalledWith(
      'dataCount',
      res.data_count
    );
  });
});
