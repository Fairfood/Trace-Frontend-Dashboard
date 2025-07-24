/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { MappingTableComponent } from './mapping-table.component';
import { DynamicTemplateUploadService } from '../dynamic-template-upload.service';
import { DynamicTemplateStore } from '../dynamic-template-upload-store.service';
import { MapColumnNamePipe } from './mapping-table.pipe';

export const mockSchema = [
  {
    id: 'first_name',
    name: 'first_name',
    required: true,
    field_type: 'str',
    selected: false,
    columnIndex: -1,
    columnName: '',
    label: 'First Name',
  },
  {
    id: 'last_name',
    name: 'last_name',
    required: true,
    field_type: 'str',
    selected: false,
    columnIndex: -1,
    columnName: '',
    label: 'Last Name',
  },
  {
    id: 'test_name',
    name: 'test_name',
    required: true,
    field_type: 'str',
    selected: false,
    columnIndex: 1,
    columnName: '',
    label: 'Test Name',
  },
];

describe('MappingTableComponent', () => {
  let component: MappingTableComponent;
  let fixture: ComponentFixture<MappingTableComponent>;
  let mockDynamicTemplateUploadService: jasmine.SpyObj<DynamicTemplateUploadService>;
  let mockDynamicTemplateStore: jasmine.SpyObj<DynamicTemplateStore>;
  let templatePreview$: Observable<any>;
  let schemaArray$: Observable<any>;

  beforeEach(async () => {
    mockDynamicTemplateUploadService = jasmine.createSpyObj(
      'DynamicTemplateUploadService',
      ['updateRowIndex$']
    );
    mockDynamicTemplateStore = jasmine.createSpyObj('DynamicTemplateStore', [
      'updateStateProp',
    ]);
    await TestBed.configureTestingModule({
      imports: [MappingTableComponent, MapColumnNamePipe],
      providers: [
        {
          provide: DynamicTemplateUploadService,
          useValue: mockDynamicTemplateUploadService,
        },
        { provide: DynamicTemplateStore, useValue: mockDynamicTemplateStore },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingTableComponent);
    component = fixture.componentInstance;
    templatePreview$ = of([{ column1: 'value1', column2: 'value2' }]);
    schemaArray$ = of([
      { id: '1', label: 'Label 1', columnIndex: -1, selected: false },
    ]);
    mockDynamicTemplateStore.templatePreview$ = templatePreview$;
    mockDynamicTemplateStore.schemaArray$ = schemaArray$;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateTableData and initialize dropdownMasterData$', () => {
    spyOn(component, 'updateTableData');

    component.ngOnInit();

    expect(component.updateTableData).toHaveBeenCalled();

    component.dropdownMasterData$.subscribe(data => {
      expect(data.length).toBe(1); // Assuming only one item meets the criteria
      expect(data[0].id).toBe('1'); // Assuming the second item meets the criteria
      expect(data[0].name).toBe('Label 1'); // Assuming the second item meets the criteria and not required
    });
  });

  it('should set displayedColumns and dataRows based on titleRow', () => {
    const titleRow = 0;
    const allData = [
      ['column1', 'column2'],
      ['data1', 'data2'],
      ['data3', 'data4'],
    ];
    component.allData = allData;

    component.setTableData(titleRow);

    expect(component.displayedColumns).toEqual(['column1', 'column2']);
    expect(component.dataRows).toEqual([
      ['data1', 'data2'],
      ['data3', 'data4'],
    ]);
  });

  describe('checkIfMapped', () => {
    it('should return the index of the mapped column', () => {
      component.schemaData = mockSchema;

      const index = component.checkIfMapped(1);

      expect(index).toEqual(2);
    });

    it('should return -1 if the column is not mapped', () => {
      component.schemaData = mockSchema;

      const index = component.checkIfMapped(0);

      expect(index).toEqual(-1);
    });

    it('should return -1 if the column is not mapped', () => {
      component.schemaData = mockSchema;

      const index = component.checkIfMapped(2);

      expect(index).toEqual(-1);
    });
  });

  describe('mapFields', () => {
    it('should unselect and reset columnIndex if column is already mapped', () => {
      spyOn(component, 'updateSchemaValue');
      spyOn(component, 'checkIfMapped').and.returnValue(1);
      const item = {
        id: 'test_name',
        name: 'test_name',
        required: true,
        field_type: 'str',
        selected: true,
        columnIndex: 1,
        columnName: '',
        label: 'Test Name',
      };

      component.schemaData = mockSchema;

      component.mapFields(item, 1);

      expect(component.updateSchemaValue).toHaveBeenCalledWith(
        mockSchema,
        'test_name',
        1
      );
    });

    it('should update schema array if column is not already mapped', () => {
      spyOn(component, 'updateSchemaValue');
      spyOn(component, 'checkIfMapped').and.returnValue(-1);
      const item = {
        id: 'last_name',
        name: 'last_name',
        required: true,
        field_type: 'str',
        selected: false,
        columnIndex: -1,
        columnName: '',
        label: 'Last Name',
      };
      const index = 2;

      component.schemaData = mockSchema;

      component.mapFields(item, index);

      expect(component.updateSchemaValue).toHaveBeenCalledWith(
        mockSchema,
        'last_name',
        index
      );
    });
  });

  it('should update schema array with provided id and updateIndex', () => {
    const id = '2';
    const updateIndex = 1;
    const data = [
      { id: '1', selected: false, columnIndex: -1, columnName: '' },
      { id: '2', selected: false, columnIndex: -1, columnName: '' },
      { id: '3', selected: false, columnIndex: -1, columnName: '' },
    ];

    component.updateSchemaValue(data, id, updateIndex);

    expect(data[1].selected).toBe(true);
    expect(data[1].columnIndex).toBe(updateIndex);
    expect(data[1].columnName).toBe(component.displayedColumns[updateIndex]);
    expect(mockDynamicTemplateStore.updateStateProp).toHaveBeenCalledWith(
      'schemaFields',
      data
    );
  });

  describe('clearDropdown', () => {
    it('should clear mapped column and update schema array if dropdown is cleared', () => {
      const clear = true;
      const j = 1;
      const schemaData = [
        { id: '1', selected: false, columnIndex: -1 },
        { id: '2', selected: true, columnIndex: 1 },
        { id: '3', selected: false, columnIndex: -1 },
      ];
      component.schemaData = schemaData;

      component.clearDropdown(clear, j);

      expect(schemaData[1].selected).toBe(false);
      expect(schemaData[1].columnIndex).toBe(-1);
      expect(mockDynamicTemplateStore.updateStateProp).toHaveBeenCalledWith(
        'schemaFields',
        schemaData
      );
    });

    it('should not update schema array if dropdown is not cleared', () => {
      const clear = false;
      const j = 1;
      const schemaData = [
        { id: '1', selected: false, columnIndex: -1 },
        { id: '2', selected: true, columnIndex: 1 },
        { id: '3', selected: false, columnIndex: -1 },
      ];
      component.schemaData = schemaData;

      component.clearDropdown(clear, j);

      expect(schemaData[1].selected).toBe(true);
      expect(schemaData[1].columnIndex).toBe(1);
      expect(mockDynamicTemplateStore.updateStateProp).not.toHaveBeenCalled();
    });
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    const sub = new Subscription();
    spyOn(sub, 'unsubscribe');
    component.pageApis.push(sub);
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should track items by index', () => {
    const index = 0;
    expect(component.trackByFn(index)).toEqual(0);
  });

  it('should subscribe to updateRowIndex$ observable and update table data', () => {
    spyOn(component, 'setTableData');
    const updateRowIndexData = { title: 2 };
    const updateRowIndex$ = new BehaviorSubject(updateRowIndexData);
    const expectedTitleRow = updateRowIndexData.title - 1;
    mockDynamicTemplateUploadService.updateRowIndex$ = updateRowIndex$;

    component.initSub();

    // Simulate the emission of updateRowIndex$ observable
    updateRowIndex$.subscribe(() => {
      expect(component.setTableData).toHaveBeenCalledWith(expectedTitleRow);
    });
  });
});
