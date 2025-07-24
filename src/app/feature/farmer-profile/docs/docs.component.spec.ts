import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { DocsComponent } from './docs.component';
import { CommonModule } from '@angular/common';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { FarmerProfileStoreService } from '../farmer-profile-store.service';
import { UtilService } from 'src/app/shared/service';
import { AttachementsTableComponent } from '../../attachments-table';
import { HttpClientModule } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { IReference } from '../farmer-profile.config';

describe('DocsComponent', () => {
  let component: DocsComponent;
  let fixture: ComponentFixture<DocsComponent>;
  let storeMock: jasmine.SpyObj<FarmerProfileStoreService>;

  beforeEach(async () => {
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      // use: () => {},
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    storeMock = jasmine.createSpyObj('FarmerProfileStoreService', [
      'attachments$',
      'fetchFarmerAttachments',
      'addAttachements',
    ]);
    storeMock.attachments$ = new Subject();
    TestBed.configureTestingModule({
      imports: [
        DocsComponent,
        AttachementsTableComponent,
        CommonModule,
        TranslateModule.forRoot(),
        HttpClientModule,
      ],
      providers: [
        FarmerProfileStoreService,
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: TranslateService, useValue: translateServiceMock },
        {
          provide: FarmerProfileStoreService,
          useValue: storeMock,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch attachments and set dataSource on init', fakeAsync(() => {
    // Arrange
    const attachmentsData: IReference = {
      count: 2,
      results: [
        {
          creator_name: 'John Doe',
          created_on: '2024-03-10',
          attachment: 'file.pdf',
          node_details: { full_name: 'Uploader' },
        },
        {
          creator_name: 'Jane Smith',
          created_on: '2024-03-11',
          attachment: 'file2.pdf',
          node_details: { full_name: 'Uploader 2' },
        },
      ],
      loading: false,
    };
    const testSub = new BehaviorSubject(attachmentsData);
    storeMock.attachments$ = testSub.asObservable();
    component.ngOnInit();
    // Act
    tick();

    // Assert
    expect(component.loading).toBeFalse();
    expect(component.tableLength).toBe(2);
    expect(component.dataSource).toEqual([
      {
        creator_name: 'John Doe',
        created_on: '2024-03-10',
        attachment: 'file.pdf',
        node_details: { full_name: 'Uploader' },
        addedBy: 'John Doe',
        addedOn: '2024-03-10',
        file: 'file.pdf',
        uploader: 'Uploader',
      },
      {
        creator_name: 'Jane Smith',
        created_on: '2024-03-11',
        attachment: 'file2.pdf',
        node_details: { full_name: 'Uploader 2' },
        addedBy: 'Jane Smith',
        addedOn: '2024-03-11',
        file: 'file2.pdf',
        uploader: 'Uploader 2',
      },
    ]);
  }));

  it('should call store method to fetch attachments when filter is applied', () => {
    component.farmerId = '1';
    // Act
    component.filterApplied({ limit: 10, offset: 0 });

    // Assert
    expect(storeMock.fetchFarmerAttachments).toHaveBeenCalledWith('1', 0, 10);
    expect(component.loading).toBeTrue();
  });

  it('should call store method to add attachments when file is uploaded', () => {
    // Arrange
    const formData = new FormData();
    formData.append('name', 'file.pdf');
    formData.append('farmer', 'farmer123');
    formData.append(
      'attachment',
      new Blob(['file content'], { type: 'application/pdf' })
    );
    storeMock.addAttachements.and.returnValue(of(true));
    spyOn(component.dataService, 'customSnackBar');
    // Act
    component.fileUploadStarted({
      file: formData.get('attachment'),
      fileName: 'file.pdf',
    });

    // Assert
    expect(component.loading).toBeTrue();
    expect(storeMock.addAttachements).toHaveBeenCalledWith(formData);
    expect(component.dataService.customSnackBar).toHaveBeenCalledWith(
      'transactions.receiptUploaded',
      'success'
    );
  });
});

class UtilServiceStub {
  customSnackBar(): void {
    console.log('hi');
  }
}
