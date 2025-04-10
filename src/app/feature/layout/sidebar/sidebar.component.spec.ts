import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { AuthService } from '../../authentication/auth.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { StorageService, UtilService } from 'src/app/shared/service';
import { StockProcessService } from '../../stock/process-stock';
import { ListingStoreService } from '../../stock/listing/listing-store.service';
import { HttpClientModule } from '@angular/common/http';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    const utilServiceMock = {
      companyData$: new BehaviorSubject(null),
      customSnackBar(): void {
        console.log('hi');
      },
    };
    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        CommonModule,
        RouterModule,
        MatIconModule,
        TranslateModule.forRoot(),
        HttpClientModule,
      ],
      providers: [
        AuthService,
        { provide: GlobalStoreService, useClass: GlobalStoreServiceStub },
        StorageService,
        { provide: UtilService, useValue: utilServiceMock },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        StockProcessService,
        ListingStoreService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    // Unsubscribe from subscriptions to prevent memory leaks
    component.pageApis.forEach((m: Subscription) => m.unsubscribe());
  });
});

class GlobalStoreServiceStub {
  userData$ = new BehaviorSubject<any>(null);
}
