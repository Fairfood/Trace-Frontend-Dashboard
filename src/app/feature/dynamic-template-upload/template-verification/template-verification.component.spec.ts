/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import { TemplateVerificationComponent } from './';
import { GlobalStoreService } from 'src/app/shared/store';

describe('TemplateVerificationComponent', () => {
  let component: TemplateVerificationComponent;
  let fixture: ComponentFixture<TemplateVerificationComponent>;
  let serviceSpy: jasmine.SpyObj<DynamicTemplateUploadService>;
  let storeSpy: jasmine.SpyObj<DynamicTemplateStore>;
  let mockGlobalStore: Partial<GlobalStoreService>;

  beforeEach(async () => {
    mockGlobalStore = {
      countryList$: of([
        { id: '1', name: 'India' },
        { id: '2', name: 'Netherlands' },
      ]),
    };
    serviceSpy = jasmine.createSpyObj('DynamicTemplateUploadService', [
      'validateRows',
    ]);

    storeSpy = jasmine.createSpyObj('DynamicTemplateStore', [
      'updateStateProp',
      'removeNewUplod',
      'uploadFileData$',
      'templateData$',
      'errorRows$',
      'dataRows$',
      'goToSummary',
      'goToLinkFields',
      'currentErrorState',
      'getCurrentTabs',
      'currentDataState',
      'existingErrorCount',
    ]);
    storeSpy.uploadFileData$ = new Subject();
    storeSpy.templateData$ = new Subject();
    storeSpy.errorRows$ = new BehaviorSubject([]);
    storeSpy.dataRows$ = new BehaviorSubject([]);

    await TestBed.configureTestingModule({
      imports: [TemplateVerificationComponent],
      providers: [
        {
          provide: DynamicTemplateUploadService,
          useValue: serviceSpy,
        },
        {
          provide: DynamicTemplateStore,
          useValue: storeSpy,
        },
        {
          provide: GlobalStoreService,
          useValue: mockGlobalStore,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateVerificationComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call validateRows on ngOnInit', () => {
    spyOn(component, 'initSubscriptions');
    spyOn(component, 'getCountries');
    component.ngOnInit();
    expect(component.initSubscriptions).toHaveBeenCalled();
    expect(component.getCountries).toHaveBeenCalled();
  });

  describe('initSubscriptions', () => {
    it('should subscribe to templateData$ and create columns when data is received', () => {
      const templateData: any = { field_details: [] };
      const mockSub = new BehaviorSubject(templateData);
      storeSpy.uploadFileData$ = mockSub.asObservable();

      spyOn(component, 'createColumns');

      component.initSubscriptions();

      expect(component.createColumns).toHaveBeenCalledWith(
        templateData.field_details
      );
      expect(component.nextButton.disabled).toBeTruthy();
    });

    it('should subscribe to uploadFileData$ and set templateId and create columns when data is received', () => {
      const templateData: any = {
        latest_upload: { id: '1' },
        field_details: [],
      };
      const mockSub = new BehaviorSubject(templateData);
      storeSpy.uploadFileData$ = mockSub.asObservable();

      const mock = new BehaviorSubject([
        {
          data: 1,
        },
      ]);
      storeSpy.dataRows$ = mock.asObservable();

      spyOn(component, 'createColumns').and.callThrough();

      component.initSubscriptions();
      expect(component.nextButton.disabled).toBeFalsy();

      expect(component.templateId).toEqual('1');
      expect(component.createColumns).toHaveBeenCalledWith([]);
    });
  });

  describe('createColumns', () => {
    it('should create columns', () => {
      component.createColumns([]);
      expect(component.displayedColumns).toEqual([]);
      expect(component.loading).toBeFalsy();
    });
    it('should create columns', () => {
      component.createColumns([
        { column_name: 'Test 1', name: 'test_2', type: '213' },
        { column_name: 'Test 2', name: 'test_1', type: '214' },
      ]);
      expect(component.displayedColumns).toEqual([
        {
          name: 'Test 1',
          class: 'large-column',
          sortKey: 'test_2',
          type: '213',
        },
        {
          name: 'Test 2',
          class: 'large-column',
          sortKey: 'test_1',
          type: '214',
        },
      ]);
      expect(component.loading).toBeFalsy();
    });
  });

  describe('buttonAction', () => {
    it('should call store.goToSummary', () => {
      component.buttonAction('next');
      expect(storeSpy.goToSummary).toHaveBeenCalled();
    });

    it('should not call store.goToSummary when prev and tabs length 3', () => {
      storeSpy.getCurrentTabs.and.returnValue([1, 2, 3]);
      spyOn(component, 'removeUploadedFile');
      component.buttonAction('prev');
      expect(storeSpy.goToSummary).not.toHaveBeenCalled();
      expect(component.removeUploadedFile).toHaveBeenCalled();
    });

    it('should not call store.goToSummary when prev and tabs length 4 ', () => {
      storeSpy.getCurrentTabs.and.returnValue([1, 2, 3, 4]);
      component.buttonAction('prev');
      expect(storeSpy.goToLinkFields).toHaveBeenCalled();
    });
  });

  it('should call backendValidation', () => {
    // arrange
    spyOn(component, 'backendValidation');
    // act
    component.validateColumns({ index: 1 });
    // assert
    expect(component.backendValidation).toHaveBeenCalledWith({ index: 1 });
    expect(component.validatingIndex).toEqual(1);
  });

  describe('updateTableData', () => {
    it('should update table data', () => {
      storeSpy.currentErrorState.and.returnValue([]);
      component.updateTableData(
        {
          data: [
            {
              item: 1,
            },
          ],
          errors: [],
          data_count: 1,
        },
        1
      );

      expect(storeSpy.updateStateProp).toHaveBeenCalledTimes(4);
    });

    it('should do it like this when an error state exist and BE throws error on the same row', () => {
      storeSpy.currentErrorState.and.returnValue([
        {
          index: 1,
        },
      ]);
      component.updateTableData(
        {
          data: [],
          errors: [
            {
              index: 1,
            },
          ],
          data_count: 0,
        },
        1
      );

      expect(storeSpy.updateStateProp).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteRow', () => {
    it('should delete row', () => {
      storeSpy.currentErrorState.and.returnValue([
        {
          index: 1,
        },
        {
          index: 2,
        },
      ]);
      storeSpy.existingErrorCount.and.returnValue(2);

      component.deleteRow(1);
      expect(storeSpy.updateStateProp).toHaveBeenCalledWith('errorRows', [
        {
          index: 1,
        },
      ]);

      expect(storeSpy.updateStateProp).toHaveBeenCalledWith('errorCount', 1);
    });

    it('should delete everything', () => {
      const mockValue = [
        {
          index: 1,
        },
        {
          index: 2,
        },
      ];
      storeSpy.currentErrorState.and.returnValue(mockValue);

      storeSpy.currentDataState.and.returnValue(mockValue);

      component.deleteRow(-1);
      expect(storeSpy.updateStateProp).toHaveBeenCalledWith('errorRows', []);
      expect(storeSpy.updateStateProp).toHaveBeenCalledWith('errorCount', 0);
      expect(storeSpy.updateStateProp).toHaveBeenCalledWith(
        'dataRows',
        mockValue
      );
    });
  });

  it('should subscribe to countryList$ and update countryList when data is received', () => {
    component.countryList = [];
    component.connectionTypeList = [];
    component.getCountries();

    expect(component.countryList).toEqual([
      { id: '1', name: 'India' },
      { id: '2', name: 'Netherlands' },
    ]);

    expect(component.connectionTypeList).toEqual([
      {
        id: 'farmer',
        name: 'Farmer',
      },
      {
        id: 'collector',
        name: 'Collector',
      },
    ]);
  });

  it('should update properties and trigger backendValidation with correct parameters when dropdown value changes', () => {
    // Arrange
    const event = { id: '1', name: 'Selected Value' };
    const item: any = { index: 1, key: 'someKey' };
    const key = 'keyName';

    spyOn(component, 'backendValidation');

    // Act
    component.dropdownChanged(event, item, key);

    // Assert
    expect(component.validatingIndex).toBe(item.index);
    expect(item[key]).toBe(event.name);
    expect(component.backendValidation).toHaveBeenCalledWith(item);
  });

  it('should format date, update item, trigger backendValidation, and close menu', () => {
    // Arrange
    const event = new Date('2022-03-07');
    const item: any = { index: 1, key: 'someKey' };
    const key = 'keyName';

    spyOn(component, 'formatDate').and.returnValue('2022-03-07');
    spyOn(component, 'backendValidation');

    // Act
    component.dateFilter(event, item, key);

    // Assert
    expect(component.formatDate).toHaveBeenCalledWith(event);
    expect(item[key]).toBe('2022-03-07');
    expect(component.backendValidation).toHaveBeenCalledWith(item);
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      // Create a sample date object
      const date = new Date(2024, 2, 7); // 7th March, 2024

      // Call the formatDate function with the sample date
      const formattedDate = component.formatDate(date);

      // Assert that the formatted date matches the expected format ('YYYY-MM-DD')
      expect(formattedDate).toEqual('2024-03-07');
    });

    it('should format single digit month and day correctly', () => {
      // Create a sample date object with single digit month and day
      const date = new Date(2024, 8, 5); // 5th September, 2024

      // Call the formatDate function with the sample date
      const formattedDate = component.formatDate(date);

      // Assert that the formatted date has leading zeros for month and day
      expect(formattedDate).toEqual('2024-09-05');
    });
  });

  describe('backendValidation', () => {
    it('should call validateRows service method and update table data on successful validation', () => {
      const item = { index: 1, key1: 'value1', key2: 'value2' };
      const responseData = { updatedData: 'updatedValue' };
      serviceSpy.validateRows.and.returnValue(of(responseData));
      spyOn(component, 'updateTableData');

      component.backendValidation(item);

      expect(serviceSpy.validateRows).toHaveBeenCalledWith(
        component.templateId,
        {
          [item.index]: { key1: 'value1', key2: 'value2' },
        }
      );
      expect(component.updateTableData).toHaveBeenCalledWith(responseData, 1);
      expect(component.validatingIndex).toEqual(-1);
    });

    it('should handle error response from validateRows service method', () => {
      const item = { index: 1, key1: 'value1', key2: 'value2' };
      const errorResponse = 'Validation failed';
      serviceSpy.validateRows.and.returnValue(throwError(() => errorResponse));
      spyOn(console, 'log');

      component.backendValidation(item);

      expect(serviceSpy.validateRows).toHaveBeenCalledWith(
        component.templateId,
        {
          [item.index]: { key1: 'value1', key2: 'value2' },
        }
      );
      expect(console.log).toHaveBeenCalledWith(errorResponse);
      expect(component.validatingIndex).toEqual(-1);
    });
  });

  it('should call unsubscribe on destroy', () => {
    const mockApi = {
      unsubscribe: jasmine.createSpy('unsubscribe'),
    };
    component.pageApis = [mockApi as any];
    component.ngOnDestroy();
    expect(mockApi.unsubscribe).toHaveBeenCalled();
  });

  it('should call removeNewUplod on destroy', () => {
    component.removeUploadedFile();
    expect(storeSpy.removeNewUplod).toHaveBeenCalled();
  });
});
