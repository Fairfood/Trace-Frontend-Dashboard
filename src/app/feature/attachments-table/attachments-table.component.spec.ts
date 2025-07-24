import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AttachementsTableComponent } from './attachments-table.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { FfPaginationComponent } from 'fairfood-utils';
import { UtilService } from 'src/app/shared/service';
import { TranslateService } from '@ngx-translate/core';

describe('AttachmentsTableComponent', () => {
  let fixture: ComponentFixture<AttachementsTableComponent>;
  let component: AttachementsTableComponent;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    const utilSpyObj = jasmine.createSpyObj('UtilService', [
      'generateTotpToken',
      'customSnackBar',
    ]);

    const mockSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: dialogMock },
        {
          provide: UtilService,
          useValue: utilSpyObj,
        },
        {
          provide: TranslateService,
          useValue: mockSpy,
        },
      ],
      imports: [
        MatSnackBarModule,
        HttpClientModule,
        FfPaginationComponent,
        AttachementsTableComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachementsTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filterApplied event', () => {
    const paginatorData = { limit: 10, offset: 0 };
    const filterAppliedSpy = spyOn(component.filterApplied, 'emit');

    component.paginatorEvent(paginatorData);

    expect(filterAppliedSpy).toHaveBeenCalledWith(paginatorData);
  });
});
