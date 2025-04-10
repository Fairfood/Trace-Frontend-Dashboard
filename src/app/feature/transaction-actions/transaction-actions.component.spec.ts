import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TransactionActionsComponent } from './transaction-actions.component';
import { TransactionActionsService } from './transaction-actions.service';
import { of } from 'rxjs';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';

describe('TransactionActionsComponent', () => {
  let component: TransactionActionsComponent;
  let fixture: ComponentFixture<TransactionActionsComponent>;
  let mockDialogRef: MatDialogRef<TransactionActionsComponent>;
  let mockData: any;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj(['close']);
    mockData = {};
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TransactionActionsComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        {
          provide: TransactionActionsService,
          useClass: TransactionActionsServiceStub,
        },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

class TransactionActionsServiceStub {
  formatDate(date: any): any {
    console.log('hi');
  }

  removeStock(params: any): any {
    return of({ success: true });
  }

  rejectTransaction(id: string, params: any): any {
    return of({ success: true });
  }
}
