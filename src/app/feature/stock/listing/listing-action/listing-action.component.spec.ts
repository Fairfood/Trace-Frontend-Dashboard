import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ListingActionComponent } from './listing-action.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  RouterService,
  StorageService,
  UtilService,
} from 'src/app/shared/service';
import { StockProcessService } from '../../process-stock/stock-process.service';
import { ListingService } from '../listing.service';
import { HttpClientModule } from '@angular/common/http';
import { ListingStoreService } from '../listing-store.service';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';

describe('ListingActionComponent', () => {
  let component: ListingActionComponent;
  let fixture: ComponentFixture<ListingActionComponent>;
  let routerService: RouterService;
  let util: UtilService;

  beforeEach(async () => {
    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ListingActionComponent, MatDialogModule, HttpClientModule],
      providers: [
        { provide: RouterService, useClass: RouterServiceStub },
        { provide: StorageService, useClass: StorageServiceStub },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: StockProcessService, useClass: StockProcessServiceStub },
        {
          provide: ListingService,
          useClass: ListingInfoServiceStub,
        },
        {
          provide: ListingStoreService,
          useClass: StoreStub,
        },
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        {
          provide: MatDialog,
          useClass: MdDialogMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingActionComponent);
    component = fixture.componentInstance;
    spyOn(component.filterChanged, 'emit');
    fixture.detectChanges();
    routerService = TestBed.inject(RouterService);
    util = TestBed.inject(UtilService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filterClicked', () => {
    it('should handle filterClicked toggleFilter is false', () => {
      // Arrange
      const initialToggleFilter = false;

      // Act
      component.filterClicked();

      // Assert
      expect(component.toggleFilter).toBe(!initialToggleFilter);
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'toggle',
        !initialToggleFilter
      );
    });
    it('should handle filterClicked toggleFilter is true', () => {
      // Arrange
      const initialToggleFilter = true;

      // Act
      component.toggleFilter = initialToggleFilter;
      component.filterClicked();

      // Assert
      expect(component.toggleFilter).toBe(!initialToggleFilter);
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'toggle',
        !initialToggleFilter
      );

      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'enableSendStock',
        false
      );

      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'stockAction',
        false
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectedStocks',
        []
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'changedBatches',
        []
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'batches',
        []
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectAll',
        false
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectingOptions',
        null
      );

      expect(component.filterChanged.emit).toHaveBeenCalled();
    });
  });

  it('should navigate to correct routes based on button type', () => {
    // Arrange
    spyOn(routerService, 'navigateArray');
    spyOn(component, 'removeStockDialog');
    spyOn(component, 'processStock');

    // Act
    component.buttonAction('remove');
    expect(component.removeStockDialog).toHaveBeenCalled();

    component.buttonAction('single');
    expect(routerService.navigateArray).toHaveBeenCalledWith([
      '/stock/receive',
    ]);

    component.buttonAction('multiple');
    expect(routerService.navigateArray).toHaveBeenCalledWith([
      '/template-upload/transactions',
    ]);

    component.buttonAction('other');
    expect(component.processStock).toHaveBeenCalledWith('other');
  });

  describe('should handle processStock', () => {
    it('send', () => {
      // Arrange
      spyOn(routerService, 'navigateArray');
      component.processStock('send');
      expect(routerService.navigateArray).toHaveBeenCalledWith([
        '/stock/stock-send',
      ]);
    });

    it('convert', () => {
      // Arrange
      spyOn(routerService, 'navigateArray');
      component.processStock('convert');
      expect(routerService.navigateArray).toHaveBeenCalledWith([
        '/stock/process-convert',
      ]);
    });

    it('merge', () => {
      // Arrange
      spyOn(routerService, 'navigateArray');
      component.processStock('merge');
      expect(routerService.navigateArray).toHaveBeenCalledWith([
        '/stock/process-merge',
      ]);
    });

    it('should log a message and do nothing when type is unrecognized', () => {
      spyOn(console, 'log');
      component.processStock('anyother');
      expect(console.log).toHaveBeenCalledWith('type', 'anyother');
      expect(console.log).toHaveBeenCalledWith('Do nothing');
    });

    it('should update summary select page items selectOptions is "page"', () => {
      // act
      spyOn(component, 'updateSummarySelectPageItems');
      component.selectOptions = 'page';

      component.processStock('other');
      expect(component.updateSummarySelectPageItems).toHaveBeenCalled();
    });

    it('should update summary select page items selectOptions is "all"', () => {
      // act
      spyOn(component, 'updateSummarySelectAll');
      component.selectOptions = 'all';

      component.processStock('other');
      expect(component.updateSummarySelectAll).toHaveBeenCalled();
    });
  });

  describe('removeStockDialog', () => {
    it('should open the dialog and handle result correctly', fakeAsync(() => {
      // Arrange
      spyOn(util, 'customSnackBar');
      // Call the method
      component.removeStockDialog();
      // Simulate the dialog closing
      tick();

      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'selectedStocks',
        []
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'changedBatches',
        []
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'batches',
        []
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'toggle',
        false
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'enableSendStock',
        false
      );
      expect(component.store.updateStateProp).toHaveBeenCalledWith(
        'stockAction',
        false
      );
      expect(component.filterChanged.emit).toHaveBeenCalled();
      expect(util.customSnackBar).toHaveBeenCalledWith(
        'Stock was successfully removed',
        ACTION_TYPE.SUCCESS
      );
    }));
  });

  afterEach(() => {
    fixture.destroy();
  });
});

class MdDialogMock {
  // When the component calls this.dialog.open(...) we'll return an object
  // with an afterClosed method that allows to subscribe to the dialog result observable.
  open() {
    return {
      afterClosed: () => new BehaviorSubject(true),
    };
  }
}

class RouterServiceStub {
  navigateArray() {
    console.log('hi');
  }
}

class StorageServiceStub {
  saveInStorage(key: string, value: any) {
    console.log('hi');
  }
}

class StoreStub {
  updateStateProp = jasmine.createSpy('updateStateProp');
  toggle$ = new BehaviorSubject(false);
  sendStock$ = new BehaviorSubject(false);
  stockAction$ = new BehaviorSubject(false);
  viewSelectedToggle$ = new BehaviorSubject([]);
  selectOptions$ = new BehaviorSubject('page');
  selectedStockItems$ = new BehaviorSubject([]);
  batches$ = new BehaviorSubject([]);
  changedBatches$ = new BehaviorSubject([]);
}

class UtilServiceStub {
  customSnackBar() {
    console.log('hi');
  }
}

class StockProcessServiceStub {
  updateListingInfo() {
    console.log('hi');
  }
  updateSummaryData() {
    console.log('hi');
  }
}

class ListingInfoServiceStub {
  getSelectedQuantity() {
    console.log('hi');
  }

  computeSelectedQuantity = jasmine.createSpy('computeSelectedQuantity');
}
