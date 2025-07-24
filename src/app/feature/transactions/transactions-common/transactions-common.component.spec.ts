import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TransactionsCommonComponent } from './transactions-common.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TransactionsService } from '../transactions.service';
import { UtilService, RouterService } from 'src/app/shared/service';
import { GlobalStoreService } from 'src/app/shared/store';
import { of } from 'rxjs';
import { TRANSACTION_COLUMNS } from '../transactions.constants';
import { ArchiveConfirmationPopupComponent } from 'src/app/shared/components/archive-confirmation-popup';
import { FilterParams } from '../transactions.model';

describe('TransactionsCommonComponent', () => {
  let component: TransactionsCommonComponent;
  let fixture: ComponentFixture<TransactionsCommonComponent>;
  let transactionsServiceSpy: jasmine.SpyObj<TransactionsService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    const spy = jasmine.createSpyObj('TransactionsService', [
      'loadTeamMembers',
      'getTransactionHistory',
      'memberType',
      'getStockactionsList',
      'configureTableData ',
    ]);

    const spyRouter = jasmine.createSpyObj('RouterService', ['navigateArray']);
    const spyUtil = jasmine.createSpyObj('UtilService', ['customSnackBar']);
    const spyTranslate = jasmine.createSpyObj('TranslateService', ['instant']);
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        TransactionsCommonComponent,
        HttpClientModule,
        MatSnackBarModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
        { provide: MatDialog, useValue: mockDialog },
        UtilService,
        RouterService,
        GlobalStoreService,
        { provide: TransactionsService, useValue: spy },
        { provide: RouterService, useValue: spyRouter },
        {
          provide: UtilService,
          useValue: spyUtil,
        },
        { provide: TranslateService, useValue: spyTranslate },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    transactionsServiceSpy = TestBed.inject(
      TransactionsService
    ) as jasmine.SpyObj<TransactionsService>;
    transactionsServiceSpy.loadTeamMembers.and.returnValue(
      of({ results: [], count: 0 })
    );
    transactionsServiceSpy.getTransactionHistory.and.returnValue(
      of({ count: 0, results: [] })
    );
    fixture = TestBed.createComponent(TransactionsCommonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reset filter values with the provided searchString', () => {
    // Arrange
    const searchString = 'exampleSearch';

    // Act
    component.resetFilter(searchString);

    // Assert
    expect(component.appliedFilterValues.selectedProduct).toBe('');
    expect(component.appliedFilterValues.selectedCompany).toBe('');
    expect(component.appliedFilterValues.searchString).toBe(searchString);
    expect(component.appliedFilterValues.transactionType).toBe('');
    expect(component.appliedFilterValues.limit).toBe(10);
    expect(component.appliedFilterValues.offset).toBe(0);
    expect(component.appliedFilterValues.orderBy).toBe('desc');
    expect(component.appliedFilterValues.sortBy).toBe('date');
    expect(component.appliedFilterValues.quantityFrom).toBe('');
    expect(component.appliedFilterValues.quantityTo).toBe('');
    expect(component.appliedFilterValues.dateOn).toBe('');
    expect(component.appliedFilterValues.dateTo).toBe('');
    expect(component.appliedFilterValues.dateFrom).toBe('');
    expect(component.appliedFilterValues.creator).toBe('');
  });

  it('should reset filter values without a searchString', () => {
    // Act
    component.resetFilter();

    // Assert
    // Similar assertions as above, but check that searchString is an empty string
    expect(component.appliedFilterValues.searchString).toBe('');
  });

  it('should reset stock action filter values with the provided searchString', () => {
    // Arrange
    const searchString = 'exampleSearch';

    // Act
    component.resetStockActionFilterValues(searchString);

    // Assert
    expect(component.stockActionFilterValues.selectedSourceProduct).toBe('');
    expect(component.stockActionFilterValues.selectedDestinationProduct).toBe(
      ''
    );
    expect(component.stockActionFilterValues.searchString).toBe(searchString);
    expect(component.stockActionFilterValues.limit).toBe(10);
    expect(component.stockActionFilterValues.offset).toBe(0);
    expect(component.stockActionFilterValues.orderBy).toBe('desc');
    expect(component.stockActionFilterValues.sortBy).toBe('date');
    expect(component.stockActionFilterValues.quantityFrom).toBe('');
    expect(component.stockActionFilterValues.quantityTo).toBe('');
    expect(component.stockActionFilterValues.dateOn).toBe('');
    expect(component.stockActionFilterValues.dateTo).toBe('');
    expect(component.stockActionFilterValues.dateFrom).toBe('');
    expect(component.stockActionFilterValues.creator).toBe('');
  });

  it('should reset stock action filter values without a searchString', () => {
    // Act
    component.resetStockActionFilterValues();

    // Assert
    // Similar assertions as above, but check that searchString is an empty string
    expect(component.stockActionFilterValues.searchString).toBe('');
  });

  it('should update column visibility based on the provided item', () => {
    // Arrange
    const item = { name: 'exampleColumn', visible: true };
    component.displayedColumns = TRANSACTION_COLUMNS.map(column => ({
      ...column,
    }));

    // Act
    component.updateColumns(item);

    // Assert
    expect(component.displayedColumns.length).toBe(TRANSACTION_COLUMNS.length);
  });

  it('should not update column visibility if the provided item is not found in displayedColumns', () => {
    // Arrange
    const item = { name: 'nonExistingColumn', visible: true };
    component.displayedColumns = TRANSACTION_COLUMNS.map(column => ({
      ...column,
    }));

    // Act
    component.updateColumns(item);

    // Assert
    expect(component.displayedColumns.length).toBe(TRANSACTION_COLUMNS.length);
  });

  it('should clear page selection', () => {
    component.allSelected = true;
    component.selectedItems = ['item1', 'item2'];
    component.selectedOption = 'option';
    component.entireListSelected = true;

    component.clearPageSelection();

    expect(component.allSelected).toBeFalse();
    expect(component.selectedItems.length).toBe(0);
    expect(component.selectedOption).toBe('');
    expect(component.entireListSelected).toBeFalse();
  });

  it('should modify selectedItems array based on event and item', () => {
    const event = { checked: true };
    const item = { itemId: 'item1' };

    component.changeSelect(event, item);
    expect(component.selectedItems).toContain(item.itemId);

    component.changeSelect(event, item);
    expect(
      component.selectedItems.filter(
        selectedItem => selectedItem === item.itemId
      ).length
    ).toBe(1);

    event.checked = false;
    component.changeSelect(event, item);
    expect(component.selectedItems).not.toContain(item.itemId);

    component.entireListSelected = true;
    component.changeSelect(event, item);
    expect(component.selectedItems).toContain(item.itemId);
  });

  it('should modify selectedItems and entireListSelected based on event value', () => {
    const dataSource = [
      { itemId: 'item1' },
      { itemId: 'item2' },
      { itemId: 'item3' },
    ];
    component.dataSource = dataSource;

    const pageEvent = { value: 'page' };
    component.radioButtonChanged(pageEvent);

    expect(component.entireListSelected).toBeFalse();
    expect(component.selectedItems).toEqual(dataSource.map(obj => obj.itemId));

    const allEvent = { value: 'all' };
    component.radioButtonChanged(allEvent);

    expect(component.entireListSelected).toBeTrue();
    expect(component.selectedItems.length).toBe(0);
  });

  it('should set all items to selected when entireListSelected is true', () => {
    const mockItem1 = { itemId: 1, selected: false };
    const mockItem2 = { itemId: 2, selected: false };
    component.dataSource = [mockItem1, mockItem2];
    component.entireListSelected = true;
    component.selectedItems = []; // Assuming no items are selected initially

    component.setSelecteItems();

    expect(mockItem1.selected).toBe(true);
    expect(mockItem2.selected).toBe(true);
  });

  it('should toggle selected property based on selectedItems when entireListSelected is false', () => {
    const mockItem1 = { itemId: 1, selected: false };
    const mockItem2 = { itemId: 2, selected: false };
    component.dataSource = [mockItem1, mockItem2];
    component.entireListSelected = false;
    component.selectedItems = [1];

    component.setSelecteItems();

    expect(mockItem1.selected).toBe(true);
    expect(mockItem2.selected).toBe(false);
  });

  it('should handle mixed selection correctly', () => {
    const mockItem1 = { itemId: 1, selected: false };
    const mockItem2 = { itemId: 2, selected: false };
    component.dataSource = [mockItem1, mockItem2];
    component.entireListSelected = false;
    component.selectedItems = [1, 2];

    component.setSelecteItems();

    expect(mockItem1.selected).toBe(true);
    expect(mockItem2.selected).toBe(true);
  });
});
