import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptComponent } from './receipt.component';
import { CommonModule } from '@angular/common';
import { AttachementsTableComponent } from '../../attachments-table';
import { TransactionReportService } from '../transaction-report.service';
import { UtilService } from 'src/app/shared/service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';

describe('ReceiptComponent', () => {
  let component: ReceiptComponent;
  let fixture: ComponentFixture<ReceiptComponent>;

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
      imports: [ReceiptComponent, CommonModule, AttachementsTableComponent],
      providers: [
        {
          provide: TransactionReportService,
          useClass: MockTransactionReportService,
        },
        { provide: UtilService, useClass: MockUtilService },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});

class MockTransactionReportService {
  getTransactionAttachments(
    transactionId: string,
    limit: number,
    offset: number
  ): Observable<any> {
    return of([]);
  }

  addAttachements(transactionId: string, formData: FormData): Observable<any> {
    return of({});
  }
}

class MockUtilService {
  customSnackBar(message: string, action: string) {
    console.log('hi');
  }
}
