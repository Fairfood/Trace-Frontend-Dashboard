import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrTransactionsComponent } from './tr-transactions.component';
import { TraceStoreService } from '../trace-store.service';
import { of } from 'rxjs';
import { ITransactionFilter, ITransactionList } from '../trace.config';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonsComponent, FfPaginationComponent } from 'fairfood-utils';

describe('TrTransactionsComponent', () => {
  let component: TrTransactionsComponent;
  let fixture: ComponentFixture<TrTransactionsComponent>;
  let traceStoreServiceStub: Partial<TraceStoreService>;

  // Mock data for testing
  const mockTransactionList: ITransactionList = {
    count: 10,
    transactions: [], // Add sample transaction data here if needed
    tableLoading: false,
  };

  beforeEach(async () => {
    // Mock the TraceStoreService
    traceStoreServiceStub = {
      filterValues$: of<ITransactionFilter>({
        selectedProduct: '',
        selectedType: '',
        selectedDate: '',
        selectedActor: '',
        offset: 0,
        limit: 10,
        searchString: '',
      }),
      tableData$: of<ITransactionList>(mockTransactionList),
      actorsData$: of<any[]>([]),
      productData$: of<any[]>([]),
      updateFilter: jasmine.createSpy(),
      resetTransactionFilter: jasmine.createSpy(),
      resetTableData: jasmine.createSpy(),
      fetchActorTractions: jasmine.createSpy(),
    };

    await TestBed.configureTestingModule({
      imports: [
        SearchBoxComponent,
        MatSnackBarModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        ButtonsComponent,
        FfPaginationComponent,
        TrTransactionsComponent,
      ],
      providers: [
        { provide: TraceStoreService, useValue: traceStoreServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more test cases to verify component behavior
});
