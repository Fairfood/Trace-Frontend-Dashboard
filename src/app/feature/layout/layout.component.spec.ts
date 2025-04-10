import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LoaderComponent } from 'fairfood-utils';
import { MatIconModule } from '@angular/material/icon';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    const activatedRouteMock = {
      snapshot: {
        paramMap: convertToParamMap({ id: '123' }),
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
    await TestBed.configureTestingModule({
      imports: [
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        LoaderComponent,
        MatIconModule,
        MatSnackBarModule,
        HttpClientModule,
      ],
      providers: [
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
