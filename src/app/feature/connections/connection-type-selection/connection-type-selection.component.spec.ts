import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ListViewService } from '../list-view/list-view.service';
import { ConnectionTypeSelectionComponent } from './connection-type-selection.component';

describe('ConnectionTypeSelectionComponent', () => {
  let component: ConnectionTypeSelectionComponent;
  let fixture: ComponentFixture<ConnectionTypeSelectionComponent>;
  let mockDialogRef: jasmine.SpyObj<
    MatDialogRef<ConnectionTypeSelectionComponent>
  >;
  const mockSpy = jasmine.createSpyObj('TranslateService', [
    'get',
    'onLangChange',
    'instant',
  ]);
  let mockData: any;
  let mockListViewService: jasmine.SpyObj<ListViewService>;

  beforeEach(waitForAsync(() => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockData = {};
    mockListViewService = jasmine.createSpyObj('ListViewService', [
      'addCompanyPopup',
      'farmerConnection',
      'addNewConnection',
    ]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatRadioModule,
        MatIconModule,
        ReactiveFormsModule,
        FormsModule,
        ConnectionTypeSelectionComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: ListViewService, useValue: mockListViewService },
        { provide: TranslateService, useValue: mockSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionTypeSelectionComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog on close()', () => {
    // Act
    component.close();

    // Assert
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call addSuppliers() when newConnection is called for tier 1', () => {
    // Arrange
    spyOn(component, 'constructData').and.callThrough(); // Add this line
    spyOn(component, 'addSuppliers'); // Update this line

    mockData.tier = 1;

    // Act
    component.newConnection();

    // Assert
    expect(component.constructData).toHaveBeenCalled();
    expect(component.addSuppliers).toHaveBeenCalled();
  });

  it('should call myCompany() when newConnection is called for tier other than 1', () => {
    // Arrange
    spyOn(component, 'constructData').and.callThrough();
    spyOn(component, 'myCompany');
    mockData.tier = 2;

    // Act
    component.newConnection();

    // Assert
    expect(component.constructData).toHaveBeenCalled();
    expect(component.myCompany).toHaveBeenCalled();
  });

  it('should call addSuppliers() with the correct parameters', () => {
    // Arrange
    mockData.tier = 1;
    mockData.id = 1;
    mockData.name = 'Test Company';
    component.connectionType.setValue('1');

    // Act
    component.addSuppliers();

    // Assert
    expect(mockListViewService.addCompanyPopup).toHaveBeenCalledWith({
      connectionType: 'supplier',
      id: 1,
      full_name: 'Test Company',
    });
  });

  it('should call farmerConnection() with the correct parameters', () => {
    // Arrange
    mockData.tier = 1;
    mockData.id = 1;
    mockData.name = 'Test Company';
    component.connectionType.setValue('2');

    // Act
    component.addSuppliers();

    // Assert
    expect(mockListViewService.farmerConnection).toHaveBeenCalledWith({
      id: 1,
      full_name: 'Test Company',
    });
  });

  it('should call addNewConnection() when myCompany() is called for connectionType 1', () => {
    // Arrange
    component.connectionType.setValue('1');

    // Act
    component.myCompany();

    // Assert
    expect(mockListViewService.addNewConnection).toHaveBeenCalled();
  });

  it('should call farmerConnection() when myCompany() is called for connectionType 2', () => {
    // Arrange
    component.connectionType.setValue('2');

    // Act
    component.myCompany();

    // Assert
    expect(mockListViewService.farmerConnection).toHaveBeenCalled();
  });
});
