import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectionLabelComponent } from './connection-label.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { GlobalStoreService } from 'src/app/shared/store';
import { ConnectionLabelService } from './connection-label.service';
import { UtilService } from 'src/app/shared/service';
import { of } from 'rxjs';

describe('ConnectionLabelComponent', () => {
  let component: ConnectionLabelComponent;
  let fixture: ComponentFixture<ConnectionLabelComponent>;
  let dialogSpy: jasmine.Spy;
  // Define mock services
  const mockGlobalStoreService = {
    supplychainData$: of([]),
  };

  const mockConnectionLabelService = {
    listConnectionLabels: () => of({ count: 0, results: [] }),
    createConnectionLabel: () => of({}),
    updateConnectionLabel: () => of({}),
    removeConnectionLabel: () => of({}),
  };

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
    await TestBed.configureTestingModule({
      imports: [
        ConnectionLabelComponent,
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: GlobalStoreService, useValue: mockGlobalStoreService },
        {
          provide: ConnectionLabelService,
          useValue: mockConnectionLabelService,
        },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle add screen visibility', () => {
    component.addScreenVisible = false;
    component.toggleAddScreen();
    expect(component.addScreenVisible).toBe(true);
    component.toggleAddScreen();
    expect(component.addScreenVisible).toBe(false);
  });

  it('should set supply chain', () => {
    const selectedData = [
      { id: 1, name: 'Supply Chain 1' },
      { id: 2, name: 'Supply Chain 2' },
    ];
    component.setSupplychain(selectedData);
    expect(component.labelForm.value.supplyChain).toEqual(selectedData);
    component.setSupplychain('');
    expect(component.labelForm.value.supplyChain).toEqual('');
  });

  it('should unsubscribe from subscriptions onDestroy', () => {
    spyOn(component.pageApis[0], 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.pageApis[0].unsubscribe).toHaveBeenCalled();
  });

  it('should start edit mode when editStarted is called', () => {
    const mockItem = {
      id: 1,
      name: 'Test Label',
      supply_chains: [
        { id: 1, name: 'Supply Chain 1' },
        { id: 2, name: 'Supply Chain 2' },
      ],
    };

    // Call the editStarted method with the mock item
    component.editStarted(mockItem);

    // Check if isEdit is set to true
    expect(component.isEdit).toBe(true);

    // Check if currentlyEditing is assigned the correct value
    expect(component.currentlyEditing).toEqual(mockItem);

    // Check if labelForm is patched with the correct values
    expect(component.labelForm.value).toEqual({
      id: mockItem.id,
      label: mockItem.name,
      supplyChain: mockItem.supply_chains,
    });

    // Check if addScreenVisible is set to true
    expect(component.addScreenVisible).toBe(true);
  });

  it('should handle paginator event and load data', () => {
    // Mock data for paginator event
    const mockData = {
      limit: 10,
      offset: 20,
    };

    // Spy on the getConnectionLabels method
    spyOn(component, 'getConnectionLabels').and.stub();

    // Call the paginatorEvent method with mock data
    component.paginatorEvent(mockData);

    // Check if limit and offset are correctly assigned
    expect(component.limit).toEqual(mockData.limit);
    expect(component.offset).toEqual(mockData.offset);

    // Check if dataLoading is set to true
    expect(component.dataLoading).toBe(true);

    // Check if getConnectionLabels is called
    expect(component.getConnectionLabels).toHaveBeenCalled();
  });

  it('should handle error case', () => {
    // Mock data for paginator event
    const mockData: any = null;
    // Spy on the getConnectionLabels method
    spyOn(component, 'getConnectionLabels').and.stub();

    // Call the paginatorEvent method with mock data
    component.paginatorEvent(mockData);

    // Check if dataLoading is set to true
    expect(component.dataLoading).toBe(false);

    // Check if getConnectionLabels is called
    expect(component.getConnectionLabels).not.toHaveBeenCalled();
  });

  it('should set supply chain in label form', () => {
    // Spy on labelForm's patchValue method
    const patchValueSpy = spyOn(component.labelForm, 'patchValue').and.stub();

    // Mock non-string and string data
    const mockNonStringData = { id: 1, name: 'Supply Chain 1' };
    const mockStringData = 'Some string';

    // Call the setSupplychain method with non-string data
    component.setSupplychain(mockNonStringData);

    // Check if patchValue is called with the non-string data
    expect(patchValueSpy).toHaveBeenCalledWith({
      supplyChain: mockNonStringData,
    });

    // Call the setSupplychain method with string data
    component.setSupplychain(mockStringData);

    // Check if patchValue is called with an empty string for string input
    expect(patchValueSpy).toHaveBeenCalledWith({
      supplyChain: '',
    });
  });
});

class UtilServiceStub {
  customSnackBar(message: string, actionType: string) {
    console.log(
      `Custom snackbar called with message: ${message}, actionType: ${actionType}`
    );
  }
}
