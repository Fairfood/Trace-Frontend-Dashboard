import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionReportStoreService } from './transaction-report-store.service';
import { TransactionReportService } from './transaction-report.service';
import { TraceStoreService } from '../trace/trace-store.service';
import { UtilService } from 'src/app/shared/service';
import { TransactionReportComponent } from './transaction-report.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ITransactionDetail } from './transaction-report.config';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { BatchInfoComponent } from './batch-info';
import { CommonWalletComponent } from 'src/app/shared/components/common-wallet';
import { MatIconModule } from '@angular/material/icon';
import { QrCodeGeneratorComponent } from './qr-code-generator';
import { FairFoodCustomTabComponent, LoaderComponent } from 'fairfood-utils';
import { BasicDetailsComponent } from './basic-details';

describe('TransactionReportComponent', () => {
  let component: TransactionReportComponent;
  let fixture: ComponentFixture<TransactionReportComponent>;
  let mockDialog: Partial<MatDialog>;

  beforeEach(async () => {
    mockDialog = {
      open: jasmine.createSpy('open'),
    };
    const activatedRouteStub = {
      snapshot: { params: { id: 'some_id', transaction: 'asdasd' } },
    };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      declarations: [TransactionReportComponent],
      imports: [
        TranslateModule.forRoot(),
        BatchInfoComponent,
        CommonWalletComponent,
        MatIconModule,
        QrCodeGeneratorComponent,
        BasicDetailsComponent,
        FairFoodCustomTabComponent,
        LoaderComponent,
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: TransactionReportService,
          useClass: TransactionReportServiceStub,
        },
        {
          provide: TransactionReportStoreService,
          useClass: TransactionReportStoreServiceStub,
        },
        { provide: TraceStoreService, useClass: TraceStoreServiceStub },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});

class TransactionReportStoreServiceStub {
  transactionDetails$ = new BehaviorSubject<any>(null);
  updateTransactionDetails(data: any) {
    console.log('hi');
  }
}

class TransactionReportServiceStub {
  getCiTheme(): string {
    return 'fairfood';
  }
  getInternalTransactionDetail(
    transaction: string,
    id: string
  ): Observable<any> {
    return new BehaviorSubject<any>(null);
  }

  generateBatchText(transaction: string, type: number): void {
    console.log('hi');
  }

  generateQrcode(batchId: string, data: Partial<ITransactionDetail>): void {
    console.log('hi');
  }
}

class TraceStoreServiceStub {
  fetchMapInfo(theme: string, batchId: string) {
    console.log('hi');
  }

  setThemeBatch(theme: string, batchId: string) {
    console.log('hi');
  }

  updateStages(stage: number) {
    console.log('hi');
  }

  resetState() {
    console.log('hi');
  }
}

class UtilServiceStub {
  transactionRejectMessage(message: string) {
    console.log('hi');
  }
}
