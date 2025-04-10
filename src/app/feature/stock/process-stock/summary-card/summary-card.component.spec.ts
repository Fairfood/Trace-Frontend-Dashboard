import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryCardComponent } from './summary-card.component';
import { StockProcessService } from '../stock-process.service';
import { StepValues } from '../process-stock.config';

describe('SummaryCardComponent', () => {
  let component: SummaryCardComponent;
  let fixture: ComponentFixture<SummaryCardComponent>;
  let stockProcessServiceSpy: jasmine.SpyObj<StockProcessService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('StockProcessService', [
      'getSummaryData',
      'fetchCurrentUrl',
    ]);
    await TestBed.configureTestingModule({
      imports: [SummaryCardComponent],
      providers: [{ provide: StockProcessService, useValue: spy }],
    }).compileComponents();
    stockProcessServiceSpy = TestBed.inject(
      StockProcessService
    ) as jasmine.SpyObj<StockProcessService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryCardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize summary data correctly', () => {
    const mockSummaryData = {
      currentStep: StepValues.TRANSACTION,
      batches: 2,
      products: ['product1', 'product2'],
      selectAll: false,
      totalQuantity: 12,
    };
    stockProcessServiceSpy.getSummaryData.and.returnValue(mockSummaryData);
    stockProcessServiceSpy.fetchCurrentUrl.and.returnValue(
      '/stock/process-convert'
    );

    fixture.detectChanges();

    expect(component.summaryData).toEqual(mockSummaryData);
    expect(component.currentAction).toEqual('convert');
    // Add more expectations as needed
  });

  it('should initialize summary data correctly when no summary data is available', () => {
    stockProcessServiceSpy.getSummaryData.and.returnValue(null);
    stockProcessServiceSpy.fetchCurrentUrl.and.returnValue('/stock/stock-send');

    fixture.detectChanges();

    expect(component.summaryData).toBeNull();
    expect(component.currentAction).toEqual('send');
  });

  it('should initialize summary data correctly when no summary data is available', () => {
    stockProcessServiceSpy.getSummaryData.and.returnValue(null);
    stockProcessServiceSpy.fetchCurrentUrl.and.returnValue('/stock/receive');

    fixture.detectChanges();

    expect(component.summaryData).toBeNull();
    expect(component.currentAction).toEqual('receive');
  });
});
