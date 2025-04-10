import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BasicDetailsComponent } from './basic-details.component';
import { TransactionReportStoreService } from '../transaction-report-store.service';
import { of } from 'rxjs';

describe('BasicDetailsComponent', () => {
  let component: BasicDetailsComponent;
  let fixture: ComponentFixture<BasicDetailsComponent>;
  let mockTransactionReportStoreService: jasmine.SpyObj<TransactionReportStoreService>;

  beforeEach(() => {
    mockTransactionReportStoreService = jasmine.createSpyObj(
      'TransactionReportStoreService',
      ['transactionDetails$']
    );

    const mockTranslation = jasmine.createSpyObj('TranslateService', [
      'instant',
    ]);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTableModule,
        TranslateModule,
        BasicDetailsComponent,
      ],
      providers: [
        {
          provide: TransactionReportStoreService,
          useValue: mockTransactionReportStoreService,
        },
        {
          provide: TranslateService,
          useValue: mockTranslation,
        },
      ],
    });

    fixture = TestBed.createComponent(BasicDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
