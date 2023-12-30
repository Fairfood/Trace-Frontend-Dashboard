import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { AttachementsTableComponent } from './attachments-table.component';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ACTION_TYPE } from 'src/app/shared/configs/app.constants';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { FfPaginationComponent } from 'fairfood-utils';

describe('AttachmentsTableComponent', () => {
  let fixture: ComponentFixture<AttachementsTableComponent>;
  let component: AttachementsTableComponent;
  let dialogMock: jasmine.SpyObj<MatDialog>;

  beforeEach(async(() => {
    dialogMock = jasmine.createSpyObj('MatDialog', ['open']);
    TestBed.configureTestingModule({
      declarations: [AttachementsTableComponent],
      providers: [{ provide: MatDialog, useValue: dialogMock }],
      imports: [MatSnackBarModule, HttpClientModule, FfPaginationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachementsTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should download a file', () => {
    const attachment = 'test-file.pdf';
    const downloadReceiptSpy = spyOn(
      component.dataService,
      'downloadReceipt'
    ).and.returnValue(of('file-content'));
    component.downloadFile({ id: '1', attachment });

    expect(downloadReceiptSpy).toHaveBeenCalledWith(attachment);
  });

  it('should not allow multiple downloads at the same time', () => {
    component.downloadingId = '1';

    const customSnackBarSpy = spyOn(component.dataService, 'customSnackBar');

    component.downloadFile({ id: '2', attachment: 'test-file.pdf' });

    expect(customSnackBarSpy).toHaveBeenCalledWith(
      'Download in progress. Please try again after some time !',
      ACTION_TYPE.FAILED
    );
  });

  it('should emit filterApplied event', () => {
    const paginatorData = { limit: 10, offset: 0 };
    const filterAppliedSpy = spyOn(component.filterApplied, 'emit');

    component.paginatorEvent(paginatorData);

    expect(filterAppliedSpy).toHaveBeenCalledWith(paginatorData);
  });
});
