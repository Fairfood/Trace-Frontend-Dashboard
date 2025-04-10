import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionSummaryComponent } from './transaction-summary.component';
import { StockProcessService } from '../stock-process.service';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { of } from 'rxjs';

describe('TransactionSummaryComponent', () => {
  let component: TransactionSummaryComponent;
  let fixture: ComponentFixture<TransactionSummaryComponent>;
  let stockProcessServiceSpy: jasmine.SpyObj<StockProcessService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('StockProcessService', [
      'getSummaryData',
      'fetchCurrentUrl',
      'getListingInfo',
      'currentClaimState',
      'currentTransactionState',
    ]);

    const mockClaimState = {
      claimsList: [
        { selected: true, name: 'Claim 1' },
        { selected: false, name: 'Claim 2' },
      ],
    };
    const mockTransactionState = {
      transactionDetails: {
        product: 'Product 1',
        transactionDate: '2021-01-01',
      },
    };

    spy.currentClaimState.and.returnValue(of(mockClaimState));
    spy.currentTransactionState.and.returnValue(of(mockTransactionState));
    spy.getSummaryData.and.returnValue({
      product: 'Product 1',
      transactionDate: '2021-01-01',
    });

    await TestBed.configureTestingModule({
      providers: [{ provide: StockProcessService, useValue: spy }],
      imports: [FormsModule, MatCheckboxModule, TransactionSummaryComponent],
    }).compileComponents();
    stockProcessServiceSpy = TestBed.inject(
      StockProcessService
    ) as jasmine.SpyObj<StockProcessService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize transaction summary correctly', () => {
    const mockSummaryData = {
      product: 'Product 1',
      transactionDate: '2021-01-01',
    };
    stockProcessServiceSpy.getSummaryData.and.returnValue(mockSummaryData);
    stockProcessServiceSpy.fetchCurrentUrl.and.returnValue(
      '/stock/process-merge'
    );
    stockProcessServiceSpy.getListingInfo.and.returnValue({
      selectedStock: [{ stockId: 1, quantityAvailable: 10 }],
    });

    fixture.detectChanges();

    expect(component.transactionSummary).toEqual(mockSummaryData);
    expect(component.currentAction).toEqual('merge');
    expect(component.batchData).toEqual(['ST-1 (10 kg)']);
    // Add more expectations as needed
  });

  it('should emit nextPage event correctly when finalize is called', () => {
    const nextPageSpy = spyOn(component.nextPage, 'emit');

    fixture.detectChanges();
    component.finalize('next');

    expect(nextPageSpy).toHaveBeenCalledWith('next');
  });

  it('should subscribe to data changes correctly', () => {
    component.subscriptionsInit();
    expect(component.claimList).toEqual(['Claim 1']);
    expect(component.formData).toEqual({
      product: 'Product 1',
      transactionDate: '2021-01-01',
    });
  });

  it('should handle empty data', () => {
    stockProcessServiceSpy.currentClaimState.and.returnValue(of(null));
    component.subscriptionsInit();
    expect(component.claimList).toEqual([]);
  });
  it('should disable the next button when val is false', () => {
    // Act
    component.confirmTransaction(false);

    // Assert
    expect(component.nextButtonState.disabled).toBe(true);
  });

  it('should enable the next button when val is true', () => {
    // Act
    component.confirmTransaction(true);

    // Assert
    expect(component.nextButtonState.disabled).toBe(false);
  });
});
