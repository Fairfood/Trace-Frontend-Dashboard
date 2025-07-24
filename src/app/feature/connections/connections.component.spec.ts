import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConnectionsComponent } from './connections.component';
import {
  LangChangeEvent,
  TranslatePipe,
  TranslateService,
} from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { ExportIconComponent } from 'src/app/shared/components/export-icon';
import { HttpClientModule } from '@angular/common/http';
import { ListViewComponent } from './list-view/list-view.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ButtonsComponent,
  FairFoodCustomTabComponent,
  FfPaginationComponent,
  LoaderComponent,
} from 'fairfood-utils';
import { SearchBoxComponent } from 'src/app/shared/components/search-box';
import { MatMenuModule } from '@angular/material/menu';

describe('ConnectionsComponent', () => {
  let component: ConnectionsComponent;
  let fixture: ComponentFixture<ConnectionsComponent>;

  beforeEach(async () => {
    const activatedRouteStub = {
      snapshot: { data: {} },
      paramMap: of(convertToParamMap({})),
    };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    await TestBed.configureTestingModule({
      declarations: [ConnectionsComponent, TranslatePipe, ListViewComponent],
      imports: [
        ExportIconComponent,
        HttpClientModule,
        MatDialogModule,
        MatSnackBarModule,
        FairFoodCustomTabComponent,
        SearchBoxComponent,
        ButtonsComponent,
        MatMenuModule,
        FfPaginationComponent,
        LoaderComponent,
      ],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle help', () => {
    component.toggleHelp = false;
    component.showHideHelp();
    expect(component.toggleHelp).toBe(true);

    component.showHideHelp();
    expect(component.toggleHelp).toBe(false);
  });

  it('should toggle connection view', () => {
    component.listView = false;
    component.onToggleConnectionView({ target: { checked: true } });
    expect(component.listView).toBe(true);

    component.onToggleConnectionView({ target: { checked: false } });
    expect(component.listView).toBe(false);
  });
});
