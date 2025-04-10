import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from 'src/app/shared/service';
import { UtilService } from 'src/app/shared/service';
import { ListViewService } from '../list-view/list-view.service';
import { ConnectionService } from '../connections.service';
import { MapViewComponent } from './map-view.component';
import { Subject, of } from 'rxjs';
import { LoaderComponent } from 'fairfood-utils';
import {
  LangChangeEvent,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('MapViewComponent', () => {
  let component: MapViewComponent;
  let fixture: ComponentFixture<MapViewComponent>;
  let utilServiceMock: Partial<UtilService>;

  beforeEach(async () => {
    const connectionServiceSpyObj = jasmine.createSpyObj('ConnectionService', [
      'getCompanyDetails',
      'getUsedConnectionLabels',
      'mapData$',
      'infoWindowSetup',
      'setupClusterInfoWinodw',
    ]);
    const dialogSpyObj = jasmine.createSpyObj('MatDialog', ['open', 'close']);
    const storageServiceSpyObj = jasmine.createSpyObj('StorageService', [
      'retrieveStoredData',
    ]);
    utilServiceMock = {
      supplyChainData$: new Subject<string>(),
      getSupplyChains: jasmine
        .createSpy('getSupplyChains')
        .and.returnValue(of()),
    };
    const listViewServiceSpyObj = jasmine.createSpyObj('ListViewService', [
      'addCompanyPopup',
    ]);
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };

    await TestBed.configureTestingModule({
      declarations: [MapViewComponent, TranslatePipe],
      imports: [LoaderComponent, MatIconModule, MatTooltipModule],
      providers: [
        { provide: ConnectionService, useValue: connectionServiceSpyObj },
        { provide: MatDialog, useValue: dialogSpyObj },
        { provide: StorageService, useValue: storageServiceSpyObj },
        { provide: UtilService, useValue: utilServiceMock },
        { provide: ListViewService, useValue: listViewServiceSpyObj },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
