import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NewConnectionCompanyComponent } from './new-connection-company.component';
import { NewConnectionCompanyService } from './new-connection-company.service';
import { GlobalStoreService } from 'src/app/shared/store';
import { UtilService } from 'src/app/shared/service';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('NewConnectionCompanyComponent', () => {
  let component: NewConnectionCompanyComponent;
  let fixture: ComponentFixture<NewConnectionCompanyComponent>;
  let service: NewConnectionCompanyService;
  let globalStoreService: GlobalStoreService;
  let translateService: TranslateService;
  let utilService: UtilService;

  beforeEach(async () => {
    const activatedRouteStub = {
      snapshot: { data: {} },
      paramMap: of(convertToParamMap({})),
    };
    await TestBed.configureTestingModule({
      imports: [
        NewConnectionCompanyComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        FormsModule,
        HttpClientModule,
        MatSnackBarModule,
      ],
      providers: [
        NewConnectionCompanyService,
        GlobalStoreService,
        UtilService,
        TranslateService,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewConnectionCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
