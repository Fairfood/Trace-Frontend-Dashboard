import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveStocksComponent } from './archive-stocks.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';

describe('ArchiveStocksComponent', () => {
  let component: ArchiveStocksComponent;
  let fixture: ComponentFixture<ArchiveStocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArchiveStocksComponent,
        HttpClientModule,
        MatSnackBarModule,
        TranslateModule.forRoot(),
        MatDialogModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArchiveStocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
