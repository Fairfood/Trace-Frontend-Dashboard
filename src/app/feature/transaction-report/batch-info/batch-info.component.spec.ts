import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BatchInfoComponent } from './batch-info.component';
import { TransactionReportStoreService } from '../transaction-report-store.service';
import { BehaviorSubject } from 'rxjs';

describe('BatchInfoComponent', () => {
  let component: BatchInfoComponent;
  let fixture: ComponentFixture<BatchInfoComponent>;
  let mockTransactionReportStoreService: jasmine.SpyObj<TransactionReportStoreService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchInfoComponent, CommonModule],
      providers: [
        {
          provide: TransactionReportStoreService,
          useClass: TransactionReportStoreServiceStub,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});

class TransactionReportStoreServiceStub {
  transactionDetails$ = new BehaviorSubject<any>(null);
}
