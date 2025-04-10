import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  LangChangeEvent,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { ClaimsEvidenceComponent } from './claims-evidence.component';
import { EventEmitter } from '@angular/core';
import { of } from 'rxjs';

describe('ClaimsEvidenceComponent', () => {
  let component: ClaimsEvidenceComponent;
  let fixture: ComponentFixture<ClaimsEvidenceComponent>;
  let mockDialogRef: Partial<MatDialogRef<ClaimsEvidenceComponent>>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jasmine.createSpy('close'),
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
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
      imports: [
        ClaimsEvidenceComponent,
        MatDialogModule,
        MatIconModule,
        TranslateModule.forRoot(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsEvidenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
