import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TransactionsComponent } from './transactions.component';
import { TR_IMPORTS } from './transactions.config';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('TransactionsComponent', () => {
  let component: TransactionsComponent;
  let fixture: ComponentFixture<TransactionsComponent>;

  beforeEach(() => {
    const spyTranslate = jasmine.createSpyObj('TranslateService', ['instant']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
        { provide: TranslateService, useValue: spyTranslate },
      ],
      imports: [
        TransactionsComponent,
        TR_IMPORTS,
        HttpClientModule,
        MatSnackBarModule,
      ],
    });
    fixture = TestBed.createComponent(TransactionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
