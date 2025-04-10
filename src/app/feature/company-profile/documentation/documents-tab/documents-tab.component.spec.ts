import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { DocumentsTabComponent } from './documents-tab.component';
import { DocumentationService } from '../documentation.service';
import { UtilService } from 'src/app/shared/service';
import { EventEmitter } from '@angular/core';
import { FfPaginationComponent, ButtonsComponent } from 'fairfood-utils';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { DocUploadComponent } from '../doc-upload';

describe('DocumentsTabComponent', () => {
  let component: DocumentsTabComponent;
  let fixture: ComponentFixture<DocumentsTabComponent>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<DocUploadComponent>>;
  let mockUtilService: jasmine.SpyObj<UtilService>;

  const dialogMock = {
    open: () => ({ afterClosed: () => of(true) }),
  };

  const documentationServiceMock = {
    listDocument: (limit: number, offset: number) => {
      return new BehaviorSubject({
        results: [
          { id: 1, name: 'Document 1' },
          { id: 2, name: 'Document 2' },
        ],
        count: 2,
      });
    },
  };

  const translateServiceMock = {
    currentLang: '',
    onLangChange: new EventEmitter<LangChangeEvent>(),
    get: () => of(''),
    instant: (key: string) => key,
    onTranslationChange: new EventEmitter(),
    onDefaultLangChange: new EventEmitter(),
  };

  beforeEach(() => {
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockUtilService = jasmine.createSpyObj('UtilService', ['customSnackBar']);

    TestBed.configureTestingModule({
      imports: [
        FfPaginationComponent,
        ButtonsComponent,
        TranslateModule,
        MatIconModule,
        MatMenuModule,
        DocumentsTabComponent,
      ],
      providers: [
        { provide: MatDialog, useValue: dialogMock },
        { provide: DocumentationService, useValue: documentationServiceMock },
        { provide: UtilService, useClass: UtilServiceStub },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsTabComponent);
    component = fixture.componentInstance;
    mockMatDialog.open.and.returnValue(mockMatDialogRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllDocuments on ngOnInit', () => {
    spyOn(component, 'getAllDocuments');
    component.ngOnInit();
    expect(component.getAllDocuments).toHaveBeenCalled();
  });

  it('should handle paginator event', waitForAsync(() => {
    const data = { limit: 20, offset: 10 };

    spyOn(component, 'getAllDocuments').and.stub();

    component.paginatorEvent(data);

    expect(component.appliedFilter.limit).toBe(data.limit);
    expect(component.appliedFilter.offset).toBe(data.offset);

    expect(component.loader).toBeTrue();

    // Check if getAllDocuments method is called
    expect(component.getAllDocuments).toHaveBeenCalled();
  }));

  it('should unsubscribe from subscriptions on destroy', () => {
    // Mock subscriptions
    const subMock: Subscription = new Subscription();
    const downloadSubMock: Subscription = new Subscription();

    // Assign mock subscriptions to component properties
    component.sub = subMock;
    component.downloadSub = downloadSubMock;

    // Spy on unsubscribe method of subscriptions
    spyOn(subMock, 'unsubscribe').and.callThrough();
    spyOn(downloadSubMock, 'unsubscribe').and.callThrough();

    // Call ngOnDestroy
    component.ngOnDestroy();

    // Check if unsubscribe method is called for each subscription
    expect(subMock.unsubscribe).toHaveBeenCalled();
    expect(downloadSubMock.unsubscribe).toHaveBeenCalled();
  });

  it('should not throw error if subscriptions are not set', () => {
    // Call ngOnDestroy without setting subscriptions
    expect(() => component.ngOnDestroy()).not.toThrowError();
  });
});

class UtilServiceStub {
  customSnackBar(message: string, actionType: string) {
    console.log(
      `Custom snackbar called with message: ${message}, actionType: ${actionType}`
    );
  }
}
