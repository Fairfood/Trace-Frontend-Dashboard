import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClaimListComponent } from './claim-list.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterService } from 'src/app/shared/service';
import { UtilService } from 'src/app/shared/service/util.service';
import { ClaimService } from '../claim.service';

import { ActivatedRoute } from '@angular/router';
import {
  TranslateService,
  TranslateModule,
  LangChangeEvent,
} from '@ngx-translate/core';
import { Subject, of } from 'rxjs';
import { EventEmitter } from '@angular/core';

describe('ClaimListComponent', () => {
  let component: ClaimListComponent;
  let fixture: ComponentFixture<ClaimListComponent>;
  let utilServiceMock: Partial<UtilService>;
  let routerServiceSpy: jasmine.SpyObj<RouterService>;

  beforeEach(async () => {
    const routerServiceSpyObj = jasmine.createSpyObj('RouterService', [
      'navigateArray',
    ]);

    utilServiceMock = {
      supplyChainData$: new Subject<string>(),
    };
    const translateServiceMock = {
      currentLang: '',
      onLangChange: new EventEmitter<LangChangeEvent>(),
      get: () => of(''),
      instant: (key: string) => key,
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
    };
    const activatedRouteStub = { snapshot: { params: { id: 'some_id' } } };
    await TestBed.configureTestingModule({
      imports: [
        ClaimListComponent,
        CommonModule,
        HttpClientModule,
        TranslateModule,
      ],
      providers: [
        { provide: UtilService, useValue: utilServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: RouterService, useValue: routerServiceSpyObj },
        { provide: ClaimService, useClass: ClaimServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();
    routerServiceSpy = TestBed.inject(
      RouterService
    ) as jasmine.SpyObj<RouterService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to claim details page', () => {
    const id = 'test_id';
    const expectedRoute = ['claims/details', id];
    component.viewDetails(id);
    expect(routerServiceSpy.navigateArray).toHaveBeenCalledWith(expectedRoute);
  });
});

class ClaimServiceStub {
  getClaims(): void {
    console.log('hi');
  }
}
