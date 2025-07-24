import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveTransactionsComponent } from './archive-transactions.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { RouterService } from 'src/app/shared/service';

describe('ArchiveTransactionsComponent', () => {
  let component: ArchiveTransactionsComponent;
  let fixture: ComponentFixture<ArchiveTransactionsComponent>;
  let routerService: RouterService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArchiveTransactionsComponent,
        HttpClientModule,
        MatSnackBarModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchiveTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    routerService = TestBed.inject(RouterService);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to transactions', () => {
    spyOn(routerService, 'navigateArray').and.callThrough();
    const navigateSpy = spyOn(router, 'navigate');

    component.goToTransactions();

    expect(routerService.navigateArray).toHaveBeenCalledWith(['transactions']);
    expect(navigateSpy).toHaveBeenCalledWith(['transactions']);
  });
});
