import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import {
  LangChangeEvent,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { ListViewComponent } from './list-view.component';
import { ListViewService } from './list-view.service';
import { ExportService } from 'src/app/shared/service/export.service';
import { StorageService, UtilService } from 'src/app/shared/service';
import {
  ButtonsComponent,
  FairFoodCustomTabComponent,
  FfPaginationComponent,
  LoaderComponent,
} from 'fairfood-utils';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { EventEmitter } from '@angular/core';
import { Subject, of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('ListViewComponent', () => {
  let component: ListViewComponent;
  let fixture: ComponentFixture<ListViewComponent>;
  let listViewServiceSpy: jasmine.SpyObj<ListViewService>;
  let utilServiceMock: Partial<UtilService>;

  beforeEach(async () => {
    const activatedRouteStub = {
      snapshot: { data: {} },
      paramMap: of(convertToParamMap({})),
    };
    listViewServiceSpy = jasmine.createSpyObj('ListViewService', [
      'setFilterValues',
      'filterOperations',
      'addNewConnection',
      'farmerConnection',
      'viewDetails',
      'customSnackBar',
      'formatConnectedFarmerData',
      'addCompanyPopup',
      'dynamicTemplateRedirection',
    ]);
    const exportServiceSpy = jasmine.createSpyObj('ExportService', [
      'exportIconClicked$',
      'initExportData',
    ]);
    exportServiceSpy.exportIconClicked$ = new Subject<boolean>().asObservable();
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'retrieveStoredData',
    ]);
    utilServiceMock = {
      supplyChainData$: new Subject<string>(),
    };
    const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      declarations: [ListViewComponent, TranslatePipe],
      imports: [
        FairFoodCustomTabComponent,
        SearchBoxComponent,
        ButtonsComponent,
        MatMenuModule,
        HttpClientModule,
        MatSnackBarModule,
        FfPaginationComponent,
        LoaderComponent,
      ],
      providers: [
        { provide: ListViewService, useValue: listViewServiceSpy },
        { provide: ExportService, useValue: exportServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: UtilService, useValue: utilServiceMock },
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
