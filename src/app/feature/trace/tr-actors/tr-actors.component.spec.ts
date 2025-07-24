import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrActorsComponent } from './tr-actors.component';
import { TraceStoreService } from '../trace-store.service';
import { of } from 'rxjs';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FfFilterBoxWrapperComponent } from 'fairfood-form-components';
import { FfPaginationComponent } from 'fairfood-utils';
import { MatTableModule } from '@angular/material/table';

describe('TrActorsComponent', () => {
  let component: TrActorsComponent;
  let fixture: ComponentFixture<TrActorsComponent>;
  let traceStoreServiceSpy: jasmine.SpyObj<TraceStoreService>;

  beforeEach(async () => {
    const traceStoreServiceSpyObj = jasmine.createSpyObj('TraceStoreService', [
      'getActorsData',
      'getProductData',
    ]);
    await TestBed.configureTestingModule({
      imports: [
        SearchBoxComponent,
        MatSnackBarModule,
        HttpClientModule,
        TranslateModule.forRoot(),
        FfFilterBoxWrapperComponent,
        FfPaginationComponent,
        MatTableModule,
        TrActorsComponent,
      ],
      providers: [
        { provide: TraceStoreService, useValue: traceStoreServiceSpyObj },
      ],
    }).compileComponents();
    traceStoreServiceSpy = TestBed.inject(
      TraceStoreService
    ) as jasmine.SpyObj<TraceStoreService>;
    traceStoreServiceSpy.actorsData$ = of([]);
    traceStoreServiceSpy.productData$ = of([]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrActorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update selected product and filter dataSource', () => {
    const newValue = { id: 'TestID', name: 'TestName' };
    component.filterData(newValue);
    expect(component.selectedProduct).toEqual(newValue.name);
    expect(component.dataSource.filter).toEqual(newValue.name);
  });

  it('should update selected product to empty string if newValue.id is "All"', () => {
    const newValue = { id: 'All', name: 'All' };
    component.filterData(newValue);
    expect(component.selectedProduct).toEqual('');
    expect(component.dataSource.filter).toEqual('');
  });
});
