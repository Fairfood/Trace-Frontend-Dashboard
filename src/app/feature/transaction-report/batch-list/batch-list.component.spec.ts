import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BatchListComponent } from './batch-list.component';
import { TransactionReportStoreService } from '../transaction-report-store.service';
import { TransactionReportService } from '../transaction-report.service';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { ITransactionDetail } from '../transaction-report.config';
import { EventEmitter } from '@angular/core';

describe('BatchListComponent', () => {
  let component: BatchListComponent;
  let fixture: ComponentFixture<BatchListComponent>;
  let service: TransactionReportService;
  let navigateToTraceSpy: jasmine.Spy;

  beforeEach(async () => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      imports: [
        BatchListComponent,
        CommonModule,
        MatTableModule,
        MatIconModule,
        TranslateModule.forRoot(),
        HttpClientModule,
      ],
      providers: [
        {
          provide: TransactionReportService,
          useClass: TransactionReportServiceStub,
        },
        {
          provide: TransactionReportStoreService,
          useClass: TransactionReportStoreServiceStub,
        },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TransactionReportService);
    fixture.detectChanges();
    navigateToTraceSpy = spyOn(component.navigateToTrace, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch batch information when farmers is greater than 0', () => {
    const mockBatch = {
      id: 'batchId',
      farmers: 2,
    };
    const mockResults: any[] = [];
    spyOn(service, 'fetchBatchInfo').and.returnValue(
      of({ results: mockResults })
    );
    component.getBatchInformation(mockBatch);
    expect(component.selectedBatchInfo).toEqual(mockBatch);
    expect(service.fetchBatchInfo).toHaveBeenCalledWith('batchId');
    expect(component.selectedBatchInfo.farmersList).toEqual(mockResults);
    expect(component.loading).toBeFalse();
  });

  it('should emit true when gotoTrace is called', () => {
    component.gotoTrace();
    expect(navigateToTraceSpy).toHaveBeenCalledWith(true);
  });
});

class TransactionReportStoreServiceStub {
  transactionDetails$ = new BehaviorSubject<Partial<ITransactionDetail>>({
    source_batches: [],
    destination: [],
  });
}

class TransactionReportServiceStub {
  fetchBatchInfo(id: any) {
    console.log('hi');
  }
}
